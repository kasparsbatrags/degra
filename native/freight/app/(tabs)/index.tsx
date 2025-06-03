import {isRedirectingToLogin, redirectToLogin} from '@/config/axios'
import {COLORS, CONTAINER_WIDTH, FONT, SHADOWS} from '@/constants/theme'
import {useAuth} from '@/context/AuthContext'
import {useOfflineStatus} from '@/context/OfflineContext'
import {isConnected} from '@/utils/networkUtils'
import {startSessionTimeoutCheck, stopSessionTimeoutCheck} from '@/utils/sessionTimeoutHandler'
import {isSessionActive, loadSessionEnhanced} from '@/utils/sessionUtils'
import {getRoutePages} from '@/utils/offlineDataManager'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {useFocusEffect, useRouter} from 'expo-router'
import React, {useCallback, useEffect, useState} from 'react'
import {ActivityIndicator, FlatList, Platform, Pressable, RefreshControl, StyleSheet, Text, TextStyle, View, ViewStyle} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import Button from '../../components/Button'
import freightAxiosInstance from '../../config/freightAxios'

interface TruckRoutePage {
	id: number;
	dateFrom: string;
	dateTo: string;
	truckRegistrationNumber: string;
	fuelConsumptionNorm: number;
	fuelBalanceAtStart: number;

	totalFuelReceivedOnRoutes: number | null;
	totalFuelConsumedOnRoutes: number | null;
	fuelBalanceAtRoutesFinish: number | null;

	odometerAtRouteStart: number | null;
	odometerAtRouteFinish: number | null;
	computedTotalRoutesLength: number | null;
	activeTab?: 'basic' | 'odometer' | 'fuel';
}

