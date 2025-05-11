import {commonStyles} from '@/constants/styles'
import {COLORS, CONTAINER_WIDTH, SHADOWS} from '@/constants/theme'
import {useAuth} from '@/context/AuthContext'
import {format} from 'date-fns'
import {router, useLocalSearchParams} from 'expo-router'
import React, {useState, useEffect, useRef} from 'react'
import { useObjectStore } from '@/hooks/useObjectStore';
import {ActivityIndicator, Platform, ScrollView, StyleSheet, Switch, Text, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import BackButton from '../../components/BackButton'
import Button from '../../components/Button'
import FormDatePicker from '../../components/FormDatePicker'
import FormDropdown from '../../components/FormDropdown'
import FormDropdownWithAddButton from '../../components/FormDropdownWithAddButton'
import FormInput from '../../components/FormInput'
import freightAxios from '../../config/freightAxios'

interface TruckObject {
	id: number;
	name?: string;
}

interface User {
	id: string;
	preferred_username?: string;
	email?: string;
	given_name?: string;
	family_name?: string;
	attributes?: Record<string, string>;
}

interface Truck {
	id: number;
	truckMaker?: string;
	truckModel?: string;
	registrationNumber?: string;
	fuelConsumptionNorm?: number;
	isDefault?: boolean;
}

interface TruckRoutePage {
	id?: number;
	dateFrom: string;
	dateTo: string;
	truck: Truck;
	user: User;
	fuelBalanceAtStart: number | null;
	fuelBalanceAtFinish?: number;
	truckRegistrationNumber?: string;
	fuelConsumptionNorm?: number;
	totalFuelReceivedOnRoutes?: number;
	totalFuelConsumedOnRoutes?: number;
	fuelBalanceAtRoutesFinish?: number;
	odometerAtRouteStart?: number;
	odometerAtRouteFinish?: number;
	computedTotalRoutesLength?: number;
}

interface TruckRouteDto {
	id: number | null;
	routeDate: string;
	truckRoutePage: TruckRoutePage | null;
	outTruckObject: TruckObject | null;
	inTruckObject: TruckObject | null;
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

interface Page<T> {
	content: T[];
	totalPages: number;
	totalElements: number;
	size: number;
	number: number;
}

interface FormState {
	id: string;
	routeDate: Date;
	outDateTime: Date;
	dateFrom: Date;
	dateTo: Date;
	routePageTruck: string;
	odometerAtStart: string;
	odometerAtFinish: string;
	outTruckObject: string;
	inTruckObject: string;
	cargoType: string; // Stores the ID as string for form handling
	cargoVolume: string;
	unitType: string; // Stores the code as string for form handling
	fuelBalanceAtStart: string;
	fuelReceived: string;
	notes: string;
}

export default function TruckRouteScreen() {
	console.log("🚚 TruckRouteScreen mounted");

	const params = useLocalSearchParams<{
		id: string;
		outTruckObject?: string;
		inTruckObject?: string;
		outTruckObjectName?: string;
		inTruckObjectName?: string;
		newObject?: string;
	}>();
	const {id} = params;
	const [isLoading, setIsLoading] = useState(() => !params?.newObject && !!id)
	const {user} = useAuth()
	const [hasCargo, setHasCargo] = useState(false)
	const [showRoutePageError, setShowRoutePageError] = useState(false)
	const [isItRouteFinish, setIsRouteFinish] = useState(false)
	const [existingRoutePage, setExistingRoutePage] = useState<TruckRoutePage | null>(null)
	const [outTruckObjectDetails, setOutTruckObjectDetails] = useState<TruckObject | null>(null)
	const [inTruckObjectDetails, setInTruckObjectDetails] = useState<TruckObject | null>(null)
	const [refreshDropdowns, setRefreshDropdowns] = useState(0)
	const [objectsList, setObjectsList] = useState<{id: string, name: string}[]>([])
	// Create separate state variables for selected objects to bypass form state
	const [selectedOutTruckObject, setSelectedOutTruckObject] = useState<string>('');
	const [selectedInTruckObject, setSelectedInTruckObject] = useState<string>('');
	const [form, setForm] = useState<FormState>({
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

	const { newTruckObject, clearNewTruckObject, truckRouteForm, updateTruckRouteForm } = useObjectStore();

	// Inicializē formu no truckRouteForm, kad komponente tiek montēta
	useEffect(() => {
		// Ja ir saglabāti dati store, izmantojam tos
		if (truckRouteForm.outTruckObject && !selectedOutTruckObject) {
			console.log('Initializing outTruckObject from store:', truckRouteForm.outTruckObject);
			setSelectedOutTruckObject(truckRouteForm.outTruckObject);
			setForm(prev => ({
				...prev,
				outTruckObject: truckRouteForm.outTruckObject
			}));
			
			if (truckRouteForm.outTruckObjectName) {
				setOutTruckObjectDetails({ 
					id: parseInt(truckRouteForm.outTruckObject), 
					name: truckRouteForm.outTruckObjectName 
				});
			}
		}
		
		if (truckRouteForm.inTruckObject && !selectedInTruckObject) {
			console.log('Initializing inTruckObject from store:', truckRouteForm.inTruckObject);
			setSelectedInTruckObject(truckRouteForm.inTruckObject);
			setForm(prev => ({
				...prev,
				inTruckObject: truckRouteForm.inTruckObject
			}));
			
			if (truckRouteForm.inTruckObjectName) {
				setInTruckObjectDetails({ 
					id: parseInt(truckRouteForm.inTruckObject), 
					name: truckRouteForm.inTruckObjectName 
				});
			}
		}
	}, []);

	// Atjaunina store, kad mainās vērtības
	useEffect(() => {
		// Atjauninām store, kad mainās vērtības
		if (selectedOutTruckObject || selectedInTruckObject) {
			updateTruckRouteForm({
				outTruckObject: selectedOutTruckObject,
				outTruckObjectName: outTruckObjectDetails?.name || '',
				inTruckObject: selectedInTruckObject,
				inTruckObjectName: inTruckObjectDetails?.name || ''
			});
		}
	}, [selectedOutTruckObject, selectedInTruckObject, outTruckObjectDetails, inTruckObjectDetails, updateTruckRouteForm]);

	useEffect(() => {
		if (newTruckObject) {
			console.log('🧠 Rehydrating form from zustand:', newTruckObject);
			setRefreshDropdowns(prev => prev + 1);

			if (newTruckObject.type === 'inTruckObject') {
				setSelectedInTruckObject(newTruckObject.id);
				setForm(prev => ({ ...prev, inTruckObject: newTruckObject.id }));
				setInTruckObjectDetails({ id: parseInt(newTruckObject.id), name: newTruckObject.name });
				
				// Atjauninām arī store
				updateTruckRouteForm({
					inTruckObject: newTruckObject.id,
					inTruckObjectName: newTruckObject.name
				});
			} else if (newTruckObject.type === 'outTruckObject') {
				setSelectedOutTruckObject(newTruckObject.id);
				setForm(prev => ({ ...prev, outTruckObject: newTruckObject.id }));
				setOutTruckObjectDetails({ id: parseInt(newTruckObject.id), name: newTruckObject.name });
				
				// Atjauninām arī store
				updateTruckRouteForm({
					outTruckObject: newTruckObject.id,
					outTruckObjectName: newTruckObject.name
				});
			}
			clearNewTruckObject();
		}
	}, [newTruckObject, updateTruckRouteForm]);


	// Function to fetch objects list
	const fetchObjectsList = React.useCallback(async () => {
		try {
			console.log('Fetching objects list...');
			const response = await freightAxios.get('/objects');
			if (Array.isArray(response.data)) {
				const formattedOptions = response.data.map(item => ({
					id: String(item.id),
					name: String(item.name || item.title || item.label || item)
				}));
				setObjectsList(formattedOptions);
				console.log('Objects list fetched successfully:', formattedOptions);
			}
		} catch (error) {
			console.error('Failed to fetch objects list:', error);
		}
	}, []);

	// Fetch objects list when refreshDropdowns changes
	React.useEffect(() => {
		fetchObjectsList();
	}, [refreshDropdowns, fetchObjectsList]);

	const checkRoutePage = React.useCallback((() => {
		let timeoutId: NodeJS.Timeout
		return async (truckId: string, date: Date) => {
			if (!truckId || !date) return

			// Clear previous timeout
			if (timeoutId) clearTimeout(timeoutId)

			// Set new timeout
			timeoutId = setTimeout(async () => {
				try {
					const formattedDate = format(date, 'yyyy-MM-dd')
					const response = await freightAxios.get<TruckRoutePage>(`/route-pages/exists?truckId=${truckId}&routeDate=${formattedDate}`)
					if (response.data) {
						console.log('Route page exists:', response.data)
						setExistingRoutePage(response.data)
						setShowRoutePageError(false)
					}
				} catch (error: any) {
					if (error.response?.status === 404) {
						console.log('Route page does not exist')
						setExistingRoutePage(null)
						setShowRoutePageError(true)
					} else {
						console.error('Failed to check route page:', error)
					}
				}
			}, 300)
		}
	})(), [])

	useEffect(() => {
		if (params.newObject === 'true') {
			console.log('New object detected, refreshing dropdowns...');
			setRefreshDropdowns(prev => prev + 1);

			// Izmantojam datus no store, nevis no params
			if (truckRouteForm.outTruckObject) {
				const objectId = truckRouteForm.outTruckObject;
				const objectName = truckRouteForm.outTruckObjectName || '';
				console.log('Setting outTruckObject from store ID:', objectId, 'Name:', objectName);

				setSelectedOutTruckObject(objectId);
				setForm(prev => ({
					...prev,
					outTruckObject: objectId
				}));
				setOutTruckObjectDetails({ id: parseInt(objectId), name: objectName });

				setObjectsList(prev => {
					const exists = prev.some(obj => obj.id === objectId);
					if (!exists) return [...prev, { id: objectId, name: objectName }];
					return prev;
				});
			}

			if (truckRouteForm.inTruckObject) {
				const objectId = truckRouteForm.inTruckObject;
				const objectName = truckRouteForm.inTruckObjectName || '';
				console.log('Setting inTruckObject from store ID:', objectId, 'Name:', objectName);

				setSelectedInTruckObject(objectId);
				setForm(prev => ({
					...prev,
					inTruckObject: objectId
				}));
				setInTruckObjectDetails({ id: parseInt(objectId), name: objectName });

				setObjectsList(prev => {
					const exists = prev.some(obj => obj.id === objectId);
					if (!exists) return [...prev, { id: objectId, name: objectName }];
					return prev;
				});
			}

			fetchObjectsList();
		}
	}, [params.newObject, truckRouteForm, fetchObjectsList]);

	React.useEffect(() => {
		// Skip initialization if we're handling a new object
		if (params.newObject === 'true') {
			setIsLoading(false);
			return;
		}

		setIsLoading(true)
		const getLastFinishedRoute = async (): Promise<TruckRouteDto | null> => {
			try {
				const response = await freightAxios.get<Page<TruckRouteDto>>('/truck-routes?pageSize=1')
				return response.data.content[0] || null
			} catch (error) {
				console.error('Failed to fetch last finished route:', error)
				return null
			}
		}

		const initializeForm = async () => {
			try {
				// Get last route and populate form
				try {
					const lastRouteResponse = await freightAxios.get<TruckRouteDto>('/truck-routes/last-active')
					const lastRoute = lastRouteResponse.data
					setIsRouteFinish(true)

					// Set hasCargo based on whether cargoVolume exists
					setHasCargo(!!lastRoute.cargoVolume)

					// Convert dates from string to Date objects
					const routeDate = lastRoute.routeDate ? new Date(lastRoute.routeDate) : new Date()
					const outDateTime = lastRoute.outDateTime ? new Date(lastRoute.outDateTime) : new Date()

					const outTruckObjectId = lastRoute.outTruckObject?.id?.toString() || '';
					const inTruckObjectId = lastRoute.inTruckObject?.id?.toString() || '';

					// Set the selected object state variables
					setSelectedOutTruckObject(outTruckObjectId);
					setSelectedInTruckObject(inTruckObjectId);

					// Set the form state
					setForm({
						id: lastRoute.id?.toString() || '',
						routeDate,
						outDateTime,
						dateFrom: lastRoute.truckRoutePage?.dateFrom ? new Date(lastRoute.truckRoutePage.dateFrom) : new Date(),
						dateTo: lastRoute.truckRoutePage?.dateTo ? new Date(lastRoute.truckRoutePage.dateTo) : new Date(),
						routePageTruck: lastRoute.truckRoutePage?.truck?.id?.toString() || '',
						odometerAtStart: lastRoute.odometerAtStart?.toString() || '',
						odometerAtFinish: lastRoute.odometerAtFinish?.toString() || '',
						outTruckObject: outTruckObjectId,
						inTruckObject: inTruckObjectId,
						cargoType: '',  // Not provided in the response
						cargoVolume: lastRoute.cargoVolume?.toString() || '',
						unitType: lastRoute.unitType || '',
						fuelBalanceAtStart: lastRoute.fuelBalanceAtStart?.toString() || '',
						fuelReceived: lastRoute.fuelReceived?.toString() || '',
						notes: '',  // Not provided in the response
					})

					// Set the object details
					if (lastRoute.outTruckObject) {
						console.log('00000000000000000000');
						setOutTruckObjectDetails(lastRoute.outTruckObject);
					}
					if (lastRoute.inTruckObject) {
						console.log('00000000000000000000-1');
						setInTruckObjectDetails(lastRoute.inTruckObject);
					}
				} catch (error: any) {
					if (error.response?.status === 404) {
						console.log('111111111111111111111111111');
						setIsRouteFinish(false)
						// If no last route exists, get default truck
						// Get last finished route for odometer value
						const lastFinishedRoute = await getLastFinishedRoute()

						try {
							const response = await freightAxios.get('/trucks')
							if (response.data && response.data.length > 0) {
								const defaultTruck = response.data[0].id.toString()
								const currentDate = new Date()
								const outTruckObjectId = lastFinishedRoute?.outTruckObject?.id?.toString() || '';

								// Set the selected object state variables
								console.log('111111111111111111111111111outTruckObjectId: ', outTruckObjectId);
								setSelectedOutTruckObject(outTruckObjectId);
								console.log('222222222222222222222222222outTruckObjectId: ', outTruckObjectId);


								// Set the form state
								setForm(prev => ({
									...prev,
									routeDate: currentDate,
									routePageTruck: defaultTruck,
									odometerAtStart: lastFinishedRoute?.odometerAtFinish?.toString() || '',
									outTruckObject: outTruckObjectId,
									fuelBalanceAtStart: lastFinishedRoute?.fuelBalanceAtFinish?.toString() || ''
								}))

								// Set the object details
								if (lastFinishedRoute?.outTruckObject) {
									console.log('111111111111111111111111111-1');
									setOutTruckObjectDetails(lastFinishedRoute.outTruckObject);
								}
							}
						} catch (truckError) {
							console.error('Failed to fetch default truck:', truckError)
						}
					} else {
						console.error('Failed to fetch last finished route:', error)
					}
				}
			} catch (error) {
				console.error('Failed to fetch default truck:', error)
			} finally {
				setIsLoading(false)
			}
		}
		initializeForm()
	}, [checkRoutePage, params.newObject])

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

			// Make sure we're using the proper values from both state variables and form
			const outTruckObjectValue = selectedOutTruckObject || form.outTruckObject;
			const inTruckObjectValue = selectedInTruckObject || form.inTruckObject;

			const now = new Date().toISOString()
			const payload: TruckRouteDto = {
				id: form.id ? parseInt(form.id) : null,
				routeDate: format(form.routeDate, 'yyyy-MM-dd'),
				truckRoutePage: form.routePageTruck ? {
					dateFrom: format(form.dateFrom instanceof Date ? form.dateFrom : new Date(form.dateFrom), 'yyyy-MM-dd'),
					dateTo: format(form.dateTo instanceof Date ? form.dateTo : new Date(form.dateTo), 'yyyy-MM-dd'),
					truck: {id: parseInt(form.routePageTruck)},
					user: {id: user?.id || '0'},
					fuelBalanceAtStart: form.fuelBalanceAtStart ? parseFloat(form.fuelBalanceAtStart) : null,
				} : null,
				outTruckObject: outTruckObjectValue ?
						(outTruckObjectDetails ? outTruckObjectDetails : {id: parseInt(outTruckObjectValue)}) : null,
				inTruckObject: inTruckObjectValue ?
						(inTruckObjectDetails ? inTruckObjectDetails : {id: parseInt(inTruckObjectValue)}) : null,
				odometerAtStart: form.odometerAtStart ? parseInt(form.odometerAtStart) : null,
				odometerAtFinish: form.odometerAtFinish ? parseInt(form.odometerAtFinish) : null,
				cargoVolume: hasCargo && form.cargoVolume ? parseFloat(form.cargoVolume) : null,
				unitType: hasCargo ? form.unitType : null,
				fuelBalanceAtStart: form.fuelBalanceAtStart ? parseFloat(form.fuelBalanceAtStart) : existingRoutePage ? existingRoutePage.fuelBalanceAtStart : null,
				fuelBalanceAtFinish: null,
				fuelReceived: form.fuelReceived ? parseFloat(form.fuelReceived) : null,
				outDateTime: now,
				inDateTime: inTruckObjectValue && isItRouteFinish ? now : null
			}

			if (isItRouteFinish) {
				await freightAxios.put('/truck-routes', payload)
			} else {
				await freightAxios.post('/truck-routes', payload)
			}
			router.push('/(tabs)')
		} catch (error) {
			console.error('Failed to submit form:', error)
		} finally {
			setIsSubmitting(false)
		}
	};

	if (isLoading) {
		return (<SafeAreaView style={commonStyles.container}>
			<View style={commonStyles.loadingContainer}>
				<ActivityIndicator size="large" color={COLORS.secondary} />
			</View>
		</SafeAreaView>)
	}

	return (<SafeAreaView style={commonStyles.safeArea}>
		<ScrollView>
			<View style={[commonStyles.content, styles.webContainer]}>
				<View id="top" style={[styles.topContainer]}>
					<View style={commonStyles.row}>
						<FormDatePicker
								label="Brauciena datums"
								value={form.routeDate}
								onChange={(date) => setForm({...form, routeDate: date})}
								// disabled={isItRouteFinish}
						/>
						<View style={styles.truckField}>
							<FormDropdown
									label="Auto"
									value={form.routePageTruck}
									onSelect={(value) => setForm({...form, routePageTruck: value})}
									placeholder="Izvēlieties"
									endpoint="/trucks"
									disabled={isItRouteFinish}
									error={!form.routePageTruck ? 'Ievadiet datus!' : undefined}
							/>
						</View>
					</View>

					{showRoutePageError && (<View style={[styles.topContainer, showRoutePageError && styles.errorBorder]}>
						<Text style={styles.explanatoryText}>
							Nav izveidota maršruta lapa izvēlētā datuma periodam - pievienojiet informāciju
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
								label="Odometrs startā"
								value={form.odometerAtStart}
								onChangeText={(text) => {
									// Allow only numbers
									if (/^\d*$/.test(text) && text !== '0') {
										setForm({...form, odometerAtStart: text})
									}
								}}
								placeholder="Ievadiet rādījumu"
								keyboardType="numeric"
								disabled={isItRouteFinish}
								error={showRoutePageError && !form.odometerAtStart ? 'Ievadiet datus!' : undefined}
						/>
					</View>)}
				</View>

				<View id="atStart" style={[commonStyles.row, styles.atStartContainer]}>
					<View style={styles.inputWrapper}>
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
					</View>

					<View style={styles.inputWrapper}>
						<FormInput
								label="Degviela startā"
								value={form.fuelBalanceAtStart}
								onChangeText={(text) => {
									// Allow only numbers
									if (/^\d*$/.test(text)) {
										setForm({...form, fuelBalanceAtStart: text})
									}
								}}
								placeholder="Ievadiet degvielas daudzumu"
								keyboardType="numeric"
								disabled={true}
								visible={!showRoutePageError}
								error={showRoutePageError && !form.fuelBalanceAtStart ? 'Ievadiet datus!' : undefined}
						/>
					</View>
				</View>

				<FormDropdownWithAddButton
						label="Sākuma punkts"
						value={selectedOutTruckObject || form.outTruckObject} // Use direct state variable first
						onSelect={(value) => {
							console.log('outTruckObject selected:', value);
							setSelectedOutTruckObject(value); // Update direct state
							setForm(prev => ({...prev, outTruckObject: value})); // Update form state using functional update
						}}
						placeholder="Izvēlieties sākuma punktu"
						endpoint="/objects"
						disabled={isItRouteFinish}
						error={!selectedOutTruckObject && !form.outTruckObject ? 'Ievadiet datus!' : undefined}
						onAddPress={() => router.push({
							pathname: '/add-truck-object',
							params: { type: 'outTruckObject' }
						})}
						forceRefresh={refreshDropdowns}
						objectName={outTruckObjectDetails?.name} // Pass the object name for temporary options
				/>

				<FormDropdownWithAddButton
						label="Galamērķis"
						value={selectedInTruckObject || form.inTruckObject} // Use direct state variable first
						onSelect={(value) => {
							console.log('inTruckObject selected:', value);
							setSelectedInTruckObject(value); // Update direct state
							setForm(prev => ({...prev, inTruckObject: value})); // Update form state using functional update
						}}
						placeholder="Ievadiet galamērķi"
						endpoint="/objects"
						error={isItRouteFinish && !selectedInTruckObject && !form.inTruckObject ? 'Ievadiet datus!' : undefined}
						onAddPress={() => router.push({
							pathname: '/add-truck-object',
							params: { type: 'inTruckObject' }
						})}
						forceRefresh={refreshDropdowns}
						objectName={inTruckObjectDetails?.name || params.inTruckObjectName || ''}
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
						error={!showRoutePageError && (!form.odometerAtFinish || (parseInt(form.odometerAtFinish, 10) <= parseInt(form.odometerAtStart, 10))) ? 'Ievadiet datus!' : undefined}

				/>

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

				{hasCargo && (<>
					<FormDropdown
							label="Kravas tips"
							value={form.cargoType}
							onSelect={(value) => setForm({...form, cargoType: value})}
							placeholder=" Izvēlieties"
							endpoint="api/freight/cargo-types"
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
							endpoint="/unit-types"
					/>
				</>)}

				<View style={[commonStyles.row, styles.buttonContainer]}>
					<BackButton
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
	} : {},
	topContainer: {
		marginBottom: 0,
	},
	truckField: {
		flex: 1, marginTop: -4,
	},
	explanatoryText: Platform.OS === 'web' ? {
		...commonStyles.text,
		backgroundColor: COLORS.black100,
		padding: 16,
		borderRadius: 8,
		marginBottom: 16,
		textAlign: 'center',
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.05)',
		...SHADOWS.small,
	} : {
		...commonStyles.text,
		backgroundColor: COLORS.black100,
		padding: 16,
		borderRadius: 8,
		marginBottom: 16,
		textAlign: 'center',
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.15)',
		...SHADOWS.medium,
	},
	buttonContainer: {
		justifyContent: 'space-between', gap: 16, marginTop: 24,
	},
	backButton: Platform.OS === 'web' ? {
		flex: 1,
		backgroundColor: COLORS.black100,
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.05)',
		...SHADOWS.small,
	} : {
		flex: 1,
		backgroundColor: COLORS.black100,
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.15)',
		...SHADOWS.medium,
	},
	submitButton: Platform.OS === 'web' ? {
		flex: 1,
		...SHADOWS.small,
	} : {
		flex: 1,
		...SHADOWS.medium,
	},
	errorBorder: Platform.OS === 'web' ? {
		padding: 16,
		borderWidth: 2,
		borderColor: 'rgb(255, 156, 1)',
		borderRadius: 8,
		...SHADOWS.small,
	} : {
		padding: 16,
		borderWidth: 2,
		borderColor: 'rgb(255, 156, 1)',
		borderRadius: 8,
		...SHADOWS.medium,
	},
	atStartContainer: {
		width: '100%', gap: 16,
	},
	inputWrapper: {
		flex: 1
	}
})
