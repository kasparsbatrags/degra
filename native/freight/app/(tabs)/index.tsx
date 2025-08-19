import {isRedirectingToLogin} from '@/config/axios'
import {COLORS, CONTAINER_WIDTH, FONT, SHADOWS} from '@/constants/theme'
import {useAuth} from '@/context/AuthContext'
import {TruckRoutePageDto} from '@/dto/TruckRoutePageDto'
import { useOnlineStatus } from '@/hooks/useNetwork'
import { usePlatform } from '@/hooks/usePlatform'
import {getRoutePages, downloadServerData, offlineDataManager, deleteRoutePage} from '@/utils/offlineDataManager'
import {startSessionTimeoutCheck, stopSessionTimeoutCheck} from '@/utils/sessionTimeoutHandler'
import {isSessionActive} from '@/utils/sessionUtils'
import {RoutePageDataManager} from '@/utils/data-managers/RoutePageDataManager'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import {useFocusEffect, useRouter} from 'expo-router'
import React, {useCallback, useEffect, useState, useMemo} from 'react'
import {ActivityIndicator, FlatList, Platform, Pressable, RefreshControl, StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle, Dimensions, ScrollView} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import Button from '../../components/Button'
import ModernButton from '../../components/ModernButton'
import { ModernRouteCard, TabType } from '../../components/web/ModernRouteCard'
import RouteTable from '../../components/web/RouteTable'


