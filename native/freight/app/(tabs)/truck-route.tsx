import {router} from 'expo-router'
import React, {useState} from 'react'
import {Modal, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import Button from '../../components/Button'
import FormDropdown from '../../components/FormDropdown'
import FormInput from '../../components/FormInput'
import freightAxios from '../../config/freightAxios'
import {COLORS, CONTAINER_WIDTH, FONT} from '../../constants/theme'

export default function TruckRouteScreen() {
	const [hasCargo, setHasCargo] = useState(false)
	const [showDatePicker, setShowDatePicker] = useState(false)
	const [form, setForm] = useState({
		routeDate: new Date(),
		outDateTime: new Date(),
		truck: '',
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

	const handleSubmit = async () => {
		try {
			setIsSubmitting(true)
			
			// Convert form data to match TruckRouteDto structure
			const now = new Date().toISOString(); // Current time in ISO format for Instant
			const payload = {
				routeDate: form.routeDate.toISOString().split('T')[0], // Format date as YYYY-MM-DD
				truck: form.truck ? { id: parseInt(form.truck) } : null,
				outTruckObject: form.outTruckObject ? { id: parseInt(form.outTruckObject) } : null,
				inTruckObject: form.inTruckObject ? { id: parseInt(form.inTruckObject) } : null,
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

	return (<SafeAreaView style={styles.container}>
				<ScrollView>
					<View style={styles.content}>
						<Text style={styles.explanatoryText}>
							Konstatēts, ka nav izveidota maršruta lapa izvēlētam datumam - norādiet informāciju tās izveidošanai!
						</Text>
						
						<View style={styles.dateContainer}>
							<Text style={styles.label}>Datums</Text>
							<TouchableOpacity 
								style={styles.dateButton}
								onPress={() => setShowDatePicker(true)}
							>
								<Text style={styles.dateText}>
									{`${form.routeDate.getDate().toString().padStart(2, '0')}.${(form.routeDate.getMonth() + 1).toString().padStart(2, '0')}.${form.routeDate.getFullYear()}`}
								</Text>
							</TouchableOpacity>
						</View>

						{showDatePicker && (
							<Modal
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
													const newDate = new Date(form.routeDate);
													newDate.setMonth(newDate.getMonth() - 1);
													setForm({...form, routeDate: newDate});
												}}
											>
												<Text style={styles.monthButtonText}>←</Text>
											</TouchableOpacity>
											<Text style={styles.monthYearText}>
												{form.routeDate.toLocaleDateString('lv-LV', {
													month: 'long',
													year: 'numeric'
												})}
											</Text>
											<TouchableOpacity
												style={styles.monthButton}
												onPress={() => {
													const newDate = new Date(form.routeDate);
													newDate.setMonth(newDate.getMonth() + 1);
													setForm({...form, routeDate: newDate});
												}}
											>
												<Text style={styles.monthButtonText}>→</Text>
											</TouchableOpacity>
										</View>
										<View style={styles.weekDaysRow}>
											{Array.from({length: 7}).map((_, i) => (
												<Text key={i} style={styles.weekDayText}>
													{new Date(2024, 0, i + 1).toLocaleDateString('lv-LV', {weekday: 'short'})}
												</Text>
											))}
										</View>
										<View style={styles.daysGrid}>
											{(() => {
												const year = form.routeDate.getFullYear();
												const month = form.routeDate.getMonth();
												const firstDay = new Date(year, month, 1);
												const lastDay = new Date(year, month + 1, 0);
												const startingDay = firstDay.getDay();
												const totalDays = lastDay.getDate();
												
												const days = [];
												// Add empty spaces for days before the first day of the month
												for (let i = 0; i < startingDay; i++) {
													days.push(<View key={`empty-${i}`} style={styles.dayButton} />);
												}
												
												// Add the days of the month
												for (let i = 1; i <= totalDays; i++) {
													const date = new Date(year, month, i);
													const isSelected = date.toDateString() === form.routeDate.toDateString();
													const isToday = date.toDateString() === new Date().toDateString();
													
													days.push(
														<Pressable
															key={i}
															style={[
																styles.dayButton,
																isSelected && styles.selectedDay,
																isToday && styles.todayDay
															]}
															onPress={() => {
																setForm({...form, routeDate: date});
																setShowDatePicker(false);
															}}
														>
															<Text style={[
																styles.dayText,
																isSelected && styles.selectedDayText,
																isToday && styles.todayDayText
															]}>
																{i}
															</Text>
														</Pressable>
													);
												}
												
												return days;
											})()}
										</View>
									</Pressable>
								</Pressable>
							</Modal>
						)}
						<View style={styles.rowContainer}>
							<View style={styles.truckField}>
								<FormDropdown
										label="Auto"
										value={form.truck}
										onSelect={(value) => setForm({...form, truck: value})}
										placeholder="Izvēlieties"
										endpoint="/api/freight-tracking/trucks"
								/>
							</View>
							<View style={styles.odometerField}>
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
							</View>
						</View>
						<FormDropdown
								label="Sākuma punkts"
								value={form.outTruckObject}
								onSelect={(value) => setForm({...form,outTruckObject: value})}
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


						<View style={styles.switchContainer}>
							<Text style={styles.switchLabel}>Ar kravu</Text>
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

						{/*<FormInput*/}
						{/*		label="Odometrs atgriežoties"*/}
						{/*		value={form.odometerAtFinish}*/}
						{/*		onChangeText={(text) => {*/}
						{/*			// Allow only numbers*/}
						{/*			if (/^\d*$/.test(text)) {*/}
						{/*				setForm({...form, odometerAtFinish: text})*/}
						{/*			}*/}
						{/*		}}*/}
						{/*		placeholder="Ievadiet odometra rādījumu"*/}
						{/*		keyboardType="numeric"*/}
						{/*/>*/}

						{/*<FormInput*/}
						{/*		label="Degvielas atlikums"*/}
						{/*		value={form.fuelBalanceAtStart}*/}
						{/*		onChangeText={(text) => setForm({...form, fuelBalanceAtStart: text})}*/}
						{/*		placeholder="Ievadiet degvielas atlikumu"*/}
						{/*		keyboardType="numeric"*/}
						{/*/>*/}

						{/*<FormInput*/}
						{/*		label="Saņemtā degviela"*/}
						{/*		value={form.fuelReceived}*/}
						{/*		onChangeText={(text) => setForm({...form, fuelReceived: text})}*/}
						{/*		placeholder="Ievadiet saņemto degvielu"*/}
						{/*		keyboardType="numeric"*/}
						{/*/>*/}

						<View style={styles.buttonContainer}>
							<Button
									title="Atpakaļ"
									onPress={() => router.push('/(tabs)')}
									style={styles.backButton}
							/>
							<Button
									title="Saglabāt"
									onPress={handleSubmit}
									style={styles.submitButton}
									disabled={isSubmitting}
							/>
						</View>
					</View>
				</ScrollView>
			</SafeAreaView>)
}

const styles = StyleSheet.create({
	container: {
		flex: 1, backgroundColor: COLORS.primary,
	}, content: Platform.OS === 'web' ? {
		flex: 1, paddingHorizontal: 16, marginVertical: 24, width: '100%', maxWidth: CONTAINER_WIDTH.web, alignSelf: 'center',
	} : {
		flex: 1, paddingHorizontal: 16, marginVertical: 24, width: CONTAINER_WIDTH.mobile,
	}, switchContainer: {
		flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, marginBottom: 16,
	}, switchLabel: {
		fontSize: 16, fontFamily: FONT.medium, color: COLORS.white,
	},
	dateContainer: {
		marginBottom: 16,
	},
	label: {
		fontSize: 16,
		fontFamily: FONT.medium,
		color: COLORS.white,
		marginBottom: 8,
	},
	dateButton: {
		backgroundColor: COLORS.black100,
		padding: 12,
		borderRadius: 8,
	},
	dateText: {
		color: COLORS.white,
		fontSize: 16,
		fontFamily: FONT.regular,
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	modalContent: {
		backgroundColor: COLORS.black100,
		padding: 16,
		borderRadius: 12,
		width: '90%',
		maxWidth: 400,
	},
	calendarHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 16,
	},
	dateInput: {
		backgroundColor: COLORS.white,
		padding: 12,
		borderRadius: 8,
		marginBottom: 16,
		width: '100%',
	},
	closeButton: {
		backgroundColor: COLORS.secondary,
		padding: 12,
		borderRadius: 8,
		alignItems: 'center',
	},
	closeButtonText: {
		color: COLORS.white,
		fontSize: 16,
		fontFamily: FONT.medium,
	},
	calendarContainer: {
		backgroundColor: COLORS.black100,
		borderRadius: 8,
		padding: 16,
	},
	daysGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
		paddingTop: 8,
	},
	weekDaysRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 8,
	},
	weekDayText: {
		width: '14.28%',
		textAlign: 'center',
		color: COLORS.white,
		marginBottom: 8,
		fontSize: 12,
		fontFamily: FONT.medium,
		textTransform: 'uppercase',
	},
	dayButton: {
		width: '14.28%',
		aspectRatio: 1,
		justifyContent: 'center',
		alignItems: 'center',
		marginVertical: 4,
		borderRadius: 8,
	},
	dayText: {
		color: COLORS.white,
		fontSize: 14,
		fontFamily: FONT.regular,
	},
	selectedDay: {
		backgroundColor: COLORS.secondary,
	},
	todayDay: {
		borderWidth: 1,
		borderColor: COLORS.secondary,
	},
	selectedDayText: {
		color: COLORS.white,
		fontFamily: FONT.bold,
	},
	todayDayText: {
		color: COLORS.secondary,
		fontFamily: FONT.medium,
	},
	monthButton: {
		padding: 8,
	},
	monthButtonText: {
		color: COLORS.white,
		fontSize: 24,
		fontFamily: FONT.medium,
	},
	monthYearText: {
		color: COLORS.white,
		fontSize: 16,
		fontFamily: FONT.medium,
		textTransform: 'capitalize',
	},
	buttonContainer: {
		flexDirection: 'row',
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
	rowContainer: {
		flexDirection: 'row',
		gap: 16,
		marginBottom: 16,
	},
	truckField: {
		flex: 1,
	},
	odometerField: {
		flex: 2,
	},
	explanatoryText: {
		fontSize: 16,
		fontFamily: FONT.medium,
		color: COLORS.white,
		backgroundColor: COLORS.black100,
		padding: 16,
		borderRadius: 8,
		marginBottom: 24,
		textAlign: 'center',
	},
})
