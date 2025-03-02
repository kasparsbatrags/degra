import FormDatePicker from '@/components/FormDatePicker'
import FormDropdown from '@/components/FormDropdown'
import {commonStyles, formStyles} from '@/constants/styles'
import {router, useLocalSearchParams} from 'expo-router'
import React, {useEffect, useState} from 'react'
import {ActivityIndicator, Platform, ScrollView, StyleSheet, Text, View} from 'react-native'
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


export default function TruckRoutePageScreen() {
	const {id} = useLocalSearchParams<{ id: string }>()
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isLoading, setIsLoading] = useState(!!id)
	const [isEditMode, setIsEditMode] = useState(!id)
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

	const handleSubmit = async () => {
		try {
			setIsSubmitting(true)

			const payload = {
				dateFrom: form.dateFrom.toISOString().split('T')[0],
				dateTo: form.dateTo.toISOString().split('T')[0],
				truck:  {id: parseInt(form.truck)},
				fuelBalanceAtStart: parseFloat(form.fuelBalanceAtStart),
				fuelBalanceAtFinish: form.fuelBalanceAtFinish ? parseFloat(form.fuelBalanceAtFinish) : null,
			}

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
				<Text style={styles.title}>
					{id ? (isEditMode ? 'Rediģēt maršruta lapu' : 'Maršruta lapa') : 'Pievienot maršruta lapu'}
				</Text>

				{id && !isEditMode && (<Button
						title="Rediģēt"
						onPress={() => setIsEditMode(true)}
						style={styles.editButton}
				/>)}

				<View style={styles.inputWrapper}>

					<View style={[formStyles.inputContainer, styles.truckField]}>
						<FormDropdown
								label="Auto"
								value={form.truck}
								onSelect={(value) => setForm({...form, truck: value})}
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
							onChange={(date) => setForm({...form, dateFrom: date})}
							error="Lauks ir obligāts"
							showError={!form.dateFrom}
							disabled={!isEditMode}
					/>
					<FormDatePicker
							label="Beigu datums"
							value={form.dateTo}
							onChange={(date) => setForm({...form, dateTo: date})}
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
										setForm({...form, fuelBalanceAtStart: text})
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
										setForm({...form, fuelBalanceAtFinish: text})
									}
								}}
								placeholder="Ievadiet degvielas atlikumu"
								keyboardType="numeric"
								editable={isEditMode}
						/>
					</View>
				</View>
				<View style={styles.buttonContainer}>
					<Button
							title="Atpakaļ"
							onPress={() => router.push('/(tabs)')}
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
})
