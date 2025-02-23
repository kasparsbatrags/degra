import {COLORS, CONTAINER_WIDTH, FONT} from '@/constants/theme'
import {useAuth} from '@/context/AuthContext'
import {useFocusEffect, useRouter} from 'expo-router'
import React, {useCallback, useEffect, useState} from 'react'
import {ActivityIndicator, FlatList, Platform, Pressable, StyleSheet, Text, TextStyle, View, ViewStyle} from 'react-native'
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
	fuelBalanceAtEnd: number | null;
	receivedFuel: number | null;
	routeLength: number | null;
	odometerStart: number | null;
	odometerEnd: number | null;
	activeTab?: 'basic' | 'odometer' | 'fuel';
}

export default function HomeScreen() {
	const {user} = useAuth()
	const router = useRouter()
	const [routes, setRoutes] = useState<TruckRoutePage[]>([])
	const [loading, setLoading] = useState(true)
	const [buttonText, setButtonText] = useState('Starts')

	const checkLastRouteStatus = useCallback(async () => {
		try {
			await freightAxiosInstance.get('/api/freight-tracking/truck-routes/last')
			setButtonText('FINIŠS')
		} catch (error: any) {
			if (error.response?.status === 404) {
				setButtonText('STARTS')
			}
		}
	}, [])

	const fetchRoutes = async () => {
		try {
			const response = await freightAxiosInstance.get<TruckRoutePage[]>('/api/freight-tracking/route-pages')
			setRoutes(response.data.map(route => ({...route, activeTab: 'basic' as const})))
		} catch (error) {
			console.error('Failed to fetch routes:', error)
		} finally {
			setLoading(false)
		}
	}

	// Fetch data when screen comes into focus
	useFocusEffect(React.useCallback(() => {
		setLoading(true)
		fetchRoutes()
		checkLastRouteStatus()
	}, []))

	// Initial fetch
	useEffect(() => {
		fetchRoutes()
	}, [])

	return (<SafeAreaView style={styles.container}>
		<View style={styles.content}>
			<Text style={styles.title}>Sveicināti, {user?.firstName}!</Text>

			<Button
					title={buttonText}
					onPress={() => router.push('/truck-route')}
					style={styles.startTripButton}
			/>

			{loading ? (<ActivityIndicator size="large" color={COLORS.secondary} style={styles.loader} />) : (<FlatList
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
								</View>
							)}

							{item.activeTab === 'odometer' && (
								<View style={styles.tabContent}>
									<View style={styles.routeRow}>
										<Text style={styles.routeLabelInline}>Sākumā:</Text>
										<Text style={styles.routeText}>{item.odometerStart?.toLocaleString() ?? '0'} km</Text>
									</View>
									<View style={styles.routeRow}>
										<Text style={styles.routeLabelInline}>Nobraukts:</Text>
										<Text style={[styles.routeText, styles.highlightedText]}>+{item.routeLength?.toLocaleString() ?? '0'} km</Text>
									</View>
									<View style={styles.routeRow}>
										<Text style={styles.routeLabelInline}>Beigās:</Text>
										<Text style={styles.routeText}>
											{item.odometerEnd?.toLocaleString() ?? 
												((item.odometerStart && item.routeLength) 
													? (item.odometerStart + item.routeLength).toLocaleString()
													: '0')
											} km
										</Text>
									</View>
								</View>
							)}

							{item.activeTab === 'fuel' && (
								<View style={styles.tabContent}>
									<View style={styles.routeRow}>
										<Text style={styles.routeLabelInline}>Sākumā:</Text>
										<Text style={styles.routeText}>{item.fuelBalanceAtStart} L</Text>
									</View>
									<View style={styles.routeRow}>
										<Text style={styles.routeLabelInline}>Saņemta:</Text>
										<Text style={[styles.routeText, styles.highlightedText]}>+{item.receivedFuel ?? '0'} L</Text>
									</View>
									<View style={styles.routeRow}>
										<Text style={styles.routeLabelInline}>Beigās:</Text>
										<Text style={styles.routeText}>{item.fuelBalanceAtEnd ?? '0'} L</Text>
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
};

const styles = StyleSheet.create<Styles>({
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
	routeCard: {
		backgroundColor: COLORS.black100,
		borderRadius: 8,
		padding: 16,
		marginBottom: 12,
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
	statCard: {
		flex: 1,
		backgroundColor: COLORS.black100,
		borderRadius: 8,
		padding: 16,
		marginHorizontal: 8,
		alignItems: 'center',
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
	infoContainer: {
		backgroundColor: COLORS.black100,
		borderRadius: 8,
		padding: 16,
	},
	infoText: {
		fontSize: 14,
		fontFamily: FONT.regular,
		color: COLORS.gray,
		lineHeight: 20,
	},
	startTripButton: {
		marginTop: 24,
	},
	addRouteButton: {
		marginTop: 16,
		backgroundColor: COLORS.black100,
	},
	sectionTitle: {
		fontSize: 20,
		fontFamily: FONT.semiBold,
		color: COLORS.white,
		marginTop: 32,
		marginBottom: 16,
	},
	tabContainer: {
		flexDirection: 'row',
		marginBottom: 16,
		borderRadius: 8,
		overflow: 'hidden',
		backgroundColor: COLORS.black200,
	},
	tabButton: {
		flex: 1,
		paddingVertical: 8,
		paddingHorizontal: 12,
		alignItems: 'center',
	},
	tabButtonActive: {
		backgroundColor: COLORS.secondary,
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
		color: COLORS.secondary,
	},
})
