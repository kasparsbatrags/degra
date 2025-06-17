import FormDatePicker from '@/components/FormDatePicker'
import ImprovedFormDropdown from '@/components/ImprovedFormDropdown'
import Pagination from '@/components/Pagination'
import {commonStyles, formStyles} from '@/constants/styles'
import {isRedirectingToLogin} from '@/config/axios'
import {format} from 'date-fns'
import {router, useLocalSearchParams} from 'expo-router'
import React, {useEffect, useState} from 'react'
import {ActivityIndicator, FlatList, Platform, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import BackButton from '../../components/BackButton'
import Button from '../../components/Button'
import FormInput from '../../components/FormInput'
import freightAxios from '../../config/freightAxios'
import {COLORS, CONTAINER_WIDTH, FONT, SHADOWS} from '../../constants/theme'
import { useNetworkStatus } from '../../hooks/useNetworkStatus'
import { isConnected } from '@/utils/networkUtils'
import {addOfflineOperation} from '@/utils/offlineQueue'
import {isSessionActive, loadSessionEnhanced} from '@/utils/sessionUtils'
import {startSessionTimeoutCheck, stopSessionTimeoutCheck} from '@/utils/sessionTimeoutHandler'
import {executeQuery, executeSelect, executeSelectFirst} from '@/utils/database'
import {offlineDataManagerExtended} from '@/utils/offlineDataManagerExtended'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import {TruckRoutePage} from '@/models/TruckRoutePage'
import {mapTruckRoutePageModelToDto} from '@/mapers/TruckRoutePageMapper'
import {TruckRoutePageDto} from '@/dto/TruckRoutePageDto'

// Simple ID generation without crypto dependencies
function generateOfflineId(): string {
	// Use timestamp + multiple random parts for better uniqueness
	const timestamp = Date.now().toString()
	const randomPart1 = Math.random().toString(36).substr(2, 9)
	const randomPart2 = Math.random().toString(36).substr(2, 5)
	return `offline-${timestamp}-${randomPart1}-${randomPart2}`
}

interface TruckRoutePageForm {
	dateFrom: Date;
	dateTo: Date;
	truck: string;
	fuelBalanceAtStart: string;
	fuelBalanceAtFinish: string;
}

interface TruckRoute {
	uid: string;
	routeDate: string;
	outTruckObject: { uid: string; name?: string };
	inTruckObject: { uid: string; name?: string };
	odometerAtStart: number | null;
	odometerAtFinish: number | null;
	cargoVolume: number | null;
	unitType: string | null;
	fuelBalanceAtStart: number | null;
	fuelReceived: number | null;
	fuelBalanceAtFinish: number | null;
	outDateTime: string;
	inDateTime: string | null;
}


export default function TruckRoutePageScreen() {
	const {uid} = useLocalSearchParams<{ uid: string }>()
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isLoading, setIsLoading] = useState(!!uid)
	const [isEditMode, setIsEditMode] = useState(true)
	const [activeTab, setActiveTab] = useState<'basic' | 'routes'>('basic')
	const [truckRoutes, setTruckRoutes] = useState<TruckRoute[]>([])
	const [errorMessage, setErrorMessage] = useState<string | null>(null)
	
	// Izmantot jauno useNetworkStatus hook
	const { isOfflineMode: isOfflineModeActive } = useNetworkStatus()
	const [pagination, setPagination] = useState({
		page: 0,
		size: 5,
		totalElements: 0,
		totalPages: 1,
		loading: false
	})
	const [form, setForm] = useState<TruckRoutePageForm>({
		dateFrom: new Date(),
		dateTo: new Date(),
		truck: '',
		fuelBalanceAtStart: '',
		fuelBalanceAtFinish: '',
	})

	// Start periodic session check for all platforms
	useEffect(() => {
		// Start session check
		startSessionTimeoutCheck()

		// Stop session check when component is unmounted
		return () => {
			stopSessionTimeoutCheck()
		}
	}, [])

	// Check session status when component is loaded
	useEffect(() => {
		const checkSession = async () => {
			const sessionActive = await isSessionActive()
			if (!sessionActive) {
				const {SessionManager} = require('@/utils/SessionManager')
				await SessionManager.getInstance().handleUnauthorized()
				return
			}
		}

		checkSession()
	}, [])


	useEffect(() => {
		if (uid) {
			fetchRouteDetails()
			fetchTruckRoutes()
		}
	}, [uid])

	const fetchRouteDetails = async () => {
		try {
			// Clear previous error message
			setErrorMessage(null)

			// Check if redirection to login page is already in progress
			if (isRedirectingToLogin) {
				setIsLoading(false)
				return
			}

			// Check if session is active
			const sessionActive = await isSessionActive()
			if (!sessionActive) {
				const {SessionManager} = require('@/utils/SessionManager')
				await SessionManager.getInstance().handleUnauthorized()
				setIsLoading(false)
				return
			}

			// OFFLINE-FIRST APPROACH FOR MOBILE
			if (Platform.OS !== 'web') {
				console.log('📱 [Mobile] Fetching route details offline-first for uid:', uid)
				
				try {
					// First try to get from local database
					const sql = `
						SELECT trp.*, 
							   t.truck_maker, t.truck_model, t.registration_number, t.fuel_consumption_norm,
							   u.email, u.given_name, u.family_name
						FROM truck_route_page trp
						LEFT JOIN truck t ON trp.truck_uid = t.uid
						LEFT JOIN user u ON trp.user_id = u.id
						WHERE trp.uid = ? AND trp.is_deleted = 0
						LIMIT 1
					`
					
					const localRouteData = await executeSelectFirst(sql, [uid])
					
					if (localRouteData) {
						console.log('📱 [Mobile] Found route data in local database:', localRouteData)
						
						setForm({
							dateFrom: new Date(localRouteData.date_from),
							dateTo: new Date(localRouteData.date_to),
							truck: localRouteData.truck_uid || '',
							fuelBalanceAtStart: localRouteData.fuel_balance_at_start?.toString() || '',
							fuelBalanceAtFinish: localRouteData.fuel_balance_at_end?.toString() || '',
						})
						
						return
					} else {
						console.log('📱 [Mobile] No local data found, checking network...')
					}
				} catch (error) {
					console.error('📱 [Mobile] Error fetching from local database:', error)
				}
			}

			// Check network connectivity
			const connected = await isConnected()
			
			if (connected) {
				try {
					const response = await freightAxios.get(`/route-pages/${uid}`)
					const routeData = response.data

					setForm({
						dateFrom: new Date(routeData.dateFrom),
						dateTo: new Date(routeData.dateTo),
						truck: routeData.truck?.uid || '',
						fuelBalanceAtStart: routeData.fuelBalanceAtStart.toString(),
						fuelBalanceAtFinish: routeData.fuelBalanceAtFinish?.toString() ?? '',
					})
				} catch (error: any) {
					// Handle 403 Forbidden error
					if (error.response?.status === 403) {
						const userFriendlyMessage = 'Jums nav piešķirtas tiesības - sazinieties ar Administratoru!'
						setErrorMessage(userFriendlyMessage)
						console.error('Access denied:', userFriendlyMessage)
					} else {
						console.error('Failed to fetch route details:', error)
						setErrorMessage('Neizdevās ielādēt maršruta datus')
					}
				}
			} else {
				if (Platform.OS === 'web') {
					setErrorMessage('Nav interneta savienojuma - dati nav pieejami offline režīmā')
				} else {
					setErrorMessage('Nav interneta savienojuma - rādīti lokālie dati')
				}
			}
		} catch (error) {
			console.error('Error in fetchRouteDetails:', error)
			setErrorMessage('Kļūda ielādējot datus')
		} finally {
			setIsLoading(false)
		}
	}

	const fetchTruckRoutes = async (page = 0) => {
		if (!uid) return;
		
		try {
			setPagination(prev => ({ ...prev, loading: true }));

			// Check if redirection to login page is already in progress
			if (isRedirectingToLogin) {
				setPagination(prev => ({ ...prev, loading: false }));
				return
			}

			// Check if session is active
			const sessionActive = await isSessionActive()
			if (!sessionActive) {
				const {SessionManager} = require('@/utils/SessionManager')
				await SessionManager.getInstance().handleUnauthorized()
				setPagination(prev => ({ ...prev, loading: false }));
				return
			}

			// Check network connectivity
			const connected = await isConnected()
			
			if (connected) {
				try {
					const response = await freightAxios.get(
						`/truck-routes/by-page/${uid}`,
						{ params: { page, size: pagination.size } }
					);
					
					// Handle paginated response
					if (response.data.content) {
						// If loading more (page > 0 and not the first page), append to existing routes
						if (page > 0 && Platform.OS !== 'web') {
							setTruckRoutes(prev => [...prev, ...response.data.content]);
						} else {
							setTruckRoutes(response.data.content);
						}
						
						// Update pagination metadata
						setPagination({
							page: page,
							size: pagination.size,
							totalElements: response.data.totalElements || 0,
							totalPages: response.data.totalPages || 1,
							loading: false
						});
					} else {
						// Handle non-paginated response (fallback)
						setTruckRoutes(response.data);
						setPagination(prev => ({
							...prev,
							totalPages: 1,
							loading: false
						}));
					}
				} catch (error: any) {
					// Handle 403 Forbidden error
					if (error.response?.status === 403) {
						const userFriendlyMessage = 'Jums nav piešķirtas tiesības - sazinieties ar Administratoru!'
						setErrorMessage(userFriendlyMessage)
						console.error('Access denied:', userFriendlyMessage)
					} else {
						console.error('Failed to fetch truck routes:', error);
						setErrorMessage('Neizdevās ielādēt braucienus')
					}
					setPagination(prev => ({ ...prev, loading: false }));
				}
			} else {
				// Offline mode - no truck routes available
				setTruckRoutes([]);
				setPagination(prev => ({
					...prev,
					totalPages: 1,
					loading: false
				}));
				console.log('Offline mode - truck routes not available');
			}
		} catch (error) {
			console.error('Error in fetchTruckRoutes:', error);
			setPagination(prev => ({ ...prev, loading: false }));
		}
	}

	const handleSubmit = async () => {
		try {
			setIsSubmitting(true)
			setErrorMessage(null)

			// Check if redirection to login page is already in progress
			if (isRedirectingToLogin) {
				setIsSubmitting(false)
				return
			}

			// Check if session is active
			const sessionActive = await isSessionActive()
			if (!sessionActive) {
				const {SessionManager} = require('@/utils/SessionManager')
				await SessionManager.getInstance().handleUnauthorized()
				setIsSubmitting(false)
				return
			}

			// Get full truck and user objects
			const trucks = await offlineDataManagerExtended.getTrucks()
			const selectedTruck = trucks.find(t => t.uid === form.truck)
			const sessionData = await loadSessionEnhanced()
			const currentUser = sessionData.user

			if (!selectedTruck) {
				setErrorMessage('Izvēlētais auto nav atrasts')
				setIsSubmitting(false)
				return
			}

			// Create TruckRoutePage model object with all required fields
			const routePageModel: TruckRoutePage = {
				uid: uid || generateOfflineId(),
				date_from: format(form.dateFrom, 'yyyy-MM-dd'),
				date_to: format(form.dateTo, 'yyyy-MM-dd'),
				truck_uid: form.truck,
				user_id: currentUser.id,
				fuel_balance_at_start: parseFloat(form.fuelBalanceAtStart),
				fuel_balance_at_end: form.fuelBalanceAtFinish ? parseFloat(form.fuelBalanceAtFinish) : undefined,
				
				// Include truck information for proper DTO mapping
				truck_maker: selectedTruck.truckMaker,
				truck_model: selectedTruck.truckModel,
				registration_number: selectedTruck.registrationNumber,
				fuel_consumption_norm: selectedTruck.fuelConsumptionNorm,
				is_default: selectedTruck.isDefault ? 1 : 0,
				
				// Include user information for proper DTO mapping
				email: currentUser.email,
				givenName: currentUser.givenName || currentUser.firstName,
				familyName: currentUser.familyName || currentUser.lastName,
				
				// Offline tracking fields
				is_dirty: 1,
				is_deleted: 0,
				created_at: Date.now(),
				updated_at: Date.now()
			}

			console.log('📱 [DEBUG] Created route page model:', routePageModel)

			const [routePageDto] = await mapTruckRoutePageModelToDto([routePageModel])

			console.log('📱 [DEBUG] ----------------:', routePageDto)

			if (!routePageDto) {
				setErrorMessage('Kļūda sagatavot datus nosūtīšanai')
				setIsSubmitting(false)
				return
			}

			console.log('📱 [DEBUG] Transformed to DTO:', routePageDto)

			// OFFLINE-FIRST APPROACH FOR MOBILE
			if (Platform.OS !== 'web') {
				console.log('📱 [Mobile] Saving data offline-first')
				
				try {
					if (uid) {
						// UPDATE existing route page in local database
						const updateSql = `
							UPDATE truck_route_page 
							SET date_from = ?, date_to = ?, truck_uid = ?, 
								fuel_balance_at_start = ?, fuel_balance_at_end = ?,
								is_dirty = 1, updated_at = ?
							WHERE uid = ?
						`
						
						await executeQuery(updateSql, [
							routePageModel.date_from,
							routePageModel.date_to,
							routePageModel.truck_uid,
							routePageModel.fuel_balance_at_start,
							routePageModel.fuel_balance_at_end,
							Date.now(),
							uid
						])
						
						console.log('📱 [Mobile] Updated route page in local database')
					} else {
						// CREATE new route page in local database
						const insertSql = `
							INSERT INTO truck_route_page 
							(uid, date_from, date_to, truck_uid, user_id, 
							 fuel_balance_at_start, fuel_balance_at_end, 
							 is_dirty, is_deleted, created_at, updated_at)
							VALUES (?, ?, ?, ?, ?, ?, ?, 1, 0, ?, ?)
						`
						
						await executeQuery(insertSql, [
							routePageModel.uid,
							routePageModel.date_from,
							routePageModel.date_to,
							routePageModel.truck_uid,
							routePageModel.user_id,
							routePageModel.fuel_balance_at_start,
							routePageModel.fuel_balance_at_end,
							Date.now(),
							Date.now()
						])
						
						console.log('📱 [Mobile] Created new route page in local database with uid:', routePageModel.uid)
					}
					
					// Add DTO to offline queue for server synchronization
					await addOfflineOperation(
						uid ? 'UPDATE' : 'CREATE',
						'truck_route_page',
						uid ? `/route-pages/${uid}` : '/route-pages',
						routePageDto
					)
					
					console.log('📱 [Mobile] Data saved locally and added to sync queue')
					
					// Navigate back immediately after local save
					setTimeout(() => router.push('/(tabs)'), 1500)
					return
					
				} catch (error) {
					console.error('📱 [Mobile] Error saving to local database:', error)
					// Fall back to online save if local save fails
				}
			}

			// Check network connectivity for web or fallback
			const connected = await isConnected()
			
			if (connected) {
				try {
					if (uid) {
						await freightAxios.put(`/route-pages/${uid}`, routePageDto)
					} else {
						await freightAxios.post('/route-pages', routePageDto)
					}
					router.push('/(tabs)')
				} catch (error: any) {
					// Handle 403 Forbidden error
					if (error.response?.status === 403) {
						const userFriendlyMessage = 'Jums nav piešķirtas tiesības - sazinieties ar Administratoru!'
						setErrorMessage(userFriendlyMessage)
						console.error('Access denied:', userFriendlyMessage)
					} else {
						console.error('Failed to submit form online:', error)
						// Add to offline queue as fallback
						await addOfflineOperation(
							uid ? 'UPDATE' : 'CREATE',
							'truck_route_page',
							uid ? `/route-pages/${uid}` : '/route-pages',
							routePageDto
						)
						// Still navigate back after offline save
						setTimeout(() => router.push('/(tabs)'), 2000)
					}
				}
			} else {
				// Offline mode - add to queue only (for web or mobile fallback)
				await addOfflineOperation(
					uid ? 'UPDATE' : 'CREATE',
					'truck_route_page',
					uid ? `/route-pages/${uid}` : '/route-pages',
					routePageDto
				)
				console.log('Data saved to offline queue')
				// Navigate back after offline save
				setTimeout(() => router.push('/(tabs)'), 2000)
			}
		} catch (error) {
			console.error('Error in handleSubmit:', error)
			setErrorMessage('Kļūda saglabājot datus')
		} finally {
			setIsSubmitting(false)
		}
	}

	if (isLoading) {
		return (<SafeAreaView style={styles.container}>
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color={COLORS.secondary} />
			</View>
		</SafeAreaView>)
	}

	return (<SafeAreaView style={styles.container}>
		<ScrollView>
			<View style={styles.content}>
				<Text style={styles.title}>
					{uid ? (isEditMode ? 'Rediģēt maršruta lapu' : 'Maršruta lapa') : 'Pievienot maršruta lapu'}
				</Text>

				{/* Offline mode indicator */}
				{isOfflineModeActive && Platform.OS !== 'web' && (
					<View style={styles.offlineIndicator}>
						<MaterialIcons name="cloud-off" size={16} color={COLORS.highlight} />
						<Text style={styles.offlineText}>Offline režīms</Text>
					</View>
				)}

				{/* Error message */}
				{errorMessage && (
					<View style={styles.errorContainer}>
						<Text style={styles.errorText}>{errorMessage}</Text>
					</View>
				)}

				{/* Tab buttons */}
				{uid && (
					<View style={styles.tabContainer}>
						<Pressable
							style={[styles.tabButton, activeTab === 'basic' && styles.tabButtonActive]}
							onPress={() => setActiveTab('basic')}
						>
							<Text style={[styles.tabText, activeTab === 'basic' && styles.tabTextActive]}>Pamatinformācija</Text>
						</Pressable>
						<Pressable
							style={[styles.tabButton, activeTab === 'routes' && styles.tabButtonActive]}
							onPress={() => setActiveTab('routes')}
						>
							<Text style={[styles.tabText, activeTab === 'routes' && styles.tabTextActive]}>Braucieni</Text>
						</Pressable>
					</View>
				)}

				{/* Tab content */}
				{activeTab === 'basic' && (
					<>
						<View style={styles.inputWrapper}>
							<View style={[formStyles.inputContainer, styles.truckField]}>
								<ImprovedFormDropdown
										label="Auto"
										value={form.truck}
										onSelect={(value: string) => setForm(prevForm => ({...prevForm, truck: value}))}
										placeholder="Izvēlieties"
										endpoint="/trucks"
										disabled={!isEditMode}
										// error={!form.routePageTruck ? 'Ievadiet datus!' : undefined}
								/>
							</View>
						</View>

						<View style={commonStyles.row}>
							<FormDatePicker
									label="Sākums"
									value={form.dateFrom}
									onChange={(date) => setForm(prevForm => ({...prevForm, dateFrom: date}))}
									error="Lauks ir obligāts"
									showError={!form.dateFrom}
									disabled={!isEditMode}
							/>
							<FormDatePicker
									label="Beigas"
									value={form.dateTo}
									onChange={(date) => setForm(prevForm => ({...prevForm, dateTo: date}))}
									error="Lauks ir obligāts"
									showError={!form.dateTo}
									disabled={!isEditMode}
							/>
						</View>

						<View style={commonStyles.row}>
							<View style={styles.inputWrapper}>
								<FormInput
										label="Degviela sākumā"
										value={form.fuelBalanceAtStart}
										onChangeText={(text) => {
											if (isEditMode && /^\d*\.?\d*$/.test(text)) {
												setForm(prevForm => ({...prevForm, fuelBalanceAtStart: text}))
											}
										}}
										placeholder="Ievadiet degvielas atlikumu"
										keyboardType="numeric"
										editable={isEditMode}
								/>
							</View>
							<View style={styles.inputWrapper}>
								<FormInput
										label="Degviela beigās"
										value={form.fuelBalanceAtFinish}
										onChangeText={(text) => {
											if (isEditMode && /^\d*\.?\d*$/.test(text)) {
												setForm(prevForm => ({...prevForm, fuelBalanceAtFinish: text}))
											}
										}}
										placeholder="Ievadiet degvielas atlikumu"
										keyboardType="numeric"
										editable={isEditMode}
								/>
							</View>
						</View>
					</>
				)}

				{activeTab === 'routes' && (
					<View style={styles.routesContainer}>
						{truckRoutes.length > 0 ? (
							<>
								<FlatList
									data={truckRoutes}
									keyExtractor={(item) => item.uid}
									renderItem={({ item: route }) => (
										<View style={styles.routeCard}>
											<View style={styles.routeRow}>
												<Text style={styles.routeLabelInline}>Datums:</Text>
												<Text style={styles.routeText}>
													{new Date(route.routeDate).toLocaleDateString('lv-LV', {
														day: '2-digit', month: '2-digit', year: 'numeric'
													})}
												</Text>
											</View>
											<View style={styles.routeRow}>
												<Text style={styles.routeLabelInline}>No:</Text>
												<Text style={styles.routeText}>{route.outTruckObject?.name || '-'}</Text>
											</View>
											<View style={styles.routeRow}>
												<Text style={styles.routeLabelInline}>Uz:</Text>
												<Text style={styles.routeText}>{route.inTruckObject?.name || '-'}</Text>
											</View>
											<View style={styles.routeRow}>
												<Text style={styles.routeLabelInline}>Odometrs:</Text>
												<Text style={styles.routeText}>
													{route.odometerAtStart} - {route.odometerAtFinish} km
												</Text>
											</View>
											{route.cargoVolume && (
												<View style={styles.routeRow}>
													<Text style={styles.routeLabelInline}>Krava:</Text>
													<Text style={styles.routeText}>
														{route.cargoVolume} {route.unitType}
													</Text>
												</View>
											)}
										</View>
									)}
									scrollEnabled={false}
									ListFooterComponent={
										<Pagination
											currentPage={pagination.page}
											totalPages={pagination.totalPages}
											loading={pagination.loading}
											onPageChange={(page) => fetchTruckRoutes(page)}
										/>
									}
								/>
							</>
						) : (
							<Text style={styles.emptyText}>Nav braucienu</Text>
						)}
					</View>
				)}
				<View style={styles.buttonContainer}>
					<BackButton
							onPress={() => router.push('/(tabs)')}
							style={styles.backButton}
					/>
					<Button
							title="Saglabāt"
							onPress={handleSubmit}
							style={styles.submitButton}
							disabled={isSubmitting}
					/>
				</View>
			</View>
		</ScrollView>
	</SafeAreaView>)
}