export default function HomeScreen() {
	const {user} = useAuth()
	const { isWeb } = usePlatform()
	const router = useRouter()
	const [routes, setRoutes] = useState<TruckRoutePageDto[]>([])
	const [loading, setLoading] = useState(true)
	const [buttonText, setButtonText] = useState('Starts')
	const [errorMessage, setErrorMessage] = useState<string | null>(null)
	const [statusCheckLoading, setStatusCheckLoading] = useState(false)
	const [deletingRoute, setDeletingRoute] = useState<string | null>(null)

	const isOnline = useOnlineStatus()

	// Check session status when component is loaded
	useEffect(() => {
		const checkSession = async () => {
			const sessionActive = await isSessionActive()
			console.log(sessionActive)
			if (!sessionActive) {
				// Use the shared redirectToLogin function from axios.ts
				// This will handle redirection properly for both web and mobile
				const {SessionManager} = require('@/utils/SessionManager')
				await SessionManager.getInstance().handleUnauthorized()
				return
			}
		}

		checkSession()
	}, [])

	// Start periodic session check for all platforms
	useEffect(() => {
		// Start session check
		startSessionTimeoutCheck()

		// Stop session check when component is unmounted
		return () => {
			stopSessionTimeoutCheck()
		}
	}, [])

	const checkLastRouteStatus = useCallback(async () => {
		setStatusCheckLoading(true)
		setErrorMessage(null)

		// Check if redirection to login page is already in progress
		if (isRedirectingToLogin) {
			setStatusCheckLoading(false)
			return
		}

		try {
			const sessionActive = await isSessionActive()
			if (!sessionActive) {
				const {SessionManager} = require('@/utils/SessionManager')
				await SessionManager.getInstance().handleUnauthorized()
				setStatusCheckLoading(false)
				return
			}

			const lastActiveRoute = await offlineDataManager.getLastActiveRoute()
			setButtonText(lastActiveRoute ? 'FINIŠS' : 'STARTS')
			
			console.log('Route status:', lastActiveRoute ? 'active' : 'inactive', 
						Platform.OS === 'web' ? '(server)' : '(database)',
						lastActiveRoute?.uid ? `uid: ${lastActiveRoute.uid}` : '')
			
		} catch (error) {
			console.error('Error checking route status:', error)
			setButtonText('STARTS')
		} finally {
			setStatusCheckLoading(false)
		}
	}, [!isOnline])

	const initializeTabsForRoutes = (routes: TruckRoutePageDto[]): TruckRoutePageDto[] => {
		return routes.map(route => ({
			...route,
			activeTab: route.activeTab || 'basic' as const
		}));
	};

	// Handle tab change for routes
	const handleRouteTabChange = (routeUid: string, tabType: TabType) => {
		setRoutes(prevRoutes =>
			prevRoutes.map(route =>
				route.uid === routeUid
					? { ...route, activeTab: tabType }
					: route
			)
		);
	};

	const fetchRoutes = async () => {
		try {
			if (isRedirectingToLogin) {
				console.log('📱 [DEBUG] Redirecting to login, skipping fetch')
				setLoading(false)
				return
			}

			const sessionActive = await isSessionActive()
			if (!sessionActive) {
				const {SessionManager} = require('@/utils/SessionManager')
				await SessionManager.getInstance().handleUnauthorized()
				setLoading(false)
				return
			}

			if (Platform.OS !== 'web' && isOnline) {
				try {
					await downloadServerData()
				} catch (error) {
					console.warn('📱 [WARN] Dropdown data sync failed, continuing with cached data:', error)
				}
			} else if (Platform.OS !== 'web' && !isOnline) {
				console.log('📱 [DEBUG] Device is in offline mode, skipping server data sync')
			}

			const rawRoutes = await getRoutePages()
			const routesWithTabs = initializeTabsForRoutes(rawRoutes)

			// Calculate computed total routes length for routes that don't have it
			const routePageManager = new RoutePageDataManager()
			const routesWithCalculatedLengths = await Promise.all(
				routesWithTabs.map(async (route) => {
					if (!route.computedTotalRoutesLength || !route.totalFuelConsumedOnRoutes) {
						try {
							const calculatedTotals = await routePageManager.calculateComputedTotals(route.uid)
							console.log("-------------------Calculated totals: ", calculatedTotals)
							return {
								...route,
								computedTotalRoutesLength: calculatedTotals.totalLength,
								totalFuelConsumedOnRoutes: calculatedTotals.totalFuelConsumed,
								totalFuelReceivedOnRoutes: calculatedTotals.totalFuelReceived,
								fuelBalanceAtRoutesFinish: (route.fuelBalanceAtStart ?? 0) + calculatedTotals.totalFuelReceived - calculatedTotals.totalFuelConsumed
							}
						} catch (error) {
							console.error('Error calculating route totals:', error)
							return route
						}
					}
					return route
				})
			)

			setRoutes(routesWithCalculatedLengths)
		} catch (error: any) {
			console.error('📱 [ERROR] Error in fetchRoutes:', error)
			console.error('📱 [ERROR] Error stack:', error?.stack)
		} finally {
			setLoading(false)
		}
	}

	// Simple delete handler with refresh
	const handleDeleteRoute = async (uid: string): Promise<void> => {
		try {
			setDeletingRoute(uid)
			
			// Delete on server using exported function
			await deleteRoutePage(uid)
			
			// Success - refresh the entire list
			alert('Maršruta lapa veiksmīgi izdzēsta')
			setLoading(true)
			fetchRoutes()
			
		} catch (error: any) {
			console.error('Error deleting route page:', error)
			
			// Simple error alert
			const errorMessage = error.message || 'Notika kļūda dzēšot maršruta lapu'
			alert(`Kļūda: ${errorMessage}`)
			
		} finally {
			setDeletingRoute(null)
		}
	}

	// Fetch data when screen comes into focus
	useFocusEffect(React.useCallback(() => {
		// Check if redirection to login page is already in progress
		if (!isRedirectingToLogin) {
			setLoading(true)
			fetchRoutes()
			checkLastRouteStatus()
		}
	}, []))

	// Initial fetch
	useEffect(() => {
		fetchRoutes()
	}, [])

	// WEB VERSION - Modern Design
	if (isWeb) {
		return (
			<View
				className="degra-gradient-bg animated fadeIn"
				style={{
					minHeight: Dimensions.get("window").height,
					flex: 1,
				}}
			>
				<ScrollView style={{ flex: 1 }}>
					<View className="degra-main-container">
						{/* Action Area - New Route Button */}
						<View style={{
							backgroundColor: 'white',
							borderRadius: 16,
							padding: 24,
							marginBottom: 24,
							boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
							alignItems: 'center',
						}}>
							<TouchableOpacity
								style={{
									backgroundColor: '#3b82f6',
									paddingVertical: 16,
									paddingHorizontal: 32,
									borderRadius: 12,
									alignItems: 'center',
									minWidth: 200,
									shadowColor: '#3b82f6',
									shadowOffset: { width: 0, height: 4 },
									shadowOpacity: 0.3,
									shadowRadius: 12,
									elevation: 8,
									opacity: statusCheckLoading ? 0.7 : 1,
									transform: [{ scale: statusCheckLoading ? 0.98 : 1 }]
								}}
								onPress={() => {
									router.push('/truck-route');
								}}
								disabled={statusCheckLoading}
							>
								<View style={{ flexDirection: 'row', alignItems: 'center' }}>
									<MaterialIcons
										name="add-circle"
										size={24}
										color="white"
										style={{ marginRight: 8 }}
									/>
									<Text style={{
										color: 'white',
										fontSize: 18,
										fontWeight: '700',
										fontFamily: 'system-ui'
									}}>
										{statusCheckLoading ? 'Ielādē...' : 'Pievienot maršrutu lapu'}
									</Text>
								</View>
							</TouchableOpacity>
						</View>

						{/* Routes Table */}
						<RouteTable
							routes={routes}
							loading={loading}
							onRefresh={() => {
								setLoading(true);
								fetchRoutes();
								checkLastRouteStatus();
							}}
							onDelete={handleDeleteRoute}
							deletingRoute={deletingRoute}
						/>
					</View>
				</ScrollView>
			</View>
		);
	}

	// MOBILE VERSION - Keep Original Design (UNCHANGED)
	return (<SafeAreaView style={styles.container}>
		<View style={styles.content}>
			{!isOnline && Platform.OS !== 'web' && (<View style={styles.offlineIndicator}>
						<MaterialIcons name="cloud-off" size={16} color={COLORS.highlight} />
						<Text style={styles.offlineText}>Offline režīms</Text>
					</View>)}

			<Button
					title={buttonText}
					onPress={() => {
							router.push('/truck-route')
					}}
					style={[
						styles.startTripButton
					]}
					disabled={statusCheckLoading}
					loading={statusCheckLoading}
			/>

			{/* Debug button - only show on Android for testing */}
			{loading ? (<ActivityIndicator size="large" color={COLORS.secondary} style={styles.loader} />) : (<FlatList
					refreshControl={<RefreshControl
							refreshing={loading}
							onRefresh={() => {
								setLoading(true)
								fetchRoutes()
								checkLastRouteStatus()
							}}
					/>}
					data={routes}
					keyExtractor={(item) => item.uid}
					style={styles.list}
					renderItem={({item}) => (<Pressable
							style={({pressed}) => [styles.routeCard, pressed && styles.routeCardPressed]}
							onPress={() => router.push({
								pathname: '/(tabs)/truck-route-page', params: {uid: item.uid}
							})}
					>
						<View style={styles.routeInfo}>
							{/* Tab buttons */}
							<View style={styles.tabContainer}>
								<Pressable
										style={[styles.tabButton, item.activeTab === 'basic' && styles.tabButtonActive]}
										onPress={() => {
											try {
												const newRoutes = routes.map(route => route.uid === item.uid ? {
													...route, activeTab: 'basic' as const
												} : route)
												setRoutes(newRoutes)
												console.log('📱 [DEBUG] Tab switched to basic for route:', item.uid)
											} catch (error) {
												console.error('📱 [ERROR] Error switching to basic tab:', error)
											}
										}}
								>
									{Platform.OS === 'web' ? (
											<Text style={[styles.tabText, item.activeTab === 'basic' && styles.tabTextActive]}>Pamatinfo</Text>) : (
											<MaterialIcons
													name="info"
													size={24}
													color={item.activeTab === 'basic' ? COLORS.white : COLORS.gray}
											/>)}
								</Pressable>
								<Pressable
										style={[styles.tabButton, item.activeTab === 'odometer' && styles.tabButtonActive]}
										onPress={() => {
											try {
												const newRoutes = routes.map(route => route.uid === item.uid ? {
													...route, activeTab: 'odometer' as const
												} : route)
												setRoutes(newRoutes)
												console.log('📱 [DEBUG] Tab switched to odometer for route:', item.uid)
											} catch (error) {
												console.error('📱 [ERROR] Error switching to odometer tab:', error)
											}
										}}
								>
									{Platform.OS === 'web' ? (
											<Text style={[styles.tabText, item.activeTab === 'odometer' && styles.tabTextActive]}>Odometrs</Text>) : (
											<MaterialIcons
													name="speed"
													size={24}
													color={item.activeTab === 'odometer' ? COLORS.white : COLORS.gray}
											/>)}
								</Pressable>
								<Pressable
										style={[styles.tabButton, item.activeTab === 'fuel' && styles.tabButtonActive]}
										onPress={() => {
											try {
												const newRoutes = routes.map(route => route.uid === item.uid ? {
													...route, activeTab: 'fuel' as const
												} : route)
												setRoutes(newRoutes)
												console.log('📱 [DEBUG] Tab switched to fuel for route:', item.uid)
											} catch (error) {
												console.error('📱 [ERROR] Error switching to fuel tab:', error)
											}
										}}
								>
									{Platform.OS === 'web' ? (
											<Text style={[styles.tabText, item.activeTab === 'fuel' && styles.tabTextActive]}>Degviela</Text>) : (
											<MaterialIcons
													name="local-gas-station"
													size={24}
													color={item.activeTab === 'fuel' ? COLORS.white : COLORS.gray}
											/>)}
								</Pressable>
							</View>

							{/* Tab content */}
							{item.activeTab === 'basic' && (<View style={[styles.tabContentContainer, styles.basicTabContent]}>
								<View style={styles.routeRow}>
									<Text style={styles.routeLabelInline}>Periods:</Text>
									<Text style={styles.routeText}>
										{new Date(item.dateFrom).toLocaleDateString('lv-LV', {
											day: '2-digit', month: '2-digit', year: 'numeric'
										})} - {new Date(item.dateTo).toLocaleDateString('lv-LV', {
										day: '2-digit', month: '2-digit', year: 'numeric'
									})}
									</Text>
								</View>
								<View style={styles.routeRow}>
									<Text style={styles.routeLabelInline}>Auto:</Text>
									<Text style={styles.routeText}>{item.truck?.registrationNumber || 'Nav pieejams'}</Text>
								</View>
								<View style={styles.routeRow}>
									<Text style={styles.routeLabelInline}>Vadītājs:</Text>
									<Text style={styles.routeText}>
										{[user?.firstName, user?.lastName].filter(Boolean).join(' ')}
									</Text>
								</View>
							</View>)}

							{item.activeTab === 'odometer' && (<View style={[styles.tabContentContainer, styles.odometerTabContent]}>
								<View style={styles.routeRow}>
									<Text style={styles.routeLabelInline}>Startā:</Text>
									<Text style={styles.routeText}>{item.odometerAtRouteStart?.toLocaleString() ?? '0'} km</Text>
								</View>
								<View style={styles.routeRow}>
									<Text style={styles.routeLabelInline}>Distance:</Text>
									<Text style={[styles.routeText, styles.highlightedText]}>{item.computedTotalRoutesLength?.toLocaleString() ?? '0'} km</Text>
								</View>
								<View style={styles.routeRow}>
									<Text style={styles.routeLabelInline}>Finišā:</Text>
									<Text style={[styles.routeText, styles.routeText]}>{item.odometerAtRouteFinish?.toLocaleString() ?? '0'} km</Text>
								</View>
							</View>)}

							{item.activeTab === 'fuel' && (<View style={[styles.tabContentContainer, styles.fuelTabContent]}>
								<View style={styles.routeRow}>
									<Text style={styles.routeLabelInline}>Norma:</Text>
									<Text style={styles.routeText}>{item.truck?.fuelConsumptionNorm || 0} L/100 Km</Text>
								</View>

								<View style={styles.routeRow}>
									<Text style={styles.routeLabelInline}>Sākumā:</Text>
									<Text style={styles.routeText}>{item.fuelBalanceAtStart} L</Text>
								</View>
								<View style={styles.routeRow}>
									<Text style={styles.routeLabelInline}>Saņemta:</Text>
									<Text style={[styles.routeText, styles.highlightedText]}>+{item.totalFuelReceivedOnRoutes ?? '0'} L</Text>
								</View>
								<View style={styles.routeRow}>
									<Text style={styles.routeLabelInline}>Patērēta:</Text>
									<Text style={[styles.routeText, styles.highlightedText]}>{item.totalFuelConsumedOnRoutes ?? '0'} L</Text>
								</View>
								<View style={styles.routeRow}>
									<Text style={styles.routeLabelInline}>Beigās:</Text>
									<Text style={styles.routeText}>{item.fuelBalanceAtRoutesFinish ?? '0'} L</Text>
								</View>
							</View>)}
						</View>
					</Pressable>)}
					ListEmptyComponent={() => (<View style={styles.emptyContainer}>
						<Text style={styles.emptyText}>Nav pieejamu maršrutu lapu</Text>
					</View>)}
			/>)}
		</View>
	</SafeAreaView>)
}

