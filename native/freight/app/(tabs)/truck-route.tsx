import {commonStyles, formStyles} from '@/constants/styles'
import {COLORS, CONTAINER_WIDTH} from '@/constants/theme'
import {useAuth} from '@/context/AuthContext'
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
	const {user} = useAuth()
	const [hasCargo, setHasCargo] = useState(false)
	const [showRoutePageError, setShowRoutePageError] = useState(false)
	const [isItRouteFinish, setIsRouteFinish] = useState(false)
	const [existingRoutePage, setExistingRoutePage] = useState<any>(null)
	const [form, setForm] = useState({
		id: '',
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
					if (response.data) {
						setExistingRoutePage(response.data)
						setShowRoutePageError(false)
					} else {
						setExistingRoutePage(null)
						setShowRoutePageError(true)
					}
				} catch (error) {
					console.error('Failed to check route page:', error)
				}
			}, 300) // 300ms debounce
		}
	})(), [])

	// Initialize form and check last route status
	React.useEffect(() => {
		const initializeForm = async () => {
			try {
				// Get last route and populate form
				try {
					const lastRouteResponse = await freightAxios.get('/api/freight-tracking/truck-routes/last')
					const lastRoute = lastRouteResponse.data
					setIsRouteFinish(true)

					// Set hasCargo based on whether cargoVolume exists
					setHasCargo(!!lastRoute.cargoVolume)

					// Convert dates from string to Date objects
					const routeDate = lastRoute.routeDate ? new Date(lastRoute.routeDate) : new Date()
					// const dateFrom = lastRoute.truckRoutePage?.dateFrom ? new Date(lastRoute.truckRoutePage.dateFrom) : new Date()
					// const dateTo = lastRoute.truckRoutePage?.dateTo ? new Date(lastRoute.truckRoutePage.dateTo) : new Date()
					const outDateTime = lastRoute.outDateTime ? new Date(lastRoute.outDateTime) : new Date()

					setForm({
						id: lastRoute.id?.toString() || '',
						routeDate,
						outDateTime,
						dateFrom: lastRoute.truckRoutePage?.dateFrom ? new Date(lastRoute.truckRoutePage.dateFrom) : new Date(),
						dateTo: lastRoute.truckRoutePage?.dateTo ? new Date(lastRoute.truckRoutePage.dateTo) : new Date(),
						routePageTruck: lastRoute.truckRoutePage?.truck?.id?.toString() || '',
						odometerAtStart: lastRoute.odometerAtStart?.toString() || '',
						odometerAtFinish: lastRoute.odometerAtFinish?.toString() || '',
						outTruckObject: lastRoute.outTruckObject?.id?.toString() || '',
						inTruckObject: lastRoute.inTruckObject?.id?.toString() || '',
						cargoType: '',  // Not provided in the response
						cargoVolume: lastRoute.cargoVolume?.toString() || '',
						unitType: lastRoute.unitType || '',
						fuelBalanceAtStart: lastRoute.fuelBalanceAtStart?.toString() || '',
						fuelReceived: lastRoute.fuelReceived?.toString() || '',
						notes: '',  // Not provided in the response
					})
				} catch (error: any) {
					setIsRouteFinish(false)
					// If no last route exists, get default truck
					try {
						const response = await freightAxios.get('/api/freight-tracking/trucks')
						if (response.data && response.data.length > 0) {
							const defaultTruck = response.data[0].id.toString()
							const currentDate = new Date()
							setForm(prev => ({
								...prev, routeDate: currentDate, routePageTruck: defaultTruck
							}))
						}
					} catch (truckError) {
						console.error('Failed to fetch default truck:', truckError)
					}
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
				id: form.id ? form.id : null,
				routeDate: form.routeDate.toISOString().split('T')[0], // Format date as YYYY-MM-DD
				truckRoutePage: form.routePageTruck ?
					(existingRoutePage ? existingRoutePage : {
						dateFrom: (form.dateFrom instanceof Date ? form.dateFrom : new Date(form.dateFrom)).toISOString().split('T')[0],
						dateTo: (form.dateTo instanceof Date ? form.dateTo : new Date(form.dateTo)).toISOString().split('T')[0],
						truck: existingRoutePage?.truck && existingRoutePage.truck.id
								? existingRoutePage.truck
								: { id: existingRoutePage?.truck?.id ? parseInt(existingRoutePage.truck.id) : form.routePageTruck },
						user: existingRoutePage?.user || {
							id: parseInt(existingRoutePage?.user.id),
						},
						fuelBalanceAtStart: form.fuelBalanceAtStart ? parseFloat(form.fuelBalanceAtStart) : null,
					}
				) : null,
				outTruckObject: form.outTruckObject ? {id: parseInt(form.outTruckObject)} : null,
				inTruckObject: form.inTruckObject ? {id: parseInt(form.inTruckObject)} : null,
				odometerAtStart: form.odometerAtStart ? parseInt(form.odometerAtStart) : null,
				odometerAtFinish: form.odometerAtFinish ? parseInt(form.odometerAtFinish) : null,
				cargoVolume: hasCargo && form.cargoVolume ? parseFloat(form.cargoVolume) : null,
				unitType: hasCargo ? form.unitType : null,
				fuelBalanceAtStart: form.fuelBalanceAtStart ? parseFloat(form.fuelBalanceAtStart) : existingRoutePage ? existingRoutePage.fuelBalanceAtStart : null,
				fuelReceived: form.fuelReceived ? parseFloat(form.fuelReceived) : null,
				outDateTime: now,
				inDateTime: form.inTruckObject && isItRouteFinish ? now : null // If destination is set, also set inDateTime
			}

			if (isItRouteFinish) {
				// For finished routes, use PUT to update
				await freightAxios.put('/api/freight-tracking/truck-routes', payload)
			} else {
				// For new routes, use POST to create
				await freightAxios.post('/api/freight-tracking/truck-routes', payload)
			}
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
								disabled={isItRouteFinish}
							/>
							<View style={[formStyles.inputContainer, styles.truckField]}>
								<FormDropdown
									label="Auto"
									value={form.routePageTruck}
									onSelect={(value) => setForm({...form, routePageTruck: value})}
									placeholder="Izvēlieties"
									endpoint="/api/freight-tracking/trucks"
									disabled={isItRouteFinish}
										error={!form.routePageTruck ? 'Ievadiet datus!' : undefined}
								/>
							</View>
						</View>

						{showRoutePageError && (
							<View style={[styles.topContainer, showRoutePageError && styles.errorBorder]}>
								<Text style={styles.explanatoryText}>
									Konstatēts, ka nav izveidota maršruta lapa izvēlētā datuma periodam - pievienojiet informāciju
									tās izveidošanai!
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
									error={showRoutePageError && !form.fuelBalanceAtStart ? 'Ievadiet datus!' : undefined}
								/>

								<FormInput
										label="Odometrs izbraucot"
										value={form.odometerAtStart}
										onChangeText={(text) => {
											// Allow only numbers
											if (/^\d*$/.test(text) && text !== "0") {
												setForm({ ...form, odometerAtStart: text });
											}
										}}
										placeholder="Ievadiet rādījumu"
										keyboardType="numeric"
										disabled={isItRouteFinish}
										error={showRoutePageError && !form.odometerAtStart ? 'Ievadiet datus!' : undefined}
								/>
							</View>
						)}
					</View>

					<FormInput
						label="Odometrs startā"
						value={form.odometerAtStart}
						onChangeText={(text) => {
							// Allow only numbers
							if (/^\d*$/.test(text)) {
								setForm({...form, odometerAtStart: text})
							}
						}}
						placeholder="Ievadiet rādījumu"
						keyboardType="numeric"
						disabled={isItRouteFinish}
						visible={!showRoutePageError}
						error={!showRoutePageError && !form.odometerAtStart ? 'Ievadiet datus!' : undefined}

					/>

					<FormDropdown
						label="Sākuma punkts"
						value={form.outTruckObject}
						onSelect={(value) => setForm({...form, outTruckObject: value})}
						placeholder="Izvēlieties sākuma punktu"
						endpoint="api/freight-tracking/objects"
						disabled={isItRouteFinish}
						error={!showRoutePageError && !form.outTruckObject ? 'Ievadiet datus!' : undefined}
					/>

					<FormDropdown
						label="Galamērķis"
						value={form.inTruckObject}
						onSelect={(value) => setForm({...form, inTruckObject: value})}
						placeholder="Ievadiet galamērķi"
						endpoint="api/freight-tracking/objects"
						filterValue={form.outTruckObject}
						error={isItRouteFinish && !form.inTruckObject ? 'Ievadiet datus!' : undefined}
					/>

					<FormInput
							label="Odometrs finišā"
							value={form.odometerAtFinish}
							onChangeText={(text) => {
								// Atļauj tikai ciparus
								if (/^\d*$/.test(text)) {
									setForm({...form, odometerAtFinish: text})
								}
							}}
							placeholder="Ievadiet rādījumu"
							keyboardType="numeric"
							visible={isItRouteFinish}
							error={!showRoutePageError
									&& (!form.odometerAtFinish
									|| (parseInt(form.odometerAtFinish, 10) <= parseInt(form.odometerAtStart, 10))) ? 'Ievadiet datus!' : undefined}

					/>


					<View style={commonStyles.spaceBetween}>
						<Text style={commonStyles.text}>Ar kravu</Text>
						<Switch
							value={hasCargo}
							onValueChange={setHasCargo}
							trackColor={{false: COLORS.black100, true: COLORS.secondary}}
							thumbColor={COLORS.white}
							disabled={isItRouteFinish}
						/>
					</View>

					<FormInput
						label="Saņemtā degviela"
						value={form.fuelReceived}
						onChangeText={(text) => {
							// Allow only numbers
							if (/^\d*$/.test(text)) {
								setForm({...form, fuelReceived: text})
							}
						}}
						placeholder="Ievadiet daudzumu"
						keyboardType="numeric"
					/>

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