const styles = StyleSheet.create({
	truckField: {
		flex: 1, marginTop: -4,
	},
	container: {
		flex: 1, backgroundColor: COLORS.primary,
	}, 
	loadingContainer: {
		flex: 1, justifyContent: 'center', alignItems: 'center',
	}, 
	content: Platform.OS === 'web' ? {
		flex: 1, paddingHorizontal: 16, marginVertical: 24, width: '100%', maxWidth: CONTAINER_WIDTH.web, alignSelf: 'center',
	} : {
		flex: 1, paddingHorizontal: 16, marginVertical: 24, width: CONTAINER_WIDTH.mobile, alignSelf: 'center' as const,
	}, 
	title: {
		fontSize: 24, fontFamily: FONT.semiBold, color: COLORS.white, marginBottom: 24,
	}, 
	editButton: {
		marginBottom: 16, backgroundColor: COLORS.secondary,
	}, 
	notificationContainer: Platform.OS === 'web' ? {
		backgroundColor: COLORS.black100, padding: 12, borderRadius: 8, marginBottom: 16, borderWidth: 2, borderColor: COLORS.secondary,
	} : {
		backgroundColor: COLORS.black100, padding: 12, borderRadius: 8, marginBottom: 16, borderWidth: 2, borderColor: COLORS.secondary,
		...SHADOWS.medium,
	}, 
	notificationText: {
		color: COLORS.white, fontSize: 18, fontFamily: FONT.semiBold, textAlign: 'center',
	}, 
	dateSection: Platform.OS === 'web' ? {
		backgroundColor: COLORS.black100, padding: 16, borderRadius: 8, marginBottom: 24,
		borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)',
		...SHADOWS.small,
	} : {
		backgroundColor: COLORS.black100, padding: 16, borderRadius: 8, marginBottom: 24,
		borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.15)',
		...SHADOWS.medium,
	}, 
	buttonContainer: {
		flexDirection: 'row', justifyContent: 'space-between', gap: 16, marginTop: 24,
	}, 
	backButton: Platform.OS === 'web' ? {
		flex: 1, backgroundColor: COLORS.black100,
		borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)',
		...SHADOWS.small,
	} : {
		flex: 1, backgroundColor: COLORS.black100,
		borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.15)',
		...SHADOWS.medium,
	}, 
	submitButton: Platform.OS === 'web' ? {
		flex: 1,
		...SHADOWS.small,
	} : {
		flex: 1,
		...SHADOWS.medium,
	}, 
	dateContainer: {
		marginBottom: 16,
	}, 
	label: {
		fontSize: 16, fontFamily: FONT.medium, color: COLORS.white, marginBottom: 8,
	}, 
	dateButton: Platform.OS === 'web' ? {
		backgroundColor: COLORS.black100, padding: 12, borderRadius: 8,
		borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)',
		...SHADOWS.small,
	} : {
		backgroundColor: COLORS.black100, padding: 12, borderRadius: 8,
		borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.15)',
		...SHADOWS.medium,
	}, 
	disabled: {
		opacity: 0.5,
	}, 
	dateText: {
		color: COLORS.white, fontSize: 16, fontFamily: FONT.regular,
	}, 
	modalOverlay: {
		flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center',
	}, 
	modalContent: Platform.OS === 'web' ? {
		backgroundColor: COLORS.black100, padding: 16, borderRadius: 12, width: '90%', maxWidth: 400,
		borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)',
		...SHADOWS.small,
	} : {
		backgroundColor: COLORS.black100, padding: 16, borderRadius: 12, width: '90%', maxWidth: 400,
		borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.15)',
		...SHADOWS.medium,
	}, 
	calendarHeader: {
		flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
	}, 
	monthButton: {
		padding: 8,
	}, 
	monthButtonText: {
		color: COLORS.white, fontSize: 24, fontFamily: FONT.medium,
	}, 
	monthYearText: {
		color: COLORS.white, fontSize: 16, fontFamily: FONT.medium, textTransform: 'capitalize',
	}, 
	weekDaysRow: {
		flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8,
	}, 
	weekDayText: {
		width: '14.28%',
		textAlign: 'center',
		color: COLORS.white,
		marginBottom: 8,
		fontSize: 12,
		fontFamily: FONT.medium,
		textTransform: 'uppercase',
	}, 
	daysGrid: {
		flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingTop: 8,
	}, 
	dayButton: {
		width: '14.28%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', marginVertical: 4, borderRadius: 8,
	}, 
	dayText: {
		color: COLORS.white, fontSize: 14, fontFamily: FONT.regular,
	}, 
	selectedDay: {
		backgroundColor: COLORS.secondary,
	}, 
	todayDay: {
		borderWidth: 1, borderColor: COLORS.secondary,
	}, 
	selectedDayText: {
		color: COLORS.white, fontFamily: FONT.bold,
	}, 
	todayDayText: {
		color: COLORS.secondary, fontFamily: FONT.medium,
	}, 
	inputWrapper: {
		flex: 1
	},
	tabContainer: Platform.OS === 'web' ? {
		flexDirection: 'row',
		marginBottom: 16,
		borderRadius: 8,
		overflow: 'hidden',
		backgroundColor: COLORS.black200,
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.08)',
	} : {
		flexDirection: 'row',
		marginBottom: 16,
		borderRadius: 8,
		overflow: 'hidden',
		backgroundColor: COLORS.black200,
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.2)', // Increased opacity for mobile
	},
	tabButton: {
		flex: 1,
		paddingVertical: 8,
		paddingHorizontal: 12,
		alignItems: 'center',
	},
	tabButtonActive: Platform.OS === 'web' ? {
		backgroundColor: COLORS.secondary,
		...SHADOWS.small,
	} : {
		backgroundColor: COLORS.secondary,
		...SHADOWS.medium, // Using medium shadows for better visibility on mobile
	},
	tabText: {
		fontSize: 14,
		fontFamily: FONT.medium,
		color: COLORS.gray,
	},
	tabTextActive: {
		color: COLORS.white,
		fontFamily: FONT.semiBold,
	},
	routesContainer: {
		marginTop: 16,
	},
	routeCard: Platform.OS === 'web' ? {
		backgroundColor: COLORS.black100,
		borderRadius: 8,
		padding: 16,
		marginBottom: 12,
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.05)',
		...SHADOWS.small,
	} : {
		backgroundColor: COLORS.black100,
		borderRadius: 8,
		padding: 16,
		marginBottom: 12,
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.15)', // Increased opacity for mobile
		...SHADOWS.medium, // Using medium shadows for better visibility on mobile
	},
	routeRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 8,
	},
	routeLabelInline: {
		fontSize: 14,
		fontFamily: FONT.medium,
		color: COLORS.gray,
		marginRight: 8,
		flex: 0.33,
	},
	routeText: {
		fontSize: 16,
		fontFamily: FONT.semiBold,
		color: COLORS.white,
		flex: 0.67,
		textAlign: 'right',
	},
	emptyText: {
		fontSize: 16,
		fontFamily: FONT.regular,
		color: COLORS.gray,
		textAlign: 'center',
		marginTop: 24,
	},
	offlineIndicator: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: 'rgba(255, 193, 7, 0.1)',
		borderRadius: 6,
		paddingVertical: 6,
		paddingHorizontal: 12,
		marginBottom: 12,
		borderWidth: 1,
		borderColor: 'rgba(255, 193, 7, 0.3)',
	},
	offlineText: {
		fontSize: 12,
		fontFamily: FONT.medium,
		color: COLORS.highlight,
		marginLeft: 6,
	},
	errorContainer: {
		backgroundColor: 'rgba(255, 0, 0, 0.1)',
		borderRadius: 8,
		padding: 12,
		marginBottom: 16,
		borderWidth: 1,
		borderColor: 'rgba(255, 0, 0, 0.3)',
	},
	errorText: {
		fontSize: 14,
		fontFamily: FONT.medium,
		color: '#FF6B6B',
		textAlign: 'center',
	},
})
