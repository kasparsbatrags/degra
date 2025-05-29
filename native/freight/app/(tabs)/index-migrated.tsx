import {isRedirectingToLogin, redirectToLogin} from '@/config/axios'
import {COLORS, CONTAINER_WIDTH, FONT, SHADOWS} from '@/constants/theme'
import {useAuth} from '@/context/AuthContext'
import {isConnected} from '@/utils/networkUtils'
import {startSessionTimeoutCheck, stopSessionTimeoutCheck} from '@/utils/sessionTimeoutHandler'
import {isSessionActive} from '@/utils/sessionUtils'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {useFocusEffect, useRouter} from 'expo-router'
import React, {useCallback, useEffect, useState} from 'react'
import {ActivityIndicator, FlatList, Platform, Pressable, RefreshControl, StyleSheet, Text, TextStyle, View, ViewStyle} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import Button from '../../components/Button'
import freightAxiosInstance from '../../config/freightAxios'

// NEW: Import offline hooks and components
import { useOfflineData } from '@/hooks/useOfflineData'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { CACHE_KEYS } from '@/config/offlineConfig'
import GlobalOfflineIndicator from '@/components/GlobalOfflineIndicator'

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
	
	// NEW: Use offline hooks instead of manual state management
	const {
		data: routes,
		isLoading: routesLoading,
		isFromCache: routesFromCache,
		isStale: routesStale,
		error: routesError,
		refetch: refetchRoutes
	} = useOfflineData(
		CACHE_KEYS.ROUTES,
		async () => {
			const response = await freightAxiosInstance.get<TruckRoutePage[]>('/route-pages')
			return response.data.map(route => ({...route, activeTab: 'basic' as const}))
		},
		{
			strategy: 'stale-while-revalidate',
			onError: (error) => {
				console.error('Failed to fetch routes:', error)
			}
		}
	)

	const {
		data: routeStatus,
		isLoading: statusLoading,
		isFromCache: statusFromCache,
		error: statusError,
		refetch: refetchStatus
	} = useOfflineData(
		CACHE_KEYS.ROUTE_STATUS,
		async () => {
			try {
				await freightAxiosInstance.get('/truck-routes/last-active')
				return 'active'
			} catch (error: any) {
				if (error.response?.status === 404) {
					return 'inactive'
				}
				throw error
			}
		},
		{
			strategy: 'cache-first',
			onError: (error) => {
				console.error('Failed to fetch route status:', error)
			}
		}
	)

	// NEW: Use network status hook
	const { isOnline, isOfflineMode } = useNetworkStatus()

	// OLD: Keep existing state for tabs (will migrate later)
	const [localRoutes, setLocalRoutes] = useState<TruckRoutePage[]>([])
	
	// OLD: Keep existing error state for now
	const [errorMessage, setErrorMessage] = useState<string | null>(null)

	// Constant for local database key (keeping for backward compatibility)
	const LAST_ROUTE_STATUS_KEY = 'lastRouteStatus'

	// Check session status when component is loaded
	useEffect(() => {
		const checkSession = async () => {
			const sessionActive = await isSessionActive()
			console.log(sessionActive)
			if (!sessionActive) {
				redirectToLogin()
				return
			}
		}

		checkSession()
	}, [])

	// Start periodic session check for all platforms
	useEffect(() => {
		startSessionTimeoutCheck()
		return () => {
			stopSessionTimeoutCheck()
		}
	}, [])

	// NEW: Update local routes when offline data changes
	useEffect(() => {
		if (routes) {
			setLocalRoutes(routes)
		}
	}, [routes])

	// NEW: Handle errors from offline hooks
	useEffect(() => {
		if (routesError && !routesFromCache) {
			setErrorMessage('Neizdevās ielādēt datus - serveris neatbild. Lūdzu, mēģiniet vēlreiz mazliet vēlāk!')
		} else if (statusError && !statusFromCache) {
			setErrorMessage('Neizdevās pieslēgties - serveris neatbild. Lūdzu, mēģiniet vēlreiz mazliet vēlāk!')
		} else {
			setErrorMessage(null)
		}
	}, [routesError, statusError, routesFromCache, statusFromCache])

	// OLD: Keep existing checkLastRouteStatus for backward compatibility (will remove later)
	const checkLastRouteStatus = useCallback(async () => {
		// NEW: Use the offline hook instead
		await refetchStatus()
	}, [refetchStatus])

	// OLD: Keep existing fetchRoutes for backward compatibility (will remove later)
	const fetchRoutes = async () => {
		// NEW: Use the offline hook instead
		await refetchRoutes()
	}

	// Fetch data when screen comes into focus
	useFocusEffect(React.useCallback(() => {
		if (!isRedirectingToLogin) {
			refetchRoutes()
			refetchStatus()
		}
	}, [refetchRoutes, refetchStatus]))

	// Initial fetch
	useEffect(() => {
		refetchRoutes()
	}, [refetchRoutes])

	// NEW: Determine button text from offline data
	const buttonText = routeStatus === 'active' ? 'FINIŠS' : 'STARTS'
	const loading = routesLoading || statusLoading

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.content}>
				{/* NEW: Add offline indicator */}
				<GlobalOfflineIndicator />

				<Button
					title={buttonText}
					onPress={() => router.push('/truck-route')}
					style={styles.startTripButton}
					disabled={errorMessage !== null || statusLoading}
					loading={statusLoading}
				/>

				{/* NEW: Show cache indicators */}
				{(routesFromCache || statusFromCache) && (
					<View style={styles.cacheIndicator}>
						<MaterialIcons name="offline-pin" size={16} color={COLORS.warning} />
						<Text style={styles.cacheText}>
							Rādīti saglabātie dati
							{routesStale && ' (dati var būt novecojuši)'}
						</Text>
					</View>
				)}

				{errorMessage && (
					<View style={styles.errorContainer}>
						<Text style={styles.errorText}>{errorMessage}</Text>
						<Button
							title="Pārbaudīt"
							onPress={() => {
								refetchRoutes()
								refetchStatus()
							}}
							style={styles.refreshButton}
							loading={loading}
						/>
					</View>
				)}

				{loading ? (
					<ActivityIndicator size="large" color={COLORS.secondary} style={styles.loader} />
				) : (
					<FlatList
						refreshControl={
							<RefreshControl
								refreshing={loading}
								onRefresh={() => {
									refetchRoutes()
									refetchStatus()
								}}
							/>
						}
						data={localRoutes}
						keyExtractor={(item) => item.id.toString()}
						style={styles.list}
						renderItem={({item}) => (
							<Pressable
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
												const newRoutes = localRoutes.map(route => route.id === item.id ? {
													...route, activeTab: 'basic' as const
												} : route)
												setLocalRoutes(newRoutes)
											}}
										>
											{Platform.OS === 'web' ? (
												<Text style={[styles.tabText, item.activeTab === 'basic' && styles.tabTextActive]}>Pamatinfo</Text>
											) : (
												<MaterialIcons
													name="info"
													size={24}
													color={item.activeTab === 'basic' ? COLORS.white : COLORS.gray}
												/>
											)}
										</Pressable>
										<Pressable
											style={[styles.tabButton, item.activeTab === 'odometer' && styles.tabButtonActive]}
											onPress={() => {
												const newRoutes = localRoutes.map(route => route.id === item.id ? {
													...route, activeTab: 'odometer' as const
												} : route)
												setLocalRoutes(newRoutes)
											}}
										>
											{Platform.OS === 'web' ? (
												<Text style={[styles.tabText, item.activeTab === 'odometer' && styles.tabTextActive]}>Odometrs</Text>
											) : (
												<MaterialIcons
													name="speed"
													size={24}
													color={item.activeTab === 'odometer' ? COLORS.white : COLORS.gray}
												/>
											)}
										</Pressable>
										<Pressable
											style={[styles.tabButton, item.activeTab === 'fuel' && styles.tabButtonActive]}
											onPress={() => {
												const newRoutes = localRoutes.map(route => route.id === item.id ? {
													...route, activeTab: 'fuel' as const
												} : route)
												setLocalRoutes(newRoutes)
											}}
										>
											{Platform.OS === 'web' ? (
												<Text style={[styles.tabText, item.activeTab === 'fuel' && styles.tabTextActive]}>Degviela</Text>
											) : (
												<MaterialIcons
													name="local-gas-station"
													size={24}
													color={item.activeTab === 'fuel' ? COLORS.white : COLORS.gray}
												/>
											)}
										</Pressable>
									</View>

									{/* Tab content */}
									{item.activeTab === 'basic' && (
										<View style={[styles.tabContentContainer, styles.basicTabContent]}>
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
										</View>
									)}

									{item.activeTab === 'odometer' && (
										<View style={[styles.tabContentContainer, styles.odometerTabContent]}>
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
										</View>
									)}

									{item.activeTab === 'fuel' && (
										<View style={[styles.tabContentContainer, styles.fuelTabContent]}>
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
										</View>
									)}
								</View>
							</Pressable>
						)}
						ListEmptyComponent={() => (
							<View style={styles.emptyContainer}>
								<Text style={styles.emptyText}>Nav pieejamu maršrutu lapu</Text>
							</View>
						)}
					/>
				)}
			</View>
		</SafeAreaView>
	)
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
	// NEW: Cache indicator styles
	cacheIndicator: ViewStyle;
	cacheText: TextStyle;
};