export default function HomeScreen() {
	const {user} = useAuth()
	const router = useRouter()
	const [routes, setRoutes] = useState<TruckRoutePage[]>([])
	const [loading, setLoading] = useState(true)
	const [buttonText, setButtonText] = useState('Starts')
	const [errorMessage, setErrorMessage] = useState<string | null>(null)
	const [statusCheckLoading, setStatusCheckLoading] = useState(false)

	// Constants for local database keys
	const LAST_ROUTE_STATUS_KEY = 'lastRouteStatus'
	const CACHED_ROUTES_KEY = 'cachedRoutes'
	const CACHED_ROUTES_TIMESTAMP_KEY = 'cachedRoutesTimestamp'
	
	// State for offline mode awareness
	const [isOfflineMode, setIsOfflineMode] = useState(false)
	const [dataSource, setDataSource] = useState<'online' | 'cache' | 'none'>('none')
	
	// Cache management functions
	const saveRoutesToCache = async (routesData: TruckRoutePage[]) => {
		try {
			await AsyncStorage.setItem(CACHED_ROUTES_KEY, JSON.stringify(routesData))
			await AsyncStorage.setItem(CACHED_ROUTES_TIMESTAMP_KEY, Date.now().toString())
			console.log('Routes cached successfully')
		} catch (error) {
			console.error('Error caching routes:', error)
		}
	}
	
	const loadRoutesFromCache = async (): Promise<TruckRoutePage[] | null> => {
		try {
			const cachedData = await AsyncStorage.getItem(CACHED_ROUTES_KEY)
			if (cachedData) {
				const routes = JSON.parse(cachedData) as TruckRoutePage[]
				return routes.map(route => ({...route, activeTab: 'basic' as const}))
			}
			return null
		} catch (error) {
			console.error('Error loading cached routes:', error)
			return null
		}
	}
	
	const getCacheAge = async (): Promise<number | null> => {
		try {
			const timestamp = await AsyncStorage.getItem(CACHED_ROUTES_TIMESTAMP_KEY)
			if (timestamp) {
				return Date.now() - parseInt(timestamp)
			}
			return null
		} catch (error) {
			console.error('Error getting cache age:', error)
			return null
		}
	}
	
	// Check session type and set offline mode awareness
	useEffect(() => {
		const checkSessionType = async () => {
			try {
				const sessionData = await loadSessionEnhanced()
				if (sessionData.sessionType === 'persistent-offline') {
					setIsOfflineMode(true)
					console.log('Detected persistent offline session - prioritizing offline mode')
				} else {
					setIsOfflineMode(false)
				}
			} catch (error) {
				console.error('Error checking session type:', error)
			}
		}
		
		checkSessionType()
	}, [])

	// Check session status when component is loaded
	useEffect(() => {
		const checkSession = async () => {
			const sessionActive = await isSessionActive()
			console.log(sessionActive)
			if (!sessionActive) {
				// Use the shared redirectToLogin function from axios.ts
				// This will handle redirection properly for both web and mobile
				redirectToLogin()
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
		// Clear previous error message
		setErrorMessage(null)

		// Check if redirection to login page is already in progress
		if (isRedirectingToLogin) {
			setStatusCheckLoading(false)
			return
		}

		try {
			// Check if session is active
			const sessionActive = await isSessionActive()
			if (!sessionActive) {
				// If session is not active, redirect to login page using the shared function
				redirectToLogin()
				setStatusCheckLoading(false)
				return
			}

			// Check if device is connected to the internet
			const connected = await isConnected()

			// If in offline mode or no connection, use cached status
			if (isOfflineMode || !connected) {
				const localStatus = await AsyncStorage.getItem(LAST_ROUTE_STATUS_KEY)
				if (localStatus) {
					setButtonText(localStatus === 'active' ? 'FINIŠS' : 'STARTS')
					console.log('Using cached route status:', localStatus)
				} else {
					// Default to STARTS if no cached status
					setButtonText('STARTS')
					console.log('No cached route status, defaulting to STARTS')
				}
				return
			}

			if (connected) {
				// If there is a connection, try to get data from server
				try {
					await freightAxiosInstance.get('/truck-routes/last-active')
					setButtonText('FINIŠS')

					// Save status in local database
					await AsyncStorage.setItem(LAST_ROUTE_STATUS_KEY, 'active')
					console.log('Route status updated from server: active')
				} catch (error: any) {
					if (error.response?.status === 404) {
						setButtonText('STARTS')

						// Save status in local database
						await AsyncStorage.setItem(LAST_ROUTE_STATUS_KEY, 'inactive')
						console.log('Route status updated from server: inactive')
					} else {
						console.error('Server error, falling back to cached status:', error)
						// Fall back to cached status
						const localStatus = await AsyncStorage.getItem(LAST_ROUTE_STATUS_KEY)
						if (localStatus) {
							setButtonText(localStatus === 'active' ? 'FINIŠS' : 'STARTS')
							console.log('Using cached route status due to server error:', localStatus)
						} else {
							setButtonText('STARTS')
							console.log('No cached status available, defaulting to STARTS')
						}
					}
				}
			}
		} catch (error: any) {
			console.error('Error checking route status:', error)
			// Fall back to cached status
			const localStatus = await AsyncStorage.getItem(LAST_ROUTE_STATUS_KEY)
			if (localStatus) {
				setButtonText(localStatus === 'active' ? 'FINIŠS' : 'STARTS')
			} else {
				setButtonText('STARTS')
			}
		} finally {
			// Reset loading state
			setStatusCheckLoading(false)
		}
	}, [isOfflineMode])

	const fetchRoutes = async () => {
		try {
			// Check if session is active and if redirection to login page is already in progress
			if (isRedirectingToLogin) {
				setLoading(false)
				return
			}

			const sessionActive = await isSessionActive()
			if (!sessionActive) {
				// If session is not active, redirect to login page using the shared function
				redirectToLogin()
				setLoading(false)
				return
			}

			// Use new offline-first data manager
			console.log('Fetching routes using offline-first approach')
			const routePages = await getRoutePages()
			
			// Transform data to match expected format
			const transformedRoutes = routePages.map(route => ({
				id: route.id || 0,
				dateFrom: route.date_from,
				dateTo: route.date_to,
				truckRegistrationNumber: route.truck_registration_number,
				fuelConsumptionNorm: route.fuel_consumption_norm,
				fuelBalanceAtStart: route.fuel_balance_at_start,
				totalFuelReceivedOnRoutes: route.total_fuel_received_on_routes ?? null,
				totalFuelConsumedOnRoutes: route.total_fuel_consumed_on_routes ?? null,
				fuelBalanceAtRoutesFinish: route.fuel_balance_at_routes_finish ?? null,
				odometerAtRouteStart: route.odometer_at_route_start ?? null,
				odometerAtRouteFinish: route.odometer_at_route_finish ?? null,
				computedTotalRoutesLength: route.computed_total_routes_length ?? null,
				activeTab: 'basic' as const
			}))
			
			setRoutes(transformedRoutes)
			setDataSource('online') // Data manager handles online/offline internally
			console.log('Loaded routes using offline-first manager:', transformedRoutes.length)
			
		} catch (error: any) {
			console.error('Error in fetchRoutes:', error)
			// Even if there's an error, the offline data manager should handle fallbacks
			setRoutes([])
			setDataSource('none')
		} finally {
			setLoading(false)
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

	return (<SafeAreaView style={styles.container}>
		<View style={styles.content}>
			{/* Offline mode indicator */}
			{(isOfflineMode || dataSource === 'cache') && (
				<View style={styles.offlineIndicator}>
					<MaterialIcons name="cloud-off" size={16} color={COLORS.highlight} />
					<Text style={styles.offlineText}>
						{isOfflineMode ? 'Offline režīms' : 'Dati no cache'}
					</Text>
				</View>
			)}
			
			<Button
					title={buttonText}
					onPress={() => router.push('/truck-route')}
					style={styles.startTripButton}
					disabled={statusCheckLoading}
					loading={statusCheckLoading}
			/>
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
					keyExtractor={(item) => item.id.toString()}
					style={styles.list}
					renderItem={({item}) => (<Pressable
							style={({pressed}) => [styles.routeCard, pressed && styles.routeCardPressed]}
							onPress={() => router.push({
								pathname: '/(tabs)/truck-route-page', params: {id: item.id}
							})}
					>
						<View style={styles.routeInfo}>
							{/* Tab buttons */}
							<View style={styles.tabContainer}>
								<Pressable
										style={[styles.tabButton, item.activeTab === 'basic' && styles.tabButtonActive]}
										onPress={() => {
											const newRoutes = routes.map(route => route.id === item.id ? {
												...route, activeTab: 'basic' as const
											} : route)
											setRoutes(newRoutes)
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
											const newRoutes = routes.map(route => route.id === item.id ? {
												...route, activeTab: 'odometer' as const
											} : route)
											setRoutes(newRoutes)
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
											const newRoutes = routes.map(route => route.id === item.id ? {
												...route, activeTab: 'fuel' as const
											} : route)
											setRoutes(newRoutes)
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
											<Text style={styles.routeText}>{item.truckRegistrationNumber}</Text>
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
											<Text style={styles.routeText}>{item.fuelConsumptionNorm} L/100 Km</Text>
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
})
