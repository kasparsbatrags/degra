import React, {useState} from 'react'
import {Modal, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import Button from '../../components/Button'
import FormDropdown from '../../components/FormDropdown'
import FormInput from '../../components/FormInput'
import {COLORS, CONTAINER_WIDTH, FONT} from '../../constants/theme'

export default function TruckRouteScreen() {
	const [hasCargo, setHasCargo] = useState(false)
	const [showDatePicker, setShowDatePicker] = useState(false)
	const [form, setForm] = useState({
		routeDate: new Date(),
		truck: '',
		origin: '',
		destination: '',
		cargoType: '',
		weight: '',
		notes: '',
	})

	const handleSubmit = () => {
		// TODO: Implement form submission
		console.log('Form submitted:', form)
	}

	return (<SafeAreaView style={styles.container}>
				<ScrollView>
					<View style={styles.content}>
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
						<FormDropdown
								label="Auto"
								value={form.truck}
								onSelect={(value) => setForm({...form, truck: value})}
								placeholder="Izvēlieties auto"
								endpoint="/api/freight-tracking/trucks"
						/>
						<FormDropdown
								label="Sākuma punkts"
								value={form.origin}
								onSelect={(value) => setForm({...form, origin: value})}
								placeholder="Izvēlieties sākuma punktu"
								endpoint="api/freight-tracking/objects"
						/>

						<FormDropdown
								label="Galamērķis"
								value={form.destination}
								onSelect={(value) => setForm({...form, destination: value})}
								placeholder="Ievadiet galamērķi"
								endpoint="api/freight-tracking/objects"
								filterValue={form.origin}
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
											value={form.weight}
											onChangeText={(text) => setForm({...form, weight: text})}
											placeholder="Izvēlieties..."
											keyboardType="numeric"
									/>
								</>)}

						<Button
								title="Saglabāt"
								onPress={handleSubmit}
								style={styles.submitButton}
						/>
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
	}, submitButton: {
		marginTop: 24,
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
})
