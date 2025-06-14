import BackButton from '@/components/BackButton'
import {commonStyles} from '@/constants/styles'
import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, FlatList, Platform, Alert } from 'react-native';
import { COLORS, CONTAINER_WIDTH, FONT, SHADOWS } from '@/constants/theme';
import FormInput from '@/components/FormInput';
import Button from '@/components/Button';
import freightAxiosInstance from '@/config/freightAxios';
import { router, useLocalSearchParams } from 'expo-router';
import { useObjectStore } from '@/hooks/useObjectStore';

// NEW: Import offline hooks and components
import { useOfflineData } from '@/hooks/useOfflineData'
import { useNetworkStatus } from '../hooks/useNetworkStatus'
import { CACHE_KEYS } from '@/config/offlineConfig'
import GlobalOfflineIndicator from '@/components/GlobalOfflineIndicator'

interface TruckObject {
	id: number;
	name: string;
}

export default function AddTruckObjectScreen() {
	// Get the type parameter from the URL (outTruckObject or inTruckObject)
	const { type } = useLocalSearchParams<{ type?: string }>();
	const [objectName, setObjectName] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | undefined>(undefined);
	const [similarObjects, setSimilarObjects] = useState<TruckObject[]>([]);
	const [showSimilarModal, setShowSimilarModal] = useState(false);
	const [originalObject, setOriginalObject] = useState<TruckObject | null>(null);

	const { setNewTruckObject, updateTruckRouteForm } = useObjectStore();

	// NEW: Use network status hook
	const { isOnline, isOfflineMode } = useNetworkStatus()

	// NEW: Use offline data to cache existing objects for validation
	const {
		data: existingObjects,
		isLoading: objectsLoading,
		isFromCache: objectsFromCache,
		isStale: objectsStale,
		error: objectsError,
		refetch: refetchObjects
	} = useOfflineData(
		CACHE_KEYS.OBJECTS,
		async () => {
			const response = await freightAxiosInstance.get('/objects');
			return response.data;
		},
		{
			strategy: 'stale-while-revalidate',
			onError: (error) => {
				console.error('Failed to fetch objects for validation:', error)
			}
		}
	)

	// NEW: Enhanced submit with offline support
	const handleSubmit = async () => {
		if (!objectName.trim()) {
			setError('Lūdzu, ievadiet objekta nosaukumu');
			return;
		}

		// NEW: Check if we're offline
		if (!isOnline) {
			Alert.alert(
				"Offline režīms", 
				"Nevar pievienot jaunus objektus offline režīmā. Lūdzu, pievienojieties internetam.",
				[
					{ text: "Sapratu", style: "default" },
					{ 
						text: "Mēģināt vēlreiz", 
						onPress: () => {
							// Try to refetch network status
							setTimeout(() => {
								if (isOnline) {
									handleSubmit();
								}
							}, 1000);
						}
					}
				]
			);
			return;
		}

		setError(undefined);
		setIsSubmitting(true);

		try {
			const response = await freightAxiosInstance.post('/objects', {
				name: objectName.trim()
			});

			// If response contains warning about similar objects
			if (response.data.warning && response.data.similarObjects) {
				setSimilarObjects(response.data.similarObjects);
				setOriginalObject(response.data.originalObject);
				setShowSimilarModal(true);
			} else {
				// Successfully added object
				await handleSuccessfulAdd(response.data);
			}
		} catch (error: any) {
			if (error.response?.data?.error) {
				setError(error.response.data.error);
			} else {
				setError('Kļūda pievienojot objektu. Lūdzu, mēģiniet vēlreiz.');
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	// NEW: Handle successful object addition
	const handleSuccessfulAdd = async (responseData: any) => {
		setObjectName('');

		// NEW: Refresh objects cache after successful add
		await refetchObjects();

		// If object was added from truck-route screen, return with new object ID and name
		if (type && responseData.id) {
			// Save new object information in store
			setNewTruckObject({ 
				id: responseData.id.toString(), 
				name: objectName.trim(), 
				type: type as 'inTruckObject' | 'outTruckObject' 
			});
			
			// Also update truck-route form data
			if (type === 'outTruckObject') {
				updateTruckRouteForm({
					outTruckObject: responseData.id.toString(),
					outTruckObjectName: objectName.trim()
				});
			} else if (type === 'inTruckObject') {
				updateTruckRouteForm({
					inTruckObject: responseData.id.toString(),
					inTruckObjectName: objectName.trim()
				});
			}
			
			// Return to previous screen
			console.log('Navigating back with updated store data');
			router.back();
		} else {
			// Simply return back
			router.back();
		}
	};

	// NEW: Enhanced force create with offline check
	const handleForceCreate = async () => {
		if (!originalObject) return;

		// NEW: Check if we're offline
		if (!isOnline) {
			Alert.alert(
				"Offline režīms", 
				"Nevar pievienot objektus offline režīmā. Lūdzu, pievienojieties internetam."
			);
			return;
		}

		setIsSubmitting(true);
		try {
			const savedObject = await freightAxiosInstance.post('/objects/force-create', originalObject);
			setShowSimilarModal(false);
			
			// Handle successful addition
			await handleSuccessfulAdd(savedObject.data);
		} catch (error) {
			setError('Kļūda pievienojot objektu. Lūdzu, mēģiniet vēlreiz.');
		} finally {
			setIsSubmitting(false);
		}
	};

	// NEW: Client-side validation using cached objects
	const checkSimilarObjects = (inputName: string) => {
		if (!existingObjects || !inputName.trim()) return [];
		
		const searchTerm = inputName.toLowerCase().trim();
		return existingObjects.filter((obj: any) => 
			obj.name.toLowerCase().includes(searchTerm) && 
			obj.name.toLowerCase() !== searchTerm
		);
	};

	// NEW: Get similar objects for current input
	const currentSimilarObjects = checkSimilarObjects(objectName);

	return (
		<View style={styles.container}>
			{/* NEW: Add offline indicator */}
			<GlobalOfflineIndicator />

			<Text style={styles.title}>Pievienot jaunu objektu</Text>

			{/* NEW: Show cache status if objects data is from cache */}
			{objectsFromCache && (
				<View style={styles.cacheIndicator}>
					<Text style={styles.cacheText}>
						📱 Objektu saraksts no cache
						{objectsStale && ' (dati var būt novecojuši)'}
					</Text>
				</View>
			)}

			{/* NEW: Show error if objects failed to load and no cache */}
			{objectsError && !objectsFromCache && (
				<View style={styles.errorContainer}>
					<Text style={styles.errorText}>
						⚠️ Neizdevās ielādēt objektu sarakstu
					</Text>
					<Button
						title="Mēģināt vēlreiz"
						onPress={() => refetchObjects()}
						style={styles.retryButton}
					/>
				</View>
			)}

			{/* NEW: Show offline warning */}
			{!isOnline && (
				<View style={styles.offlineWarning}>
					<Text style={styles.offlineWarningText}>
						🔴 Offline režīmā nav iespējams pievienot jaunus objektus
					</Text>
				</View>
			)}

			{/* NEW: Show similar objects warning (client-side validation) */}
			{currentSimilarObjects.length > 0 && objectName.trim().length > 2 && (
				<View style={styles.similarWarning}>
					<Text style={styles.similarWarningTitle}>
						⚠️ Atrasti līdzīgi objekti:
					</Text>
					{currentSimilarObjects.slice(0, 3).map((obj: any) => (
						<Text key={obj.id} style={styles.similarWarningText}>
							• {obj.name}
						</Text>
					))}
					{currentSimilarObjects.length > 3 && (
						<Text style={styles.similarWarningText}>
							... un vēl {currentSimilarObjects.length - 3}
						</Text>
					)}
				</View>
			)}

			<FormInput
				label="Objekta nosaukums"
				value={objectName}
				onChangeText={setObjectName}
				placeholder="Ievadiet objekta nosaukumu"
				error={error}
			/>

			<Button
				title={isOnline ? "Pievienot" : "Pievienot (Offline)"}
				onPress={handleSubmit}
				style={[
					styles.submitButton,
					!isOnline && styles.offlineButton
				]}
				disabled={isSubmitting || !objectName.trim() || !isOnline}
				loading={isSubmitting}
			/>

			<BackButton
				onPress={() => router.push('/truck-route')}
			/>

			{/* Modal window for displaying similar objects */}
			<Modal
				visible={showSimilarModal}
				transparent={true}
				animationType="fade"
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						<Text style={styles.modalTitle}>Atrasti līdzīgi objekti</Text>
						<Text style={styles.modalSubtitle}>
							Sistēmā jau eksistē līdzīgi objekti. Vai tiešām vēlaties pievienot jaunu objektu ar nosaukumu "{originalObject?.name}"?
						</Text>

						<FlatList
							data={similarObjects}
							keyExtractor={(item) => item.id.toString()}
							renderItem={({ item }) => (
								<View style={styles.similarItem}>
									<Text style={styles.similarItemText}>{item.name}</Text>
								</View>
							)}
							style={styles.similarList}
						/>

						<View style={styles.modalButtons}>
							<Button
								title="Atcelt"
								onPress={() => setShowSimilarModal(false)}
								style={styles.cancelButton}
							/>
							<Button
								title="Pievienot tāpat"
								onPress={handleForceCreate}
								style={[
									styles.forceButton,
									!isOnline && styles.offlineButton
								]}
								loading={isSubmitting}
								disabled={!isOnline}
							/>
						</View>
					</View>
				</View>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		backgroundColor: COLORS.primary,
	},
	title: {
		fontSize: 24,
		fontFamily: FONT.semiBold,
		color: COLORS.white,
		marginBottom: 24,
	},
	submitButton: {
		marginTop: 24,
	},
	// NEW: Offline-related styles
	cacheIndicator: {
		backgroundColor: 'rgba(255, 193, 7, 0.1)',
		borderRadius: 8,
		padding: 12,
		marginBottom: 16,
		borderWidth: 1,
		borderColor: 'rgba(255, 193, 7, 0.3)',
	},
	cacheText: {
		fontSize: 12,
		fontFamily: FONT.medium,
		color: COLORS.warning,
		textAlign: 'center',
	},
	errorContainer: {
		backgroundColor: 'rgba(255, 0, 0, 0.1)',
		borderRadius: 8,
		padding: 12,
		marginBottom: 16,
		borderWidth: 1,
		borderColor: 'rgba(255, 0, 0, 0.3)',
	},
	errorText: {
		fontSize: 14,
		fontFamily: FONT.medium,
		color: '#FF6B6B',
		textAlign: 'center',
		marginBottom: 8,
	},
	retryButton: {
		backgroundColor: COLORS.secondary,
		borderRadius: 8,
		paddingVertical: 8,
		paddingHorizontal: 16,
	},
	offlineWarning: {
		backgroundColor: 'rgba(255, 0, 0, 0.1)',
		borderRadius: 8,
		padding: 12,
		marginBottom: 16,
		borderWidth: 1,
		borderColor: 'rgba(255, 0, 0, 0.3)',
	},
	offlineWarningText: {
		fontSize: 14,
		fontFamily: FONT.medium,
		color: '#FF6B6B',
		textAlign: 'center',
	},
	similarWarning: {
		backgroundColor: 'rgba(255, 193, 7, 0.1)',
		borderRadius: 8,
		padding: 12,
		marginBottom: 16,
		borderWidth: 1,
		borderColor: 'rgba(255, 193, 7, 0.3)',
	},
	similarWarningTitle: {
		fontSize: 14,
		fontFamily: FONT.semiBold,
		color: COLORS.warning,
		marginBottom: 8,
	},
	similarWarningText: {
		fontSize: 12,
		fontFamily: FONT.regular,
		color: COLORS.warning,
		marginBottom: 2,
	},
	offlineButton: {
		backgroundColor: COLORS.gray,
		opacity: 0.6,
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	modalContent: Platform.OS === 'web' ? {
		backgroundColor: COLORS.black100,
		borderRadius: 12,
		padding: 20,
		width: '90%',
		maxWidth: 500,
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.05)',
		...SHADOWS.small,
	} : {
		backgroundColor: COLORS.black100,
		borderRadius: 12,
		padding: 20,
		width: '90%',
		maxWidth: 500,
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.15)',
		...SHADOWS.medium,
	},
	modalTitle: {
		fontSize: 20,
		fontFamily: FONT.semiBold,
		color: COLORS.white,
		marginBottom: 12,
	},
	modalSubtitle: {
		fontSize: 16,
		fontFamily: FONT.regular,
		color: COLORS.gray,
		marginBottom: 16,
	},
	similarList: {
		maxHeight: 200,
		marginBottom: 16,
	},
	similarItem: Platform.OS === 'web' ? {
		backgroundColor: COLORS.black200,
		padding: 12,
		borderRadius: 8,
		marginBottom: 8,
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.05)',
		...SHADOWS.small,
	} : {
		backgroundColor: COLORS.black200,
		padding: 12,
		borderRadius: 8,
		marginBottom: 8,
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.15)',
		...SHADOWS.medium,
	},
	similarItemText: {
		fontSize: 16,
		fontFamily: FONT.medium,
		color: COLORS.white,
	},
	modalButtons: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	cancelButton: {
		flex: 1,
		marginRight: 8,
		backgroundColor: COLORS.black200,
	},
	forceButton: {
		flex: 1,
		marginLeft: 8,
	},
});