type Styles = {
	routeCardPressed: ViewStyle;
	list: ViewStyle;
	loader: ViewStyle;
	routeCard: ViewStyle;
	routeInfo: ViewStyle;
	routeLabel: TextStyle;
	routeText: TextStyle;
	routeRow: ViewStyle;
	routeLabelInline: TextStyle;
	emptyContainer: ViewStyle;
	emptyText: TextStyle;
	container: ViewStyle;
	content: ViewStyle;
	heading: TextStyle;
	title: TextStyle;
	subtitle: TextStyle;
	statsContainer: ViewStyle;
	statCard: ViewStyle;
	statNumber: TextStyle;
	statLabel: TextStyle;
	infoContainer: ViewStyle;
	infoText: TextStyle;
	startTripButton: ViewStyle;
	disabledButton: ViewStyle;
	addRouteButton: ViewStyle;
	sectionTitle: TextStyle;
	tabContainer: ViewStyle;
	tabButton: ViewStyle;
	tabButtonActive: ViewStyle;
	tabText: TextStyle;
	tabTextActive: TextStyle;
	tabContent: ViewStyle;
	tabContentContainer: ViewStyle;
	basicTabContent: ViewStyle;
	odometerTabContent: ViewStyle;
	fuelTabContent: ViewStyle;
	highlightedText: TextStyle;
	errorContainer: ViewStyle;
	errorText: TextStyle;
	refreshButton: ViewStyle;
	offlineIndicator: ViewStyle;
	offlineText: TextStyle;
	warningContainer: ViewStyle;
	warningText: TextStyle;
	syncButton: ViewStyle;
	syncButtonText: TextStyle;
	iconTextRow: ViewStyle;
};

