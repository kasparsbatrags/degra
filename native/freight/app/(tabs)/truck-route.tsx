import {commonStyles, formStyles} from '@/constants/styles'
import {COLORS, CONTAINER_WIDTH} from '@/constants/theme'
import {router} from 'expo-router'
import React, {useState} from 'react'
import {Platform, ScrollView, StyleSheet, Switch, Text, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import Button from '../../components/Button'
import FormDatePicker from '../../components/FormDatePicker'
import FormDropdown from '../../components/FormDropdown'
import FormInput from '../../components/FormInput'
import freightAxios from '../../config/freightAxios'

export default function TruckRouteScreen() {
	const [hasCargo, setHasCargo] = useState(false)
	const [showRoutePageError, setShowRoutePageError] = useState(false)
	const [form, setForm] = useState({
		routeDate: new Date(),
		outDateTime: new Date(),
		dateFrom: new Date(),
		dateTo: new Date(),
		routePageTruck: '',
		odometerAtStart: '',
		odometerAtFinish: '',
		outTruckObject: '',
		inTruckObject: '',
		cargoType: '',
		cargoVolume: '',
		unitType: '',
		fuelBalanceAtStart: '',
		fuelReceived: '',
		notes: '',
	})

	const [isSubmitting, setIsSubmitting] = useState(false)

	const checkRoutePage = React.useCallback((() => {
		let timeoutId: NodeJS.Timeout
		return async (truckId: string, date: Date) => {
			if (!truckId || !date) return

			// Clear previous timeout
			if (timeoutId) clearTimeout(timeoutId)

			// Set new timeout
			timeoutId = setTimeout(async () => {
				try {
					const formattedDate = date.toISOString().split('T')[0]
					const response = await freightAxios.get(`/api/freight-tracking/route-pages/exists?truckId=${truckId}&routeDate=${formattedDate}`)
					setShowRoutePageError(!response.data)
				} catch (error) {
					console.error('Failed to check route page:', error)
				}
			}, 300) // 300ms debounce
		}
	})(), [])

	// Initialize form with default values
	React.useEffect(() => {
		const initializeForm = async () => {
			try {
				const response = await freightAxios.get('/api/freight-tracking/trucks')
				if (response.data && response.data.length > 0) {
					const defaultTruck = response.data[0].id.toString()
					const currentDate = new Date()
					setForm(prev => ({
						...prev, routeDate: currentDate, routePageTruck: defaultTruck
					}))
				}
			} catch (error) {
				console.error('Failed to fetch default truck:', error)
			}
		}
		initializeForm()
	}, [checkRoutePage])

	// Check route page when either truck or date changes, but not on initial mount
	React.useEffect(() => {
		const isInitialMount = !form.routePageTruck
		if (!isInitialMount) {
			checkRoutePage(form.routePageTruck, form.routeDate)
		}
	}, [form.routePageTruck, form.routeDate, checkRoutePage])

	const handleSubmit = async () => {
		try {
			setIsSubmitting(true)

			// Convert form data to match TruckRouteDto structure
			const now = new Date().toISOString() // Current time in ISO format for Instant
			const payload = {
				routeDate: form.routeDate.toISOString().split('T')[0], // Format date as YYYY-MM-DD
				truckRoutePage: form.routePageTruck ? {
					truck: {id: parseInt(form.routePageTruck)}
				} : null,
				outTruckObject: form.outTruckObject ? {id: parseInt(form.outTruckObject)} : null,
				inTruckObject: form.inTruckObject ? {id: parseInt(form.inTruckObject)} : null,
				odometerAtStart: form.odometerAtStart ? parseInt(form.odometerAtStart) : null,
				odometerAtFinish: form.odometerAtFinish ? parseInt(form.odometerAtFinish) : null,
				cargoVolume: hasCargo && form.cargoVolume ? parseFloat(form.cargoVolume) : null,
				unitType: hasCargo ? form.unitType : null,
				fuelBalanceAtStart: form.fuelBalanceAtStart ? parseFloat(form.fuelBalanceAtStart) : null,
				fuelReceived: form.fuelReceived ? parseFloat(form.fuelReceived) : null,
				outDateTime: now,
				inDateTime: form.inTruckObject ? now : null // If destination is set, also set inDateTime
			}

			await freightAxios.post('/api/freight-tracking/truck-routes', payload)
			router.push('/(tabs)')
		} catch (error) {
			console.error('Failed to submit form:', error)
			// You might want to add error handling UI here
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<SafeAreaView style={commonStyles.safeArea}>
			<ScrollView>
				<View style={[commonStyles.content, styles.webContainer]}>
					<View id="top" style={[styles.topContainer]}>
						<View style={commonStyles.row}>
							<FormDatePicker
								label="Brauciena datums"
								value={form.routeDate}
								onChange={(date) => setForm({...form, routeDate: date})}
							/>
							<View style={[formStyles.inputContainer, styles.truckField]}>
								<FormDropdown
									label="Auto"
									value={form.routePageTruck}
									onSelect={(value) => setForm({...form, routePageTruck: value})}
									placeholder="Izvēlieties"
									endpoint="/api/freight-tracking/trucks"
								/>
							</View>
						</View>

						{showRoutePageError && (
							<View id="top" style={[styles.topContainer, showRoutePageError && styles.errorBorder]}>
								<Text id="ss" style={styles.explanatoryText}>
									Konstatēts, ka nav izveidota maršruta lapa izvēlētā datuma periodam - pievienojiet informāciju tās izveidošanai!
								</Text>

								<View style={commonStyles.row}>
									<FormDatePicker
										label="Sākuma datums"
										value={form.dateFrom}
										onChange={(date) => setForm({...form, dateFrom: date})}
										error="Lauks ir obligāts"
										showError={showRoutePageError && !form.dateFrom}
									/>
									<FormDatePicker
										label="Beigu datums"
										value={form.dateTo}
										onChange={(date) => setForm({...form, dateTo: date})}
										error="Lauks ir obligāts"
										showError={showRoutePageError && !form.dateTo}
									/>
								</View>

								<FormInput
									label="Degvielas atlikums sākumā"
									value={form.fuelBalanceAtStart}
									onChangeText={(text) => {
										// Allow only numbers
										if (/^\d*$/.test(text)) {
											setForm({...form, fuelBalanceAtStart: text})
										}
									}}
									placeholder="Ievadiet degvielas daudzumu"
									keyboardType="numeric"
									error={showRoutePageError && !form.fuelBalanceAtStart ? 'Lauks ir obligāts' : undefined}
								/>
							</View>
						)}
					</View>

					<FormInput
						label="Odometrs izbraucot"
						value={form.odometerAtStart}
						onChangeText={(text) => {
							// Allow only numbers
							if (/^\d*$/.test(text)) {
								setForm({...form, odometerAtStart: text})
							}
						}}
						placeholder="Ievadiet rādījumu"
						keyboardType="numeric"
					/>

					<FormDropdown
						label="Sākuma punkts"
						value={form.outTruckObject}
						onSelect={(value) => setForm({...form, outTruckObject: value})}
						placeholder="Izvēlieties sākuma punktu"
						endpoint="api/freight-tracking/objects"
					/>

					<FormDropdown
						label="Galamērķis"
						value={form.inTruckObject}
						onSelect={(value) => setForm({...form, inTruckObject: value})}
						placeholder="Ievadiet galamērķi"
						endpoint="api/freight-tracking/objects"
						filterValue={form.outTruckObject}
					/>

					<View style={commonStyles.spaceBetween}>
						<Text style={commonStyles.text}>Ar kravu</Text>
						<Switch
							value={hasCargo}
							onValueChange={setHasCargo}
							trackColor={{false: COLORS.black100, true: COLORS.secondary}}
							thumbColor={COLORS.white}
						/>
					</View>

					{hasCargo && (
						<>
							<FormDropdown
								label="Kravas tips"
								value={form.cargoType}
								onSelect={(value) => setForm({...form, cargoType: value})}
								placeholder=" Izvēlieties"
								endpoint="api/freight-tracking/cargo-types"
							/>

							<FormInput
								label="Kravas apjoms"
								value={form.cargoVolume}
								onChangeText={(text) => setForm({...form, cargoVolume: text})}
								placeholder="Ievadiet kravas apjomu"
								keyboardType="numeric"
							/>

							<FormDropdown
								label="Mērvienība"
								value={form.unitType}
								onSelect={(value) => setForm({...form, unitType: value})}
								placeholder="Izvēlieties mērvienību"
								endpoint="/api/freight-tracking/unit-types"
							/>
						</>
					)}

					<View style={[commonStyles.row, styles.buttonContainer]}>
						<Button
							title="Atpakaļ"
							onPress={() => router.push('/(tabs)')}
							style={[styles.backButton, isSubmitting && commonStyles.buttonDisabled]}
						/>
						<Button
							title="Saglabāt"
							onPress={handleSubmit}
							style={[styles.submitButton, isSubmitting && commonStyles.buttonDisabled]}
							disabled={isSubmitting}
						/>
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	webContainer: Platform.OS === 'web' ? {
		width: '100%',
		maxWidth: CONTAINER_WIDTH.web,
		alignSelf: 'center',
	} : {},
	topContainer: {
		marginBottom: 16,
	},
	truckField: {
		flex: 1,
		marginTop: -4,
	},
	explanatoryText: {
		...commonStyles.text,
		backgroundColor: COLORS.black100,
		padding: 16,
		borderRadius: 8,
		marginBottom: 16,
		textAlign: 'center',
	},
	buttonContainer: {
		justifyContent: 'space-between',
		gap: 16,
		marginTop: 24,
	},
	backButton: {
		flex: 1,
		backgroundColor: COLORS.black100,
	},
	submitButton: {
		flex: 1,
	},
	errorBorder: {
		padding: 16,
		borderWidth: 2,
		borderColor: 'rgb(255, 156, 1)',
		borderRadius: 8,
	}
})
