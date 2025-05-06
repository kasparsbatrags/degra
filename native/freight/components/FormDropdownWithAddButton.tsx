import React from 'react';
import { View, Pressable, Text, StyleSheet, Platform } from 'react-native';
import FormDropdown from './FormDropdown';
import { COLORS, FONT, SHADOWS } from '@/constants/theme';

interface FormDropdownWithAddButtonProps {
	label: string;
	value: string;
	onSelect: (value: string) => void;
	placeholder?: string;
	error?: string;
	endpoint: string;
	filterValue?: string;
	disabled?: boolean;
	onAddPress: () => void;
	forceRefresh?: number;
	objectName?: string;
}

const FormDropdownWithAddButton: React.FC<FormDropdownWithAddButtonProps> = ({
	onAddPress,
	...dropdownProps
}) => {
	return (
			<View style={styles.container}>
				<View style={styles.dropdownContainer}>
					<View style={{ flex: 1, marginRight: 8 }}>
						<FormDropdown {...dropdownProps} objectName={dropdownProps.objectName} />
					</View>
					<Pressable
							style={({ pressed }) => [
								styles.addButton,
								pressed && styles.addButtonPressed
							]}
							onPress={onAddPress}
					>
						<Text style={styles.addButtonText}>+</Text>
					</Pressable>
				</View>

			</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 16,
	},
	dropdownContainer: {
		flex: 1,
		flexDirection: 'row',
	},
	addButton: Platform.OS === 'web' ? {
		width: 48,
		height: 48,
		borderRadius: 8,
		backgroundColor: COLORS.secondary,
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 28,
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.05)',
		...SHADOWS.small,
	} : {
		width: 48,
		height: 48,
		borderRadius: 8,
		backgroundColor: COLORS.secondary,
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 1,
		marginTop: 28,
		borderColor: 'rgba(255, 255, 255, 0.15)',
		...SHADOWS.medium,
	},
	addButtonPressed: {
		opacity: 0.8,
		transform: [{ scale: 0.98 }],
	},
	addButtonText: {
		color: COLORS.white,
		fontSize: 24,
		fontFamily: FONT.bold,
		lineHeight: 24,
	},
});

export default FormDropdownWithAddButton;
