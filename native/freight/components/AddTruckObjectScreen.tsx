import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, FlatList, Platform } from 'react-native';
import { COLORS, CONTAINER_WIDTH, FONT, SHADOWS } from '@/constants/theme';
import FormInput from '@/components/FormInput';
import Button from '@/components/Button';
import freightAxiosInstance from '@/config/freightAxios';
import { router, useLocalSearchParams } from 'expo-router';
import { useObjectStore } from '@/hooks/useObjectStore';

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

	const { setNewTruckObject } = useObjectStore();

	const handleSubmit = async () => {
		if (!objectName.trim()) {
			setError('Lūdzu, ievadiet objekta nosaukumu');
			return;
		}

		setError(undefined);
		setIsSubmitting(true);

		try {
			const response = await freightAxiosInstance.post('/objects', {
				name: objectName.trim()
			});

			// Ja atbilde satur brīdinājumu par līdzīgiem objektiem
			if (response.data.warning && response.data.similarObjects) {
				setSimilarObjects(response.data.similarObjects);
				setOriginalObject(response.data.originalObject);
				setShowSimilarModal(true);
			} else {
				// Veiksmīgi pievienots objekts
				setObjectName('');

				// Ja objekts tika pievienots no truck-route ekrāna, atgriežamies ar jauno objekta ID un nosaukumu
				if (type && response.data.id) {
					setNewTruckObject({ id: response.data.id.toString(), name: objectName.trim(), type: type as 'inTruckObject' | 'outTruckObject' });
					// Atgriežamies uz iepriekšējo ekrānu ar jauno objekta ID un nosaukumu
					console.log('Navigating back with params:', {
						type,
						id: response.data.id.toString(),
						name: objectName.trim(),
						paramName: `${type}Name`
					});

					const params = {
						[type]: response.data.id.toString(),
						[`${type}Name`]: objectName.trim(), // Add the object name as a parameter
						newObject: 'true'
					};

					console.log('Final params object:', params);

					router.replace({
						pathname: "/(tabs)/truck-route",
						params
					});
				} else {
					// Vienkārši atgriežamies atpakaļ
					router.back();
				}
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

	const handleForceCreate = async () => {
		if (!originalObject) return;

		setIsSubmitting(true);
		try {
			const savedObject = await freightAxiosInstance.post('/objects/force-create', originalObject);
			setShowSimilarModal(false);
			setObjectName('');

			// Ja objekts tika pievienots no truck-route ekrāna, atgriežamies ar jauno objekta ID un nosaukumu
			if (type && savedObject.data.id) {
				// Atgriežamies uz iepriekšējo ekrānu ar jauno objekta ID un nosaukumu
				console.log('Navigating back with params (force create):', {
					type,
					id: savedObject.data.id.toString(),
					name: originalObject?.name || '',
					paramName: `${type}Name`
				});

				const params = {
					id: undefined,
					[type]: savedObject.data.id.toString(),
					[`${type}Name`]: originalObject?.name || '', // Add the object name as a parameter
					newObject: 'true'
				};

				console.log('Final params object (force create):', params);

				router.navigate({
					pathname: "/(tabs)/truck-route",
					params
				});
			} else {
				// Vienkārši atgriežamies atpakaļ
				router.back();
			}
		} catch (error) {
			setError('Kļūda pievienojot objektu. Lūdzu, mēģiniet vēlreiz.');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
			<View style={styles.container}>
				<Text style={styles.title}>Pievienot jaunu objektu</Text>

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

				{/* Modālais logs līdzīgu objektu parādīšanai */}
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
