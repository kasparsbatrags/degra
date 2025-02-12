import {commonStyles, formStyles} from '@/constants/styles'
import {COLORS, CONTAINER_WIDTH, FONT} from '@/constants/theme'
import {router} from 'expo-router'
import React, {useState} from 'react'
import {Modal, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import Button from '../../components/Button'
import FormDropdown from '../../components/FormDropdown'
import FormInput from '../../components/FormInput'
import freightAxios from '../../config/freightAxios'

export default function TruckRouteScreen() {
	const [hasCargo, setHasCargo] = useState(false)
	const [showDatePicker, setShowDatePicker] = useState(false)
	const [showDateFromPicker, setShowDateFromPicker] = useState(false)
	const [showDateToPicker, setShowDateToPicker] = useState(false)
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
					id: parseInt(form.routePageTruck),
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

	return (<SafeAreaView style={commonStyles.safeArea}>
		<ScrollView>
			<View style={[commonStyles.content, styles.webContainer]}>
				<View id="top" style={[styles.topContainer]}>
					<View style={commonStyles.row}>
						<View style={[formStyles.inputContainer, styles.dateField]}>
							<Text style={formStyles.label}>Brauciena datums</Text>
							<TouchableOpacity
									style={styles.dateButton}
									onPress={() => setShowDatePicker(true)}
							>
								<Text style={styles.dateText}>
									{`${form.routeDate.getDate().toString().padStart(2, '0')}.${(form.routeDate.getMonth() + 1).toString().padStart(2, '0')}.${form.routeDate.getFullYear()}`}
								</Text>
							</TouchableOpacity>
						</View>
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

					<View id="top" style={[styles.topContainer, showRoutePageError && styles.errorBorder]}>
						<Text id="ss" style={styles.explanatoryText}>
							Konstatēts, ka nav izveidota maršruta lapa izvēlētā datuma periodam - pievienojiet informāciju tās izveidošanai!
						</Text>
						<View style={commonStyles.row}>
							<View style={[formStyles.inputContainer, styles.dateField]}>
								<Text style={formStyles.label}>Sākuma datums</Text>
								<TouchableOpacity
										style={styles.dateButton}
										onPress={() => setShowDateFromPicker(true)}
								>
									<Text style={styles.dateText}>
										{`${form.dateFrom.getDate().toString().padStart(2, '0')}.${(form.dateFrom.getMonth() + 1).toString().padStart(2, '0')}.${form.dateFrom.getFullYear()}`}
									</Text>
								</TouchableOpacity>
							</View>
							<View style={[formStyles.inputContainer, styles.dateField]}>
								<Text style={formStyles.label}>Beigu datums</Text>
								<TouchableOpacity
										style={styles.dateButton}
										onPress={() => setShowDateToPicker(true)}
								>
									<Text style={styles.dateText}>
										{`${form.dateTo.getDate().toString().padStart(2, '0')}.${(form.dateTo.getMonth() + 1).toString().padStart(2, '0')}.${form.dateTo.getFullYear()}`}
									</Text>
								</TouchableOpacity>
							</View>
						</View>
						<FormInput
								label="Degvielas atlikums ākumā"
								value={form.fuelBalanceAtStart}
								onChangeText={(text) => {
									// Allow only numbers
									if (/^\d*$/.test(text)) {
										setForm({...form, fuelBalanceAtStart: text})
									}
								}}
								placeholder="Ievadiet degvielas daudzumu"
								keyboardType="numeric"
						/>

						{showDatePicker && (<Modal
								transparent={true}
								visible={showDatePicker}
								animationType="fade"
								onRequestClose={() => setShowDatePicker(false)}
						>
							<Pressable
									style={styles.modalOverlay}
									onPress={() => setShowDatePicker(false)}
							>
								<Pressable
										style={styles.modalContent}
										onPress={(e) => e.stopPropagation()}
								>
									<View style={styles.calendarHeader}>
										<TouchableOpacity
												style={styles.monthButton}
												onPress={() => {
													const newDate = new Date(form.routeDate)
													newDate.setMonth(newDate.getMonth() - 1)
													setForm({...form, routeDate: newDate})
												}}
										>
											<Text style={styles.monthButtonText}>←</Text>
										</TouchableOpacity>
										<Text style={styles.monthYearText}>
											{form.routeDate.toLocaleDateString('lv-LV', {
												month: 'long', year: 'numeric'
											})}
										</Text>
										<TouchableOpacity
												style={styles.monthButton}
												onPress={() => {
													const newDate = new Date(form.routeDate)
													newDate.setMonth(newDate.getMonth() + 1)
													setForm({...form, routeDate: newDate})
												}}
										>
											<Text style={styles.monthButtonText}>→</Text>
										</TouchableOpacity>
									</View>
									<View style={styles.weekDaysRow}>
										{Array.from({length: 7}).map((_, i) => (<Text key={i} style={styles.weekDayText}>
											{new Date(2024, 0, i + 1).toLocaleDateString('lv-LV', {weekday: 'short'})}
										</Text>))}
									</View>
									<View style={styles.daysGrid}>
										{(() => {
											const year = form.routeDate.getFullYear()
											const month = form.routeDate.getMonth()
											const firstDay = new Date(year, month, 1)
											const lastDay = new Date(year, month + 1, 0)
											const startingDay = firstDay.getDay()
											const totalDays = lastDay.getDate()

											const days = []
											// Add empty spaces for days before the first day of the month
											for (let i = 0; i < startingDay; i++) {
												days.push(<View key={`empty-${i}`} style={styles.dayButton} />)
											}

											// Add the days of the month
											for (let i = 1; i <= totalDays; i++) {
												const date = new Date(year, month, i)
												const isSelected = date.toDateString() === form.routeDate.toDateString()
												const isToday = date.toDateString() === new Date().toDateString()

												days.push(<Pressable
														key={i}
														style={[styles.dayButton, isSelected && styles.selectedDay, isToday && styles.todayDay]}
														onPress={() => {
															setForm({...form, routeDate: date})
															setShowDatePicker(false)
														}}
												>
													<Text style={[styles.dayText, isSelected && styles.selectedDayText, isToday && styles.todayDayText]}>
														{i}
													</Text>
												</Pressable>)
											}

											return days
										})()}
									</View>
								</Pressable>
							</Pressable>
						</Modal>)}
						{showDateFromPicker && (<Modal
										transparent={true}
										visible={showDateFromPicker}
										animationType="fade"
										onRequestClose={() => setShowDateFromPicker(false)}
								>
									<Pressable
											style={styles.modalOverlay}
											onPress={() => setShowDateFromPicker(false)}
									>
										<Pressable
												style={styles.modalContent}
												onPress={(e) => e.stopPropagation()}
										>
											<View style={styles.calendarHeader}>
												<TouchableOpacity
														style={styles.monthButton}
														onPress={() => {
															const newDate = new Date(form.dateFrom)
															newDate.setMonth(newDate.getMonth() - 1)
															setForm({...form, dateFrom: newDate})
														}}
												>
													<Text style={styles.monthButtonText}>←</Text>
												</TouchableOpacity>
												<Text style={styles.monthYearText}>
													{form.dateFrom.toLocaleDateString('lv-LV', {
														month: 'long', year: 'numeric'
													})}
												</Text>
												<TouchableOpacity
														style={styles.monthButton}
														onPress={() => {
															const newDate = new Date(form.dateFrom)
															newDate.setMonth(newDate.getMonth() + 1)
															setForm({...form, dateFrom: newDate})
														}}
												>
													<Text style={styles.monthButtonText}>→</Text>
												</TouchableOpacity>
											</View>
											<View style={styles.weekDaysRow}>
												{Array.from({length: 7}).map((_, i) => (<Text key={i} style={styles.weekDayText}>
													{new Date(2024, 0, i + 1).toLocaleDateString('lv-LV', {weekday: 'short'})}
												</Text>))}
											</View>
											<View style={styles.daysGrid}>
												{(() => {
													const year = form.dateFrom.getFullYear()
													const month = form.dateFrom.getMonth()
													const firstDay = new Date(year, month, 1)
													const lastDay = new Date(year, month + 1, 0)
													const startingDay = firstDay.getDay()
													const totalDays = lastDay.getDate()

													const days = []
													// Add empty spaces for days before the first day of the month
													for (let i = 0; i < startingDay; i++) {
														days.push(<View key={`empty-${i}`} style={styles.dayButton} />)
													}

													// Add the days of the month
													for (let i = 1; i <= totalDays; i++) {
														const date = new Date(year, month, i)
														const isSelected = date.toDateString() === form.dateFrom.toDateString()
														const isToday = date.toDateString() === new Date().toDateString()

														days.push(<Pressable
																key={i}
																style={[styles.dayButton, isSelected && styles.selectedDay, isToday && styles.todayDay]}
																onPress={() => {
																	setForm({...form, dateFrom: date})
																	setShowDateFromPicker(false)
																}}
														>
															<Text style={[styles.dayText, isSelected && styles.selectedDayText, isToday && styles.todayDayText]}>
																{i}
															</Text>
														</Pressable>)
													}

													return days
												})()}
											</View>
										</Pressable>
									</Pressable>
								</Modal>)}
						{showDateToPicker && (<Modal
										transparent={true}
										visible={showDateToPicker}
										animationType="fade"
										onRequestClose={() => setShowDateToPicker(false)}
								>
									<Pressable
											style={styles.modalOverlay}
											onPress={() => setShowDateToPicker(false)}
									>
										<Pressable
												style={styles.modalContent}
												onPress={(e) => e.stopPropagation()}
										>
											<View style={styles.calendarHeader}>
												<TouchableOpacity
														style={styles.monthButton}
														onPress={() => {
															const newDate = new Date(form.dateTo)
															newDate.setMonth(newDate.getMonth() - 1)
															setForm({...form, dateTo: newDate})
														}}
												>
													<Text style={styles.monthButtonText}>←</Text>
												</TouchableOpacity>
												<Text style={styles.monthYearText}>
													{form.dateTo.toLocaleDateString('lv-LV', {
														month: 'long', year: 'numeric'
													})}
												</Text>
												<TouchableOpacity
														style={styles.monthButton}
														onPress={() => {
															const newDate = new Date(form.dateTo)
															newDate.setMonth(newDate.getMonth() + 1)
															setForm({...form, dateTo: newDate})
														}}
												>
													<Text style={styles.monthButtonText}>→</Text>
												</TouchableOpacity>
											</View>
											<View style={styles.weekDaysRow}>
												{Array.from({length: 7}).map((_, i) => (<Text key={i} style={styles.weekDayText}>
													{new Date(2024, 0, i + 1).toLocaleDateString('lv-LV', {weekday: 'short'})}
												</Text>))}
											</View>
											<View style={styles.daysGrid}>
												{(() => {
													const year = form.dateTo.getFullYear()
													const month = form.dateTo.getMonth()
													const firstDay = new Date(year, month, 1)
													const lastDay = new Date(year, month + 1, 0)
													const startingDay = firstDay.getDay()
													const totalDays = lastDay.getDate()

													const days = []
													// Add empty spaces for days before the first day of the month
													for (let i = 0; i < startingDay; i++) {
														days.push(<View key={`empty-${i}`} style={styles.dayButton} />)
													}

													// Add the days of the month
													for (let i = 1; i <= totalDays; i++) {
														const date = new Date(year, month, i)
														const isSelected = date.toDateString() === form.dateTo.toDateString()
														const isToday = date.toDateString() === new Date().toDateString()

														days.push(<Pressable
																key={i}
																style={[styles.dayButton, isSelected && styles.selectedDay, isToday && styles.todayDay]}
																onPress={() => {
																	setForm({...form, dateTo: date})
																	setShowDateToPicker(false)
																}}
														>
															<Text style={[styles.dayText, isSelected && styles.selectedDayText, isToday && styles.todayDayText]}>
																{i}
															</Text>
														</Pressable>)
													}

													return days
												})()}
											</View>
										</Pressable>
									</Pressable>
								</Modal>)}
					</View>
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

				{hasCargo && (<>
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
				</>)}

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
	</SafeAreaView>)
}

const styles = StyleSheet.create({
	webContainer: Platform.OS === 'web' ? {
		width: '100%', maxWidth: CONTAINER_WIDTH.web, alignSelf: 'center',
	} : {}, topContainer: {
		marginBottom: 16,
	}, dateField: {
		flex: 1, height: 80,
	}, truckField: {
		flex: 1, marginTop: -4,
	}, dateButton: {
		...commonStyles.input, justifyContent: 'center', backgroundColor: COLORS.black100, padding: 14, borderRadius: 8, height: 48,
	}, dateText: {
		...commonStyles.text,
	}, explanatoryText: {
		...commonStyles.text, backgroundColor: COLORS.black100, padding: 16, borderRadius: 8, marginBottom: 16, textAlign: 'center',
	}, modalOverlay: {
		flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center',
	}, modalContent: {
		backgroundColor: COLORS.black100, padding: 16, borderRadius: 12, width: '90%', maxWidth: 400,
	}, calendarHeader: {
		...commonStyles.spaceBetween, marginBottom: 16,
	}, monthButton: {
		padding: 8,
	}, monthButtonText: {
		...commonStyles.text, fontSize: 24,
	}, monthYearText: {
		...commonStyles.text, textTransform: 'capitalize',
	}, weekDaysRow: {
		...commonStyles.row, justifyContent: 'space-between', marginBottom: 8,
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
		...commonStyles.text, fontSize: 14,
	}, selectedDay: {
		backgroundColor: COLORS.secondary,
	}, todayDay: {
		borderWidth: 1, borderColor: COLORS.secondary,
	}, selectedDayText: {
		...commonStyles.text, fontFamily: FONT.bold,
	}, todayDayText: {
		color: COLORS.secondary, fontFamily: FONT.medium,
	}, buttonContainer: {
		justifyContent: 'space-between', gap: 16, marginTop: 24,
	}, backButton: {
		flex: 1, backgroundColor: COLORS.black100,
	}, submitButton: {
		flex: 1,
	}, errorBorder: {
		padding: 16, borderWidth: 2, borderColor: 'rgb(255, 156, 1)', borderRadius: 8,
	},
})
