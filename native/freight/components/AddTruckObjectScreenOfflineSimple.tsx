import BackButton from '@/components/BackButton'
import {commonStyles} from '@/constants/styles'
import React, { useState } from 'react';
import {View, Text, StyleSheet, Alert, Platform} from 'react-native'
import {COLORS, FONT, SHADOWS} from '@/constants/theme'
import FormInput from '@/components/FormInput';
import Button from '@/components/Button';
import { router, useLocalSearchParams } from 'expo-router';
import { useObjectStore } from '@/hooks/useObjectStore';
import { createObject } from '@/utils/offlineDataManager';
import { useNetworkState } from '@/utils/networkUtils';

export default function AddTruckObjectScreenOfflineSimple() {
	// Get the type parameter from the URL (outTruckObject or inTruckObject)
	const { type } = useLocalSearchParams<{ type?: string }>();
	const [objectName, setObjectName] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | undefined>(undefined);

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

			<View style={styles.buttonContainer}>
				<BackButton
						onPress={() => router.push('/truck-route')}
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
	buttonContainer: {
		flexDirection: 'row', justifyContent: 'space-between', gap: 16, marginTop: 24,
	},
	backButton: Platform.OS === 'web' ? {
		flex: 1, backgroundColor: COLORS.black100,
		borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)',
		...SHADOWS.small,
	} : {
		flex: 1, backgroundColor: COLORS.black100,
		borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.15)',
		...SHADOWS.medium,
	},
	submitButton: Platform.OS === 'web' ? {
		flex: 1,
		...SHADOWS.small,
	} : {
		flex: 1,
		...SHADOWS.medium,
	},
});
