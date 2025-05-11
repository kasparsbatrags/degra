import {COLORS, CONTAINER_WIDTH, FONT, SHADOWS} from '@/constants/theme'
import {useAuth} from '@/context/AuthContext'
import {useFocusEffect, useRouter} from 'expo-router'
import React, {useCallback, useEffect, useState} from 'react'
import {ActivityIndicator, FlatList, Platform, Pressable, StyleSheet, Text, TextStyle, View, ViewStyle, RefreshControl} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import Button from '../../components/Button'
import freightAxiosInstance from '../../config/freightAxios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {isConnected} from '@/utils/networkUtils'
import {isSessionActive} from '@/utils/sessionUtils'
import {isRedirectingToLogin} from '@/config/axios'
import {startSessionTimeoutCheck, stopSessionTimeoutCheck} from '@/utils/sessionTimeoutHandler'

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
	
	// Konstante lokālās datubāzes atslēgai
	const LAST_ROUTE_STATUS_KEY = 'lastRouteStatus'
	
	// Pārbaudam sesijas statusu, kad komponente tiek ielādēta
	useEffect(() => {
		const checkSession = async () => {
			const sessionActive = await isSessionActive();
			if (!sessionActive && !isRedirectingToLogin) {
				router.replace('/(auth)/login');
			}
		};
		
		checkSession();
	}, [router]);
	
	// Uzsākam periodisku sesijas pārbaudi (tikai web platformai)
	useEffect(() => {
		// Pārbaudam, vai esam web platformā
		if (Platform.OS === 'web') {
			// Uzsākam sesijas pārbaudi
			startSessionTimeoutCheck();
			
			// Apturām sesijas pārbaudi, kad komponente tiek noņemta
			return () => {
				stopSessionTimeoutCheck();
			};
		}
	}, []);

	const checkLastRouteStatus = useCallback(async () => {
		// Iestatām ielādes stāvokli
		setStatusCheckLoading(true)
		
		// Notīrām iepriekšējo kļūdas ziņojumu
		setErrorMessage(null)
		
		// Pārbaudam, vai jau nenotiek pārvirzīšana uz login lapu
		if (isRedirectingToLogin) {
			setStatusCheckLoading(false)
			return
		}
		
		try {
			// Pārbaudām, vai sesija ir aktīva
			const sessionActive = await isSessionActive()
			if (!sessionActive) {
				// Ja sesija nav aktīva, pārvirzām uz login lapu
				router.replace('/(auth)/login')
				setStatusCheckLoading(false)
				return
			}
			
			// Pārbaudām, vai ierīce ir pieslēgta internetam
			const connected = await isConnected()
			
			if (connected) {
				// Ja ir savienojums, mēģinām iegūt datus no servera
				try {
					await freightAxiosInstance.get('/truck-routes/last-active')
					setButtonText('FINIŠS')
					
					// Saglabājam statusu lokālajā datubāzē
					await AsyncStorage.setItem(LAST_ROUTE_STATUS_KEY, 'active')
				} catch (error: any) {
					if (error.response?.status === 404) {
						setButtonText('STARTS')
						
						// Saglabājam statusu lokālajā datubāzē
						await AsyncStorage.setItem(LAST_ROUTE_STATUS_KEY, 'inactive')
					} else if (!error.response) {
						// Ja nav atbildes no servera, mēģinām iegūt statusu no lokālās datubāzes
						const localStatus = await AsyncStorage.getItem(LAST_ROUTE_STATUS_KEY)
						
						if (localStatus) {
							// Ja ir lokāli saglabāts statuss, izmantojam to
							setButtonText(localStatus === 'active' ? 'FINIŠS' : 'STARTS')
						} else {
							// Ja nav lokāli saglabāta statusa, parādām kļūdas ziņojumu
							setErrorMessage("Neizdevās pieslēgties - serveris neatbild. Lūdzu, mēģiniet vēlreiz mazliet vēlāk!")
						}
					}
				}
			} else {
				// Ja nav savienojuma, mēģinām iegūt statusu no lokālās datubāzes
				const localStatus = await AsyncStorage.getItem(LAST_ROUTE_STATUS_KEY)
				
				if (localStatus) {
					// Ja ir lokāli saglabāts statuss, izmantojam to
					setButtonText(localStatus === 'active' ? 'FINIŠS' : 'STARTS')
				} else {
					// Ja nav lokāli saglabāta statusa, parādām kļūdas ziņojumu
					setErrorMessage("Neizdevās pieslēgties - serveris neatbild. Lūdzu, mēģiniet vēlreiz mazliet vēlāk!")
				}
			}
		} catch (error: any) {
			console.error('Error checking route status:', error)
			setErrorMessage("Neizdevās pieslēgties - serveris neatbild. Lūdzu, mēģiniet vēlreiz mazliet vēlāk!")
		} finally {
			// Atiestatām ielādes stāvokli
			setStatusCheckLoading(false)
		}
	}, [])

	const fetchRoutes = async () => {
		try {
			// Pārbaudam, vai sesija ir aktīva un vai jau nenotiek pārvirzīšana uz login lapu
			if (isRedirectingToLogin) {
				setLoading(false)
				return
			}
			
			const sessionActive = await isSessionActive()
			if (!sessionActive) {
				// Ja sesija nav aktīva, pārvirzām uz login lapu
				router.replace('/(auth)/login')
				setLoading(false)
				return
			}
			
			const response = await freightAxiosInstance.get<TruckRoutePage[]>('/route-pages')
			setRoutes(response.data.map(route => ({...route, activeTab: 'basic' as const})))
		} catch (error: any) {
			console.error('Failed to fetch routes:', error)
			// Ja kļūda ir saistīta ar tīkla problēmām, parādām kļūdas ziņojumu
			if (!error.response) {
				setErrorMessage("Neizdevās ielādēt datus - serveris neatbild. Lūdzu, mēģiniet vēlreiz mazliet vēlāk!")
			}
		} finally {
			setLoading(false)
		}
	}

	// Fetch data when screen comes into focus
	useFocusEffect(React.useCallback(() => {
		// Pārbaudam, vai jau nenotiek pārvirzīšana uz login lapu
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
			<Button
					title={buttonText}
					onPress={() => router.push('/truck-route')}
					style={styles.startTripButton}
					disabled={errorMessage !== null || statusCheckLoading}
					loading={statusCheckLoading}
			/>
			{errorMessage && (
				<View style={styles.errorContainer}>
					<Text style={styles.errorText}>{errorMessage}</Text>
					<Button 
						title="Pārbaudīt"
						onPress={checkLastRouteStatus}
						style={styles.refreshButton}
						loading={statusCheckLoading}
					/>
				</View>
			)}
			{loading ? (<ActivityIndicator size="large" color={COLORS.secondary} style={styles.loader} />) : (<FlatList
					refreshControl={
						<RefreshControl
							refreshing={loading}
							onRefresh={() => {
								setLoading(true);
								fetchRoutes();
								checkLastRouteStatus();
							}}
						/>
					}
					data={routes}
					keyExtractor={(item) => item.id.toString()}
					style={styles.list}
					renderItem={({item}) => (
						<Pressable
							style={({pressed}) => [
								styles.routeCard,
								pressed && styles.routeCardPressed
							]}
							onPress={() => router.push({
								pathname: "/(tabs)/truck-route-page",
								params: { id: item.id }
							})}
						>
							<View style={styles.routeInfo}>
							{/* Tab buttons */}
							<View style={styles.tabContainer}>
								<Pressable
									style={[styles.tabButton, item.activeTab === 'basic' && styles.tabButtonActive]}
									onPress={() => {
										const newRoutes = routes.map(route =>
											route.id === item.id
												? {...route, activeTab: 'basic' as const}
												: route
										)
										setRoutes(newRoutes)
									}}
								>
									<Text style={[styles.tabText, item.activeTab === 'basic' && styles.tabTextActive]}>Pamatinfo</Text>
								</Pressable>
								<Pressable
									style={[styles.tabButton, item.activeTab === 'odometer' && styles.tabButtonActive]}
									onPress={() => {
										const newRoutes = routes.map(route =>
											route.id === item.id
												? {...route, activeTab: 'odometer' as const}
												: route
										)
										setRoutes(newRoutes)
									}}
								>
									<Text style={[styles.tabText, item.activeTab === 'odometer' && styles.tabTextActive]}>Odometrs</Text>
								</Pressable>
								<Pressable
									style={[styles.tabButton, item.activeTab === 'fuel' && styles.tabButtonActive]}
									onPress={() => {
										const newRoutes = routes.map(route =>
											route.id === item.id
												? {...route, activeTab: 'fuel' as const}
												: route
										)
										setRoutes(newRoutes)
									}}
								>
									<Text style={[styles.tabText, item.activeTab === 'fuel' && styles.tabTextActive]}>Degviela</Text>
								</Pressable>
							</View>

							{/* Tab content */}
							{item.activeTab === 'basic' && (
								<View style={styles.tabContent}>
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
											{[user?.firstName, user?.lastName].filter(Boolean).join(" ")}
										</Text>
									</View>
								</View>
							)}

							{item.activeTab === 'odometer' && (
								<View style={styles.tabContent}>
									<View style={styles.routeRow}>
										<Text style={styles.routeLabelInline}>Sākumā:</Text>
										<Text style={styles.routeText}>{item.odometerAtRouteStart?.toLocaleString() ?? '0'} km</Text>
									</View>
									<View style={styles.routeRow}>
										<Text style={styles.routeLabelInline}>Nobraukts:</Text>
										<Text style={[styles.routeText, styles.highlightedText]}>{item.computedTotalRoutesLength?.toLocaleString() ?? '0'} km</Text>
									</View>
									<View style={styles.routeRow}>
										<Text style={styles.routeLabelInline}>Beigās:</Text>
										<Text style={[styles.routeText, styles.routeText]}>{item.odometerAtRouteFinish?.toLocaleString() ?? '0'} km</Text>									</View>
								</View>
							)}

							{item.activeTab === 'fuel' && (
								<View style={styles.tabContent}>
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
	highlightedText: TextStyle;
	errorContainer: ViewStyle;
	errorText: TextStyle;
	refreshButton: ViewStyle;
};

const styles = StyleSheet.create<Styles>({
	refreshButton: {
		marginTop: 12,
		backgroundColor: COLORS.secondary,
		borderRadius: 8,
		paddingVertical: 8,
		paddingHorizontal: 16,
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
		fontSize: 14,
		fontFamily: FONT.medium,
		color: '#FF6B6B',
		textAlign: 'center',
	},
	routeCardPressed: {
		opacity: 0.7,
		transform: [{scale: 0.98}],
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
		borderColor: 'rgba(255, 255, 255, 0.15)', // Increased opacity for mobile
		...SHADOWS.medium, // Using medium shadows for better visibility on mobile
	},
	routeInfo: {
		marginBottom: 8,
	},
	routeRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 8,
	},
	routeLabel: {
		fontSize: 14,
		fontFamily: FONT.medium,
		color: COLORS.gray,
		marginBottom: 4,
	},
	routeLabelInline: {
		fontSize: 14,
		fontFamily: FONT.medium,
		color: COLORS.gray,
		marginRight: 8,
		flex: 0.33, // 1/3 of the width
	},
	routeText: {
		fontSize: 16,
		fontFamily: FONT.semiBold,
		color: COLORS.white,
		flex: 0.67, // 2/3 of the width
		textAlign: 'right',
	},
	emptyContainer: {
		alignItems: 'center',
		marginTop: 24,
	},
	emptyText: {
		fontSize: 16,
		fontFamily: FONT.regular,
		color: COLORS.gray,
	},
	container: {
		flex: 1,
		backgroundColor: COLORS.primary,
	},
	content: Platform.OS === 'web' ? {
		flex: 1,
		paddingHorizontal: 16,
		marginVertical: 24,
		width: '100%' as const,
		maxWidth: CONTAINER_WIDTH.web,
		alignSelf: 'center' as const,
	} : {
		flex: 1,
		paddingHorizontal: 16,
		marginVertical: 24,
		width: CONTAINER_WIDTH.mobile,
		alignSelf: 'center' as const,
	},
	heading: {
		fontSize: 32,
		fontFamily: FONT.bold,
		color: COLORS.white,
		textAlign: 'center',
		marginBottom: 40,
	},
	title: {
		fontSize: 24,
		fontFamily: FONT.semiBold,
		color: COLORS.white,
		marginBottom: 8,
	},
	subtitle: {
		fontSize: 16,
		fontFamily: FONT.regular,
		color: COLORS.gray,
		marginBottom: 24,
	},
	statsContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 24,
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
		borderColor: 'rgba(255, 255, 255, 0.15)', // Increased opacity for mobile
		...SHADOWS.medium, // Using medium shadows for better visibility on mobile
	},
	statNumber: {
		fontSize: 24,
		fontFamily: FONT.bold,
		color: COLORS.secondary,
		marginBottom: 4,
	},
	statLabel: {
		fontSize: 14,
		fontFamily: FONT.regular,
		color: COLORS.gray,
		textAlign: 'center',
	},
	infoContainer: Platform.OS === 'web' ? {
		backgroundColor: COLORS.black100,
		borderRadius: 8,
		padding: 16,
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.05)',
		...SHADOWS.small,
	} : {
		backgroundColor: COLORS.black100,
		borderRadius: 8,
		padding: 16,
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.15)', // Increased opacity for mobile
		...SHADOWS.medium, // Using medium shadows for better visibility on mobile
	},
	infoText: {
		fontSize: 14,
		fontFamily: FONT.regular,
		color: COLORS.gray,
		lineHeight: 20,
	},
	startTripButton: Platform.OS === 'web' ? {
		marginTop: 24,
	} : {
		marginTop: 24,
		...SHADOWS.medium, // Using medium shadows for better visibility on mobile
	},
	addRouteButton: Platform.OS === 'web' ? {
		marginTop: 16,
		backgroundColor: COLORS.black100,
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.05)',
		...SHADOWS.small,
	} : {
		marginTop: 16,
		backgroundColor: COLORS.black100,
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.15)', // Increased opacity for mobile
		...SHADOWS.medium, // Using medium shadows for better visibility on mobile
	},
	sectionTitle: {
		fontSize: 20,
		fontFamily: FONT.semiBold,
		color: COLORS.white,
		marginTop: 32,
		marginBottom: 16,
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
	tabContent: {
		paddingTop: 8,
	},
	highlightedText: {
		color: COLORS.highlight,
		fontFamily: FONT.semiBold,
	},
})
