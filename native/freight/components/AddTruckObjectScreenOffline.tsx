import BackButton from '@/components/BackButton'
import {commonStyles} from '@/constants/styles'
import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, FlatList, Platform, Alert } from 'react-native';
import { COLORS, CONTAINER_WIDTH, FONT, SHADOWS } from '@/constants/theme';
import FormInput from '@/components/FormInput';
import Button from '@/components/Button';
import { router, useLocalSearchParams } from 'expo-router';
import { useObjectStore } from '@/hooks/useObjectStore';
import { createObject } from '@/utils/offlineDataManager';
import { useNetworkState } from '@/utils/networkUtils';

interface TruckObject {
	id: number;
	name: string;
}

export default function AddTruckObjectScreenOffline() {
	// Get the type parameter from the URL (outTruckObject or inTruckObject)
	const { type } = useLocalSearchParams<{ type?: string }>();
	const [objectName, setObjectName] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | undefined>(undefined);
	const [similarObjects, setSimilarObjects] = useState<TruckObject[]>([]);
	const [showSimilarModal, setShowSimilarModal] = useState(false);
	const [originalObject, setOriginalObject] = useState<TruckObject | null>(null);

	const { setNewTruckObject, updateTruckRouteForm } = useObjectStore();
	const { isConnected } = useNetworkState();

	const handleSubmit = async () => {
		if (!objectName.trim()) {
			setError('Lūdzu, ievadiet objekta nosaukumu');
			return;
		}

		setError(undefined);
		setIsSubmitting(true);

		try {
			// Use offline-first createObject function
			const response = await createObject({
				name: objectName.trim()
			});

			// If response contains warning about similar objects
			if (response.warning && response.similarObjects) {
				setSimilarObjects(response.similarObjects);
				setOriginalObject(response.originalObject);
				setShowSimilarModal(true);
			} else {
				// Successfully added object
				setObjectName('');

				// Show offline notification if not connected
				if (!isConnected) {
					Alert.alert(
						"Offline režīms",
						"Objekts ir saglabāts lokāli un tiks sinhronizēts, kad būs pieejams internets.",
						[{ text: "OK" }]
					);
				}

				// If object was added from truck-route screen, return with new object ID and name
				if (type && response.id) {
					// Save new object information in store
					setNewTruckObject({ 
						id: response.id.toString(), 
						name: objectName.trim(), 
						type: type as 'inTruckObject' | 'outTruckObject' 
					});
					
					// Also update truck-route form data
					if (type === 'outTruckObject') {
						updateTruckRouteForm({
							outTruckObject: response.id.toString(),
							outTruckObjectName: objectName.trim()
						});
					} else if (type === 'inTruckObject') {
						updateTruckRouteForm({
							inTruckObject: response.id.toString(),
							inTruckObjectName: objectName.trim()
						});
					}
					
					// Return to previous screen
					console.log('Navigating back with updated store data (offline-first)');
					router.back();
				} else {
					// Simply return back
					router.back();
				}
			}
		} catch (error: any) {
			console.error('Failed to create object:', error);
			if (error.message) {
				setError(error.message);
			} else {
				setError('Kļūda pievienojot objektu. Lūdzu, mēģiniet vēlreiz.');
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleForceCreate = async () => {
		if (!originalObject) return;

		setIsSubmitting(true);
		try {
			// Use offline-first createObject function with force flag
			const savedObject = await createObject(originalObject, true);
			setShowSimilarModal(false);
			setObjectName('');

			// Show offline notification if not connected
			if (!isConnected) {
				Alert.alert(
					"Offline režīms",
					"Objekts ir saglabāts lokāli un tiks sinhronizēts, kad būs pieejams internets.",
					[{ text: "OK" }]
				);
			}

			// If object was added from truck-route screen, return with new object ID and name
			if (type && savedObject.id) {
				// Save new object information in store
				setNewTruckObject({ 
					id: savedObject.id.toString(), 
					name: originalObject?.name || '', 
					type: type as 'inTruckObject' | 'outTruckObject' 
				});
				
				// Also update truck-route form data
				if (type === 'outTruckObject') {
					updateTruckRouteForm({
						outTruckObject: savedObject.id.toString(),
						outTruckObjectName: originalObject?.name || ''
					});
				} else if (type === 'inTruckObject') {
					updateTruckRouteForm({
						inTruckObject: savedObject.id.toString(),
						inTruckObjectName: originalObject?.name || ''
					});
				}
				
				// Return to previous screen
				console.log('Navigating back with updated store data (force create offline-first)');
				router.back();
			} else {
				// Simply return back
				router.back();
			}
		} catch (error) {
			console.error('Failed to force create object:', error);
			setError('Kļūda pievienojot objektu. Lūdzu, mēģiniet vēlreiz.');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
			<View style={styles.container}>
				<Text style={styles.title}>Pievienot jaunu objektu</Text>
				
				{!isConnected && (
					<View style={styles.offlineNotice}>
						<Text style={styles.offlineText}>
							📱 Offline režīms - objekts tiks sinhronizēts vēlāk
						</Text>
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
						title="Pievienot"
						onPress={handleSubmit}
						style={styles.submitButton}
						disabled={isSubmitting || !objectName.trim()}
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
										style={styles.forceButton}
										loading={isSubmitting}
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
	offlineNotice: {
		backgroundColor: COLORS.secondary,
		padding: 12,
		borderRadius: 8,
		marginBottom: 16,
	},
	offlineText: {
		color: COLORS.white,
		fontFamily: FONT.medium,
		fontSize: 14,
		textAlign: 'center',
	},
	submitButton: {
		marginTop: 24,
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