const styles = StyleSheet.create<Styles>({
	refreshButton: {
		marginTop: 12, backgroundColor: COLORS.secondary, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16,
	}, 
	errorContainer: {
		backgroundColor: 'rgba(255, 0, 0, 0.1)',
		borderRadius: 8,
		padding: 12,
		marginTop: 16,
		borderWidth: 1,
		borderColor: 'rgba(255, 0, 0, 0.3)',
	}, 
	errorText: {
		fontSize: 14, fontFamily: FONT.medium, color: '#FF6B6B', textAlign: 'center',
	}, 
	// NEW: Cache indicator styles
	cacheIndicator: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: 'rgba(255, 193, 7, 0.1)',
		borderRadius: 8,
		padding: 12,
		marginTop: 8,
		borderWidth: 1,
		borderColor: 'rgba(255, 193, 7, 0.3)',
	},
	cacheText: {
		fontSize: 12,
		fontFamily: FONT.medium,
		color: COLORS.warning,
		marginLeft: 8,
		flex: 1,
	},
	routeCardPressed: {
		opacity: 0.7, transform: [{scale: 0.98}],
	}, 
	list: {
		marginTop: 16,
	}, 
	loader: {
		marginTop: 24,
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
		borderColor: 'rgba(255, 255, 255, 0.15)',
		...SHADOWS.medium,
	}, 
	routeInfo: {
		marginBottom: 8,
	}, 
	routeRow: {
		flexDirection: 'row', alignItems: 'center', marginBottom: 8,
	}, 
	routeLabel: {
		fontSize: 14, fontFamily: FONT.medium, color: COLORS.gray, marginBottom: 4,
	}, 
	routeLabelInline: {
		fontSize: 14, fontFamily: FONT.medium, color: COLORS.gray, marginRight: 8, flex: 0.33,
	}, 
	routeText: {
		fontSize: 16, fontFamily: FONT.semiBold, color: COLORS.white, flex: 0.67,
		textAlign: 'right',
	}, 
	emptyContainer: {
		alignItems: 'center', marginTop: 24,
	}, 
	emptyText: {
		fontSize: 16, fontFamily: FONT.regular, color: COLORS.gray,
	}, 
	container: {
		flex: 1, backgroundColor: COLORS.primary,
	}, 
	content: Platform.OS === 'web' ? {
		flex: 1,
		paddingHorizontal: 16,
		marginVertical: 24,
		width: '100%' as const,
		maxWidth: CONTAINER_WIDTH.web,
		alignSelf: 'center' as const,
	} : {
		flex: 1, paddingHorizontal: 16, marginVertical: 24, width: CONTAINER_WIDTH.mobile, alignSelf: 'center' as const,
	}, 
	heading: {
		fontSize: 32, fontFamily: FONT.bold, color: COLORS.white, textAlign: 'center', marginBottom: 40,
	}, 
	title: {
		fontSize: 24, fontFamily: FONT.semiBold, color: COLORS.white, marginBottom: 8,
	}, 
	subtitle: {
		fontSize: 16, fontFamily: FONT.regular, color: COLORS.gray, marginBottom: 24,
	}, 
	statsContainer: {
		flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24,
	}, 
	statCard: Platform.OS === 'web' ? {
		flex: 1,
		backgroundColor: COLORS.black100,
		borderRadius: 8,
		padding: 16,
		marginHorizontal: 8,
		alignItems: 'center',
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.05)', 
		...SHADOWS.small,
	} : {
		flex: 1,
		backgroundColor: COLORS.black100,
		borderRadius: 8,
		padding: 16,
		marginHorizontal: 8,
		alignItems: 'center',
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.15)',
		...SHADOWS.medium,
	}, 
	statNumber: {
		fontSize: 24, fontFamily: FONT.bold, color: COLORS.secondary, marginBottom: 4,
	}, 
	statLabel: {
		fontSize: 14, fontFamily: FONT.regular, color: COLORS.gray, textAlign: 'center',
	}, 
	infoContainer: Platform.OS === 'web' ? {
		backgroundColor: COLORS.black100,
		borderRadius: 8,
		padding: 16,
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.05)', 
		...SHADOWS.small,
	} : {
		backgroundColor: COLORS.black100, borderRadius: 8, padding: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.15)',
		...SHADOWS.medium,
	}, 
	infoText: {
		fontSize: 14, fontFamily: FONT.regular, color: COLORS.gray, lineHeight: 20,
	}, 
	startTripButton: Platform.OS === 'web' ? {
		marginTop: 24,
	} : {
		marginTop: 24, 
		...SHADOWS.medium,
	}, 
	addRouteButton: Platform.OS === 'web' ? {
		marginTop: 16, backgroundColor: COLORS.black100, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)', 
		...SHADOWS.small,
	} : {
		marginTop: 16, backgroundColor: COLORS.black100, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.15)',
		...SHADOWS.medium,
	}, 
	sectionTitle: {
		fontSize: 20, fontFamily: FONT.semiBold, color: COLORS.white, marginTop: 32, marginBottom: 16,
	}, 
	tabContainer: Platform.OS === 'web' ? {
		flexDirection: 'row',
		marginBottom: 0,
		borderTopLeftRadius: 8,
		borderTopRightRadius: 8,
		overflow: 'hidden',
		backgroundColor: COLORS.black200,
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.08)',
		borderBottomWidth: 0,
	} : {
		flexDirection: 'row', marginBottom: 0,
		borderTopLeftRadius: 8,
		borderTopRightRadius: 8,
		overflow: 'hidden', backgroundColor: COLORS.black200, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)',
		borderBottomWidth: 0,
	}, 
	tabButton: {
		flex: 1, paddingVertical: 8, paddingHorizontal: 12, alignItems: 'center',
	}, 
	tabButtonActive: Platform.OS === 'web' ? {
		backgroundColor: COLORS.secondary, 
		...SHADOWS.small,
	} : {
		backgroundColor: COLORS.secondary, 
		...SHADOWS.medium,
	}, 
	tabText: {
		fontSize: 14, fontFamily: FONT.medium, color: COLORS.gray,
	}, 
	tabTextActive: {
		color: COLORS.white, fontFamily: FONT.semiBold,
	}, 
	tabContent: {
		paddingTop: 8,
	}, 
	tabContentContainer: Platform.OS === 'web' ? {
		backgroundColor: COLORS.primary,
		borderBottomLeftRadius: 8,
		borderBottomRightRadius: 8,
		padding: 16,
		marginBottom: 16,
		borderWidth: 1,
		borderTopWidth: 0,
		borderColor: 'rgba(255, 255, 255, 0.05)', 
		...SHADOWS.small,
	} : {
		backgroundColor: COLORS.primary,
		borderBottomLeftRadius: 8,
		borderBottomRightRadius: 8,
		padding: 16,
		marginBottom: 16,
		borderWidth: 1,
		borderTopWidth: 0,
		borderColor: 'rgba(255, 255, 255, 0.15)', 
		...SHADOWS.medium,
	}, 
	basicTabContent: {
		borderLeftWidth: 3, borderLeftColor: COLORS.secondary,
	}, 
	odometerTabContent: {
		borderLeftWidth: 3, borderLeftColor: COLORS.highlight,
	}, 
	fuelTabContent: {
		borderLeftWidth: 3, borderLeftColor: COLORS.gray,
	}, 
	highlightedText: {
		color: COLORS.highlight, fontFamily: FONT.semiBold,
	},
})
