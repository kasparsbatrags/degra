import FormDatePicker from '@/components/FormDatePicker'
import FormDropdown from '@/components/FormDropdown'
import {commonStyles, formStyles} from '@/constants/styles'
import {format} from 'date-fns'
import {router, useLocalSearchParams} from 'expo-router'
import React, {useEffect, useState} from 'react'
import {ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import Button from '../../components/Button'
import FormInput from '../../components/FormInput'
import freightAxios from '../../config/freightAxios'
import {COLORS, CONTAINER_WIDTH, FONT} from '../../constants/theme'

interface TruckRoutePageForm {
	dateFrom: Date;
	dateTo: Date;
	truck: string;
	fuelBalanceAtStart: string;
	fuelBalanceAtFinish: string;
}

interface Truck {
	id: number;
	truckMaker?: string;
	truckModel?: string;
	registrationNumber?: string;
	fuelConsumptionNorm?: number;
	isDefault?: boolean;
}

interface TruckRoute {
	id: number;
	routeDate: string;
	outTruckObject: { id: number; name?: string };
	inTruckObject: { id: number; name?: string };
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
	const {id} = useLocalSearchParams<{ id: string }>()
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isLoading, setIsLoading] = useState(!!id)
	const [isEditMode, setIsEditMode] = useState(!id)
	const [activeTab, setActiveTab] = useState<'basic' | 'routes'>('basic')
	const [truckRoutes, setTruckRoutes] = useState<TruckRoute[]>([])
	const [form, setForm] = useState<TruckRoutePageForm>({
		dateFrom: new Date(),
		dateTo: new Date(),
		truck: '',
		fuelBalanceAtStart: '',
		fuelBalanceAtFinish: '',
	})

	useEffect(() => {
		if (id) {
			fetchRouteDetails()
			fetchTruckRoutes()
		}
	}, [id])

	const fetchRouteDetails = async () => {
		try {
			const response = await freightAxios.get(`/api/freight-tracking/route-pages/${id}`)
			const routeData = response.data

			setForm({
				dateFrom: new Date(routeData.dateFrom),
				dateTo: new Date(routeData.dateTo),
				truck: routeData.truck?.id?.toString() || '',
				fuelBalanceAtStart: routeData.fuelBalanceAtStart.toString(),
				fuelBalanceAtFinish: routeData.fuelBalanceAtFinish?.toString() ?? '',
			})
		} catch (error) {
			console.error('Failed to fetch route details:', error)
		} finally {
			setIsLoading(false)
		}
	}

	const fetchTruckRoutes = async () => {
		if (!id) return;
		
		try {
			const response = await freightAxios.get(`/api/freight-tracking/truck-routes/by-page/${id}`)
			// Handle paginated response
			if (response.data.content) {
				setTruckRoutes(response.data.content)
			} else {
				setTruckRoutes(response.data)
			}
		} catch (error) {
			console.error('Failed to fetch truck routes:', error)
		}
	}

	const handleSubmit = async () => {
		try {
			setIsSubmitting(true)

			const payload = {
				dateFrom: format(form.dateFrom, 'yyyy-MM-dd'),
				dateTo: format(form.dateTo, 'yyyy-MM-dd'),
				truck:  {id: parseInt(form.truck)},
				fuelBalanceAtStart: parseFloat(form.fuelBalanceAtStart),
				fuelBalanceAtFinish: form.fuelBalanceAtFinish ? parseFloat(form.fuelBalanceAtFinish) : null,
			}
			console.log("===========================")
			console.log(format(form.dateFrom, 'yyyy-MM-dd'))
			if (id) {
				await freightAxios.put(`/api/freight-tracking/route-pages/${id}`, payload)
			} else {
				await freightAxios.post('/api/freight-tracking/route-pages', payload)
			}
			router.push('/(tabs)')
		} catch (error) {
			console.error('Failed to submit form:', error)
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
				{/*<Text style={styles.title}>*/}
				{/*	{id ? (isEditMode ? 'Rediģēt maršruta lapu' : 'Maršruta lapa') : 'Pievienot maršruta lapu'}*/}
				{/*</Text>*/}

				{id && !isEditMode && (<Button
						title="Rediģēt"
						onPress={() => setIsEditMode(true)}
						style={styles.editButton}
				/>)}

				{/* Tab buttons */}
				{id && !isEditMode && (
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
				{(activeTab === 'basic' || isEditMode) && (
					<>
						<View style={styles.inputWrapper}>
							<View style={[formStyles.inputContainer, styles.truckField]}>
								<FormDropdown
										label="Auto"
										value={form.truck}
										onSelect={(value) => setForm(prevForm => ({...prevForm, truck: value}))}
										placeholder="Izvēlieties"
										endpoint="/api/freight-tracking/trucks"
										disabled={!isEditMode}
										// error={!form.routePageTruck ? 'Ievadiet datus!' : undefined}
								/>
							</View>
						</View>

						<View style={commonStyles.row}>
							<FormDatePicker
									label="Sākuma datums"
									value={form.dateFrom}
									onChange={(date) => setForm(prevForm => ({...prevForm, dateFrom: date}))}
									error="Lauks ir obligāts"
									showError={!form.dateFrom}
									disabled={!isEditMode}
							/>
							<FormDatePicker
									label="Beigu datums"
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

				{activeTab === 'routes' && !isEditMode && (
					<View style={styles.routesContainer}>
						{truckRoutes.length > 0 ? (
							truckRoutes.map((route) => (
								<View key={route.id} style={styles.routeCard}>
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
							))
						) : (
							<Text style={styles.emptyText}>Nav braucienu</Text>
						)}
					</View>
				)}
				<View style={styles.buttonContainer}>
					<Button
							title="Atpakaļ"
							onPress={() => {
								if (isEditMode) {
									setIsEditMode(false)
								} else {
									router.push('/(tabs)')
								}
							}}
							style={styles.backButton}
					/>
					{isEditMode && (<Button
							title={id ? 'Saglabāt' : 'Pievienot'}
							onPress={handleSubmit}
							style={styles.submitButton}
							disabled={isSubmitting}
					/>)}
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
	}, loadingContainer: {
		flex: 1, justifyContent: 'center', alignItems: 'center',
	}, content: Platform.OS === 'web' ? {
		flex: 1, paddingHorizontal: 16, marginVertical: 24, width: '100%', maxWidth: CONTAINER_WIDTH.web, alignSelf: 'center',
	} : {
		flex: 1, paddingHorizontal: 16, marginVertical: 24, width: CONTAINER_WIDTH.mobile,
	}, title: {
		fontSize: 24, fontFamily: FONT.semiBold, color: COLORS.white, marginBottom: 24,
	}, editButton: {
		marginBottom: 16, backgroundColor: COLORS.secondary,
	}, notificationContainer: {
		backgroundColor: COLORS.black100, padding: 12, borderRadius: 8, marginBottom: 16, borderWidth: 2, borderColor: COLORS.secondary,
	}, notificationText: {
		color: COLORS.white, fontSize: 18, fontFamily: FONT.semiBold, textAlign: 'center',
	}, dateSection: {
		backgroundColor: COLORS.black100, padding: 16, borderRadius: 8, marginBottom: 24,
	}, buttonContainer: {
		flexDirection: 'row', justifyContent: 'space-between', gap: 16, marginTop: 24,
	}, backButton: {
		flex: 1, backgroundColor: COLORS.black100,
	}, submitButton: {
		flex: 1,
	}, dateContainer: {
		marginBottom: 16,
	}, label: {
		fontSize: 16, fontFamily: FONT.medium, color: COLORS.white, marginBottom: 8,
	}, dateButton: {
		backgroundColor: COLORS.black100, padding: 12, borderRadius: 8,
	}, disabled: {
		opacity: 0.5,
	}, dateText: {
		color: COLORS.white, fontSize: 16, fontFamily: FONT.regular,
	}, modalOverlay: {
		flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center',
	}, modalContent: {
		backgroundColor: COLORS.black100, padding: 16, borderRadius: 12, width: '90%', maxWidth: 400,
	}, calendarHeader: {
		flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
	}, monthButton: {
		padding: 8,
	}, monthButtonText: {
		color: COLORS.white, fontSize: 24, fontFamily: FONT.medium,
	}, monthYearText: {
		color: COLORS.white, fontSize: 16, fontFamily: FONT.medium, textTransform: 'capitalize',
	}, weekDaysRow: {
		flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8,
	}, weekDayText: {
		width: '14.28%',
		textAlign: 'center',
		color: COLORS.white,
		marginBottom: 8,
		fontSize: 12,
		fontFamily: FONT.medium,
		textTransform: 'uppercase',
	}, daysGrid: {
		flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingTop: 8,
	}, dayButton: {
		width: '14.28%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', marginVertical: 4, borderRadius: 8,
	}, dayText: {
		color: COLORS.white, fontSize: 14, fontFamily: FONT.regular,
	}, selectedDay: {
		backgroundColor: COLORS.secondary,
	}, todayDay: {
		borderWidth: 1, borderColor: COLORS.secondary,
	}, selectedDayText: {
		color: COLORS.white, fontFamily: FONT.bold,
	}, todayDayText: {
		color: COLORS.secondary, fontFamily: FONT.medium,
	}, inputWrapper: {
		flex: 1
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
	routesContainer: {
		marginTop: 16,
	},
	routeCard: {
		backgroundColor: COLORS.black100,
		borderRadius: 8,
		padding: 16,
		marginBottom: 12,
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
})