const styles = StyleSheet.create<Styles>({
	refreshButton: {
		marginTop: 12, backgroundColor: COLORS.secondary, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16,
	}, errorContainer: {
		backgroundColor: 'rgba(255, 0, 0, 0.1)',
		borderRadius: 8,
		padding: 12,
		marginTop: 16,
		borderWidth: 1,
		borderColor: 'rgba(255, 0, 0, 0.3)',
	}, errorText: {
		fontSize: 14, fontFamily: FONT.medium, color: '#FF6B6B', textAlign: 'center',
	}, routeCardPressed: {
		opacity: 0.7, transform: [{scale: 0.98}],
	}, list: {
		marginTop: 16,
	}, loader: {
		marginTop: 24,
	}, routeCard: Platform.OS === 'web' ? {
		backgroundColor: COLORS.black100,
		borderRadius: 8,
		padding: 16,
		marginBottom: 12,
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.05)', ...SHADOWS.small,
	} : {
		backgroundColor: COLORS.black100,
		borderRadius: 8,
		padding: 16,
		marginBottom: 12,
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.15)', // Increased opacity for mobile
		...SHADOWS.medium, // Using medium shadows for better visibility on mobile
	}, routeInfo: {
		marginBottom: 8,
	}, routeRow: {
		flexDirection: 'row', alignItems: 'center', marginBottom: 8,
	}, routeLabel: {
		fontSize: 14, fontFamily: FONT.medium, color: COLORS.gray, marginBottom: 4,
	}, routeLabelInline: {
		fontSize: 14, fontFamily: FONT.medium, color: COLORS.gray, marginRight: 8, flex: 0.33, // 1/3 of the width
	}, routeText: {
		fontSize: 16, fontFamily: FONT.semiBold, color: COLORS.white, flex: 0.67, // 2/3 of the width
		textAlign: 'right',
	}, emptyContainer: {
		alignItems: 'center', marginTop: 24,
	}, emptyText: {
		fontSize: 16, fontFamily: FONT.regular, color: COLORS.gray,
	}, container: {
		flex: 1, backgroundColor: COLORS.primary,
	}, content: Platform.OS === 'web' ? {
		flex: 1,
		paddingHorizontal: 16,
		marginVertical: 24,
		width: '100%' as const,
		maxWidth: CONTAINER_WIDTH.web,
		alignSelf: 'center' as const,
	} : {
		flex: 1, paddingHorizontal: 16, marginVertical: 24, width: CONTAINER_WIDTH.mobile, alignSelf: 'center' as const,
	}, heading: {
		fontSize: 32, fontFamily: FONT.bold, color: COLORS.white, textAlign: 'center', marginBottom: 40,
	}, title: {
		fontSize: 24, fontFamily: FONT.semiBold, color: COLORS.white, marginBottom: 8,
	}, subtitle: {
		fontSize: 16, fontFamily: FONT.regular, color: COLORS.gray, marginBottom: 24,
	}, statsContainer: {
		flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24,
	}, statCard: Platform.OS === 'web' ? {
		flex: 1,
		backgroundColor: COLORS.black100,
		borderRadius: 8,
		padding: 16,
		marginHorizontal: 8,
		alignItems: 'center',
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.05)', ...SHADOWS.small,
	} : {
		flex: 1,
		backgroundColor: COLORS.black100,
		borderRadius: 8,
		padding: 16,
		marginHorizontal: 8,
		alignItems: 'center',
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.15)', // Increased opacity for mobile
		...SHADOWS.medium, // Using medium shadows for better visibility on mobile
	}, statNumber: {
		fontSize: 24, fontFamily: FONT.bold, color: COLORS.secondary, marginBottom: 4,
	}, statLabel: {
		fontSize: 14, fontFamily: FONT.regular, color: COLORS.gray, textAlign: 'center',
	}, infoContainer: Platform.OS === 'web' ? {
		backgroundColor: COLORS.black100,
		borderRadius: 8,
		padding: 16,
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.05)', ...SHADOWS.small,
	} : {
		backgroundColor: COLORS.black100, borderRadius: 8, padding: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.15)', // Increased opacity for mobile
		...SHADOWS.medium, // Using medium shadows for better visibility on mobile
	}, infoText: {
		fontSize: 14, fontFamily: FONT.regular, color: COLORS.gray, lineHeight: 20,
	}, startTripButton: Platform.OS === 'web' ? {
		marginTop: 24,
	} : {
		marginTop: 24, ...SHADOWS.medium, // Using medium shadows for better visibility on mobile
	}, addRouteButton: Platform.OS === 'web' ? {
		marginTop: 16, backgroundColor: COLORS.black100, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)', ...SHADOWS.small,
	} : {
		marginTop: 16, backgroundColor: COLORS.black100, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.15)', // Increased opacity for mobile
		...SHADOWS.medium, // Using medium shadows for better visibility on mobile
	}, sectionTitle: {
		fontSize: 20, fontFamily: FONT.semiBold, color: COLORS.white, marginTop: 32, marginBottom: 16,
	}, // Updated tab container style to match TruckRoute component
	tabContainer: Platform.OS === 'web' ? {
		flexDirection: 'row',
		marginBottom: 0, // Changed from 16 to 0
		borderTopLeftRadius: 8, // Changed from borderRadius to borderTopLeftRadius
		borderTopRightRadius: 8, // Added borderTopRightRadius
		overflow: 'hidden',
		backgroundColor: COLORS.black200,
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.08)',
		borderBottomWidth: 0, // Added to remove bottom border
	} : {
		flexDirection: 'row', marginBottom: 0, // Changed from 16 to 0
		borderTopLeftRadius: 8, // Changed from borderRadius to borderTopLeftRadius
		borderTopRightRadius: 8, // Added borderTopRightRadius
		overflow: 'hidden', backgroundColor: COLORS.black200, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)', // Increased opacity for mobile
		borderBottomWidth: 0, // Added to remove bottom border
	}, tabButton: {
		flex: 1, paddingVertical: 8, paddingHorizontal: 12, alignItems: 'center',
	}, tabButtonActive: Platform.OS === 'web' ? {
		backgroundColor: COLORS.secondary, ...SHADOWS.small,
	} : {
		backgroundColor: COLORS.secondary, ...SHADOWS.medium, // Using medium shadows for better visibility on mobile
	}, tabText: {
		fontSize: 14, fontFamily: FONT.medium, color: COLORS.gray,
	}, tabTextActive: {
		color: COLORS.white, fontFamily: FONT.semiBold,
	}, // Original tab content style (kept for backward compatibility)
	tabContent: {
		paddingTop: 8,
	}, // New tab content container style to match TruckRoute component
	tabContentContainer: Platform.OS === 'web' ? {
		backgroundColor: COLORS.primary,
		borderBottomLeftRadius: 8,
		borderBottomRightRadius: 8,
		padding: 16,
		marginBottom: 16,
		borderWidth: 1,
		borderTopWidth: 0,
		borderColor: 'rgba(255, 255, 255, 0.05)', ...SHADOWS.small,
	} : {
		backgroundColor: COLORS.primary,
		borderBottomLeftRadius: 8,
		borderBottomRightRadius: 8,
		padding: 16,
		marginBottom: 16,
		borderWidth: 1,
		borderTopWidth: 0,
		borderColor: 'rgba(255, 255, 255, 0.15)', ...SHADOWS.medium,
	}, // Tab content styles for each tab type
	basicTabContent: {
		borderLeftWidth: 3, borderLeftColor: COLORS.secondary,
	}, odometerTabContent: {
		borderLeftWidth: 3, borderLeftColor: COLORS.highlight,
	}, fuelTabContent: {
		borderLeftWidth: 3, borderLeftColor: COLORS.gray,
	}, highlightedText: {
		color: COLORS.highlight, fontFamily: FONT.semiBold,
	}, offlineIndicator: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: 'rgba(255, 193, 7, 0.1)',
		borderRadius: 6,
		paddingVertical: 6,
		paddingHorizontal: 12,
		marginBottom: 12,
		borderWidth: 1,
		borderColor: 'rgba(255, 193, 7, 0.3)',
	}, offlineText: {
		fontSize: 12, fontFamily: FONT.medium, color: COLORS.highlight, marginLeft: 6,
	}, disabledButton: {
		opacity: 0.5,
	}, warningContainer: {
		flexDirection: 'column',
		alignItems: 'flex-start',
		backgroundColor: 'rgba(255, 193, 7, 0.1)',
		borderRadius: 8,
		padding: 12,
		marginTop: 12,
		borderWidth: 1,
		borderColor: 'rgba(255, 193, 7, 0.3)',
	}, warningText: {
		fontSize: 14,
		fontFamily: FONT.medium,
		color: COLORS.highlight,
		marginLeft: 8,
		marginRight: 8,
		flex: 1,
		lineHeight: 20,
	}, syncButton: {
		backgroundColor: COLORS.secondary,
		borderRadius: 8,
		paddingVertical: 8,
		paddingHorizontal: 16,
		marginTop: 8,
		alignSelf: 'center',
		alignItems: 'center',
		height: 48,
		justifyContent: 'center',
	}, syncButtonText: {
		fontSize: 16,
		fontFamily: FONT.semiBold,
		color: COLORS.white,
	},	iconTextRow: {
		flexDirection: 'row', // ikona un teksts blakus
		alignItems: 'flex-start',
	},
})
