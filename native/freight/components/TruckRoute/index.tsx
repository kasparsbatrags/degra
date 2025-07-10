import {isRedirectingToLogin} from '@/config/axios'
import {commonStyles} from '@/constants/styles'
import {COLORS} from '@/constants/theme'
import {useTruckRouteForm} from '@/hooks/useTruckRouteForm'
import {getRoutePoint} from '@/utils/offlineDataManager'
import {isSessionActive} from '@/utils/sessionUtils'
import {router, useLocalSearchParams, useNavigation} from 'expo-router'
import React, {useEffect, useLayoutEffect, useState} from 'react'
import {ActivityIndicator, Alert, ScrollView, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import BackButton from '../../components/BackButton'
import Button from '../../components/Button'
import RouteBasicTab from './RouteBasicTab'
import RouteFuelTab from './RouteFuelTab'
import RouteOdometerTab from './RouteOdometerTab'
import {styles} from './styles'
import TabNavigation from './TabNavigation'

export default function TruckRouteScreen() {
	const params = useLocalSearchParams<{
		id: string;
		outTruckObject?: string;
		inTruckObject?: string;
		outTruckObjectName?: string;
		inTruckObjectName?: string;
		newObject?: string;
		isRouteActive?: string;
	}>()

	const [activeTab, setActiveTab] = useState<'basic' | 'odometer' | 'fuel'>('basic')
	const navigation = useNavigation()

	// Izmantojam pielāgoto hook
	const {
		isLoading,
		hasCargo,
		setHasCargo,
		showRoutePageError,
		isItRouteFinish,
		outTruckObjectDetails,
		inTruckObjectDetails,
		refreshDropdowns,
		selectedOutTruckObject,
		setSelectedOutTruckObject,
		selectedInTruckObject,
		setSelectedInTruckObject,
		form,
		setForm,
		isSubmitting,
		handleSubmit: originalHandleSubmit
	} = useTruckRouteForm(params)

	// Check session status when component is loaded
	useEffect(() => {
		const checkSession = async () => {
			const sessionActive = await isSessionActive()
			if (!sessionActive && !isRedirectingToLogin) {
				router.replace('/(auth)/login')
			}
		}

		checkSession()
	}, [router])

	useLayoutEffect(() => {
		const getInitialTitle = async () => {
			try {
				const routePoint = await getRoutePoint()

				navigation.setOptions({
					title: routePoint === 'FINISH' ? 'Beigt braucienu' : 'Sākt braucienu',
				})
			} catch (error) {
				console.error('Failed to get route point:', error)
				navigation.setOptions({
					title: 'Sākt braucienu',
				})
			}
		}

		getInitialTitle()
	}, [navigation])

	// Atjaunināt virsrakstu, kad mainās isItRouteFinish vērtība
	useEffect(() => {
		navigation.setOptions({
			title: isItRouteFinish ? 'Beigt braucienu' : 'Sākt braucienu'
		})
	}, [isItRouteFinish, navigation])

	// Validācijas funkcija, kas pārbauda obligātos laukus un pārslēdz uz atbilstošo tabu, ja kāds lauks nav aizpildīts
	const validateForm = () => {

		const hasOutTruckObject = selectedOutTruckObject || form.outTruckObject
		console.log('=== VALIDATE FORM DEBUG ===')
		console.log('isItRouteFinish:', isItRouteFinish)
		console.log('form.routePageTruck:', form.routePageTruck)
		console.log('selectedOutTruckObject:', selectedOutTruckObject)
		console.log('form.outTruckObject:', form.outTruckObject)
		console.log('hasOutTruckObject:', hasOutTruckObject)

		if (!form.routePageTruck || !hasOutTruckObject) {
			setActiveTab('basic')
			console.error('VALIDATION FAILED: Basic tab - routePageTruck:', !form.routePageTruck, 'hasOutTruckObject:', !hasOutTruckObject)
			return false
		}

		// Pārbaudīt odometer tab laukus
		if (!form.odometerAtStart || (isItRouteFinish && !form.odometerAtFinish)) {
			setActiveTab('odometer')
			console.error('Error: ', !form.odometerAtStart || (isItRouteFinish && !form.odometerAtFinish))
			return false
		}

		// Pārbaudīt fuel tab laukus
		if (!form.fuelBalanceAtStart) {
			setActiveTab('fuel')
			console.error('Error: ', !form.fuelBalanceAtStart)
			return false
		}

		return true
	}

	// Jauna handleSubmit funkcija, kas veic validāciju
	const handleSubmit = async () => {
		if (!validateForm()) {
			Alert.alert('Kļūda', 'Lūdzu, aizpildiet visus obligātos laukus.')
			return
		}

		await originalHandleSubmit()
	}

	if (isLoading) {
		return (<SafeAreaView style={commonStyles.container}>
					<View style={commonStyles.loadingContainer}>
						<ActivityIndicator size="large" color={COLORS.secondary} />
					</View>
				</SafeAreaView>)
	}

	// Kopējie props, ko padot visām tab komponentēm
	const tabProps = {
		isItRouteFinish,
		form,
		setForm,
		hasCargo,
		setHasCargo,
		showRoutePageError,
		selectedOutTruckObject,
		selectedInTruckObject,
		setSelectedOutTruckObject,
		setSelectedInTruckObject,
		outTruckObjectDetails,
		inTruckObjectDetails,
		refreshDropdowns,
		router,
		params
	}

	return (<SafeAreaView style={commonStyles.safeArea}>
				<ScrollView>
					<View style={[commonStyles.content, styles.webContainer]}>
						{/* Tab navigācija */}
						<TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

						{/* Tab saturs */}
						{activeTab === 'basic' && <RouteBasicTab {...tabProps} />}
						{activeTab === 'odometer' && <RouteOdometerTab {...tabProps} />}
						{activeTab === 'fuel' && <RouteFuelTab {...tabProps} />}

						<View style={[commonStyles.row, styles.buttonContainer]}>
							<BackButton
									onPress={() => router.push('/(tabs)')}
									style={[styles.backButton, isSubmitting && commonStyles.buttonDisabled]}
							/>
							<Button
									title="Saglabāt1"
									onPress={handleSubmit}
									style={[styles.submitButton, isSubmitting && commonStyles.buttonDisabled]}
									disabled={isSubmitting}
							/>
						</View>
					</View>
				</ScrollView>
			</SafeAreaView>)
}
