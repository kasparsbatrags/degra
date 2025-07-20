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
import uuid from 'react-native-uuid'
import BackButton from '../../components/BackButton'
import Button from '../../components/Button'
import FormInput from '../../components/FormInput'
import freightAxios from '../../config/freightAxios'
import {COLORS, CONTAINER_WIDTH, FONT, SHADOWS} from '../../constants/theme'
import { useOnlineStatus } from '@/hooks/useNetwork'
import {addOfflineOperation, startOfflineQueueProcessing, stopOfflineQueueProcessing, processOfflineQueue} from '@/utils/offlineQueue'
import {isSessionActive, loadSessionEnhanced} from '@/utils/sessionUtils'
import {startSessionTimeoutCheck, stopSessionTimeoutCheck} from '@/utils/sessionTimeoutHandler'
import {executeQuery, executeSelect, executeSelectFirst} from '@/utils/database'
import {offlineDataManager} from '@/utils/offlineDataManager'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import {TruckRoutePage} from '@/models/TruckRoutePage'
import {mapTruckRoutePageModelToDto} from '@/mapers/TruckRoutePageMapper'

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
	const [syncStatus, setSyncStatus] = useState<{
		isLocal: boolean,
		isSynced: boolean,
		isInQueue: boolean,
		message?: string
	}>({
		isLocal: false,
		isSynced: false,
		isInQueue: false
	})
	
	const isOnline = useOnlineStatus()
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

	useEffect(() => {
		startSessionTimeoutCheck()
		
		// Start background sync processing
		if (Platform.OS !== 'web') {
			startOfflineQueueProcessing(15000) // Check every 15 seconds
		}

		return () => {
			stopSessionTimeoutCheck()
			// Stop background sync processing
			if (Platform.OS !== 'web') {
				stopOfflineQueueProcessing()
			}
		}
	}, [])

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

	// Monitor network status and trigger sync when coming back online
	useEffect(() => {
		if (isOnline && Platform.OS !== 'web') {
			// Trigger immediate sync when coming back online
			processOfflineQueue()
				.then(() => console.log('✅ Background sync completed'))
				.catch(error => console.warn('⚠️ Background sync failed:', error))
		}
	}, [isOnline])

	useEffect(() => {
		if (uid) {
			fetchRouteDetails()
			fetchTruckRoutes()
		}
	}, [uid])

	const fetchRouteDetails = async () => {
		try {
			setErrorMessage(null)

			if (isRedirectingToLogin) {
				setIsLoading(false)
				return
			}

			const sessionActive = await isSessionActive()
			if (!sessionActive) {
				const {SessionManager} = require('@/utils/SessionManager')
				await SessionManager.getInstance().handleUnauthorized()
				setIsLoading(false)
				return
			}

			// Use unified data manager approach
			try {
				const routePageDto = await offlineDataManager.getRoutePageByUid(uid)
				
				if (routePageDto) {
					setForm({
						dateFrom: new Date(routePageDto.dateFrom),
						dateTo: new Date(routePageDto.dateTo),
						truck: routePageDto.truck?.uid || '',
						fuelBalanceAtStart: routePageDto.fuelBalanceAtStart?.toString() || '',
						fuelBalanceAtFinish: routePageDto.fuelBalanceAtFinish?.toString() || '',
					})
					return
				}
			} catch (error) {
				console.warn('Failed to load from data manager:', error)
			}

			// Fallback to manual server call if data manager fails and we're online
			if (isOnline) {
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
					if (error.response?.status === 403) {
						const userFriendlyMessage = 'Jums nav piešķirtas tiesības - sazinieties ar Administratoru!'
						setErrorMessage(userFriendlyMessage)
					} else {
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
			setErrorMessage('Kļūda ielādējot datus')
		} finally {
			setIsLoading(false)
		}
	}

	const fetchTruckRoutes = async (page = 0) => {
		if (!uid) return;
		
		try {
			setPagination(prev => ({ ...prev, loading: true }));

			if (isRedirectingToLogin) {
				setPagination(prev => ({ ...prev, loading: false }));
				return
			}

			const sessionActive = await isSessionActive()
			if (!sessionActive) {
				const {SessionManager} = require('@/utils/SessionManager')
				await SessionManager.getInstance().handleUnauthorized()
				setPagination(prev => ({ ...prev, loading: false }));
				return
			}
			console.info("9999999999999999:",isOnline)
			if (isOnline) {
				try {
					const response = await freightAxios.get(
						`/truck-routes/by-page/${uid}`,
						{ params: { page, size: pagination.size } }
					);
					
					if (response.data.content) {
						if (page > 0 && Platform.OS !== 'web') {
							setTruckRoutes(prev => [...prev, ...response.data.content]);
						} else {
							setTruckRoutes(response.data.content);
						}
						
						setPagination({
							page: page,
							size: pagination.size,
							totalElements: response.data.totalElements || 0,
							totalPages: response.data.totalPages || 1,
							loading: false
						});
					} else {
						setTruckRoutes(response.data);
						setPagination(prev => ({
							...prev,
							totalPages: 1,
							loading: false
						}));
					}
				} catch (error: any) {
					if (error.response?.status === 403) {
						const userFriendlyMessage = 'Jums nav piešķirtas tiesības - sazinieties ar Administratoru!'
						setErrorMessage(userFriendlyMessage)
					} else {
						setErrorMessage('Neizdevās ielādēt braucienus')
					}
					setPagination(prev => ({ ...prev, loading: false }));
				}
			} else {
				setTruckRoutes([]);
				setPagination(prev => ({
					...prev,
					totalPages: 1,
					loading: false
				}));
			}
		} catch (error) {
			setPagination(prev => ({ ...prev, loading: false }));
		}
	}

	const handleSubmit = async () => {
		try {
			setIsSubmitting(true)
			setErrorMessage(null)

			if (isRedirectingToLogin) {
				setIsSubmitting(false)
				return
			}

			const sessionActive = await isSessionActive()
			if (!sessionActive) {
				const {SessionManager} = require('@/utils/SessionManager')
				await SessionManager.getInstance().handleUnauthorized()
				setIsSubmitting(false)
				return
			}

			const trucks = await offlineDataManager.getTrucks()
			const selectedTruck = trucks.find(t => t.uid === form.truck)
			const sessionData = await loadSessionEnhanced()
			const currentUser = sessionData.user

			if (!selectedTruck) {
				setErrorMessage('Izvēlētais auto nav atrasts')
				setIsSubmitting(false)
				return
			}

			const routePageModel: TruckRoutePage = {
				uid: uid || uuid.v4().toString(),
				date_from: format(form.dateFrom, 'yyyy-MM-dd'),
				date_to: format(form.dateTo, 'yyyy-MM-dd'),
				truck_uid: form.truck,
				user_id: currentUser.id,
				fuel_balance_at_start: parseFloat(form.fuelBalanceAtStart),
				fuel_balance_at_end: form.fuelBalanceAtFinish ? parseFloat(form.fuelBalanceAtFinish) : undefined,
				
				truck_maker: selectedTruck.truckMaker,
				truck_model: selectedTruck.truckModel,
				registration_number: selectedTruck.registrationNumber,
				fuel_consumption_norm: selectedTruck.fuelConsumptionNorm,
				is_default: selectedTruck.isDefault ? 1 : 0,
				
				email: currentUser.email,
				givenName: currentUser.givenName || currentUser.firstName,
				familyName: currentUser.familyName || currentUser.lastName,
				
				is_dirty: 1,
				is_deleted: 0,
				created_at: Date.now(),
				updated_at: Date.now()
			}

			const [routePageDto] = await mapTruckRoutePageModelToDto(
				[routePageModel],
				offlineDataManager.getTruckById.bind(offlineDataManager)
			)

			if (!routePageDto) {
				setErrorMessage('Kļūda sagatavot datus nosūtīšanai')
				setIsSubmitting(false)
				return
			}

			// UNIFIED OFFLINE-FIRST STRATEGY
			// Step 1: Always save locally first (all platforms)
			let localSaveSuccess = false
			try {
				if (Platform.OS !== 'web') {
					await offlineDataManager.saveTruckRoutePage(routePageDto)
					localSaveSuccess = true
					console.log('✅ Data saved locally')
					setSyncStatus(prev => ({
						...prev,
						isLocal: true,
						message: 'Dati saglabāti lokāli'
					}))
				}
			} catch (error) {
				console.error('❌ Failed to save locally:', error)
				setErrorMessage('Kļūda saglabājot datus lokāli')
				setIsSubmitting(false)
				return
			}

			// Step 2: Try server sync if online
			let serverSyncSuccess = false
			if (isOnline) {
				try {
					if (uid) {
						await freightAxios.put(`/route-pages/${uid}`, routePageDto)
					} else {
						await freightAxios.post('/route-pages', routePageDto)
					}
					serverSyncSuccess = true
					console.log('✅ Data synced with server')
					setSyncStatus(prev => ({
						...prev,
						isSynced: true,
						isInQueue: false,
						message: 'Dati sinhronizēti ar serveri'
					}))
					
					// Mark as synced in local database if mobile
					if (Platform.OS !== 'web' && routePageDto.uid) {
						try {
							await executeQuery(
								'UPDATE truck_route_page SET is_dirty = 0, updated_at = ? WHERE uid = ?',
								[Date.now(), routePageDto.uid]
							)
						} catch (error) {
							console.warn('⚠️ Failed to mark as synced:', error)
						}
					}
				} catch (error: any) {
					console.error('❌ Server sync failed:', error)
					
					if (error.response?.status === 403) {
						const userFriendlyMessage = 'Jums nav piešķirtas tiesības - sazinieties ar Administratoru!'
						setErrorMessage(userFriendlyMessage)
						setIsSubmitting(false)
						return
					}
					// Continue to offline queue handling
				}
			}

			// Step 3: Add to offline queue if sync failed or offline
			if (!serverSyncSuccess) {
				try {
					await addOfflineOperation(
						uid ? 'UPDATE' : 'CREATE',
						'truck_route_page',
						uid ? `/route-pages/${uid}` : '/route-pages',
						routePageDto
					)
					console.log('📋 Added to offline queue')
					setSyncStatus(prev => ({
						...prev,
						isInQueue: true,
						message: isOnline ? 'Pievienots sinhronizācijas rindai' : 'Saglabāts offline režīmā'
					}))
				} catch (error) {
					console.error('❌ Failed to add to offline queue:', error)
				}
			}

			// Step 4: Navigate with appropriate feedback
			if (Platform.OS === 'web' && !serverSyncSuccess) {
				setErrorMessage('Nav interneta savienojuma - dati saglabāti offline režīmā')
				setTimeout(() => router.push('/(tabs)'), 2000)
			} else {
				// Success - navigate immediately
				setTimeout(() => router.push('/(tabs)'), localSaveSuccess || serverSyncSuccess ? 500 : 1500)
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

				{!isOnline && Platform.OS !== 'web' && (
					<View style={styles.offlineIndicator}>
						<MaterialIcons name="cloud-off" size={16} color={COLORS.highlight} />
						<Text style={styles.offlineText}>Offline režīms</Text>
					</View>
				)}

				{/* Sync Status Indicator */}
				{Platform.OS !== 'web' && syncStatus.message && (
					<View style={[
						styles.syncStatusIndicator,
						syncStatus.isSynced && styles.syncStatusSynced,
						syncStatus.isInQueue && styles.syncStatusQueued,
						syncStatus.isLocal && !syncStatus.isSynced && !syncStatus.isInQueue && styles.syncStatusLocal
					]}>
						{syncStatus.isSynced && <MaterialIcons name="cloud-done" size={16} color="#4CAF50" />}
						{syncStatus.isInQueue && <MaterialIcons name="cloud-queue" size={16} color="#FF9800" />}
						{syncStatus.isLocal && !syncStatus.isSynced && !syncStatus.isInQueue && <MaterialIcons name="save" size={16} color="#2196F3" />}
						<Text style={[
							styles.syncStatusText,
							syncStatus.isSynced && styles.syncStatusTextSynced,
							syncStatus.isInQueue && styles.syncStatusTextQueued,
							syncStatus.isLocal && !syncStatus.isSynced && !syncStatus.isInQueue && styles.syncStatusTextLocal
						]}>
							{syncStatus.message}
						</Text>
					</View>
				)}

				{errorMessage && (
					<View style={styles.errorContainer}>
						<Text style={styles.errorText}>{errorMessage}</Text>
					</View>
				)}

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
	syncStatusIndicator: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: 'rgba(33, 150, 243, 0.1)',
		borderRadius: 6,
		paddingVertical: 6,
		paddingHorizontal: 12,
		marginBottom: 12,
		borderWidth: 1,
		borderColor: 'rgba(33, 150, 243, 0.3)',
	},
	syncStatusSynced: {
		backgroundColor: 'rgba(76, 175, 80, 0.1)',
		borderColor: 'rgba(76, 175, 80, 0.3)',
	},
	syncStatusQueued: {
		backgroundColor: 'rgba(255, 152, 0, 0.1)',
		borderColor: 'rgba(255, 152, 0, 0.3)',
	},
	syncStatusLocal: {
		backgroundColor: 'rgba(33, 150, 243, 0.1)',
		borderColor: 'rgba(33, 150, 243, 0.3)',
	},
	syncStatusText: {
		fontSize: 12,
		fontFamily: FONT.medium,
		color: '#2196F3',
		marginLeft: 6,
	},
	syncStatusTextSynced: {
		color: '#4CAF50',
	},
	syncStatusTextQueued: {
		color: '#FF9800',
	},
	syncStatusTextLocal: {
		color: '#2196F3',
	},
})
