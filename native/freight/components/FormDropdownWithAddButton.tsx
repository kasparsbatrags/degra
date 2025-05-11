import React, { useEffect, useState, useCallback } from 'react';
import { View, Pressable, Text, StyleSheet, Platform, FlatList, Modal } from 'react-native';
import { COLORS, FONT, SHADOWS } from '@/constants/theme';
import freightAxiosInstance from '../config/freightAxios';

interface Option {
	id: string;
	name: string;
}

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
	externalOptions?: Option[];
}

const FormDropdownWithAddButton: React.FC<FormDropdownWithAddButtonProps> = ({
	label,
	value,
	onSelect,
	placeholder = 'Izvēlieties vērtību',
	error,
	endpoint,
	filterValue,
	disabled,
	onAddPress,
	forceRefresh = 0,
	objectName,
	externalOptions,
}) => {
	// Dropdown state
	const [isOpen, setIsOpen] = useState(false);
	const [options, setOptions] = useState<Option[]>([]);
	const [loading, setLoading] = useState(false);
	const [localValue, setLocalValue] = useState<string>(value || '');

	// Update local value when prop changes
	useEffect(() => {
		if (value !== localValue) {
			setLocalValue(value);
		}
	}, [value]);

	// Fetch options from API
	const fetchOptions = useCallback(async () => {
		if (!endpoint) return;
		try {
			setLoading(true);
			const response = await freightAxiosInstance.get(endpoint);
			const formatted = response.data.map((item: any) => ({
				id: String(item.id),
				name: item.registrationNumber || item.name || String(item)
			}));
			setOptions(formatted);
		} catch (err) {
			console.error('Failed to fetch options:', err);
		} finally {
			setLoading(false);
		}
	}, [endpoint]);

	// Load options on mount or when dependencies change
	useEffect(() => {
		if (externalOptions) {
			setOptions(externalOptions);
		} else if (endpoint && (options.length === 0 || forceRefresh > 0)) {
			fetchOptions();
		}
	}, [externalOptions, endpoint, fetchOptions, forceRefresh]);

	// Filter options if needed
	const listOptions = filterValue
		? options.filter(opt => opt.id !== filterValue)
		: options;

	// Find selected option in the options list
	const selectedOption = options.find(opt => opt.id === localValue);
	const [tempSelectedOption, setTempSelectedOption] = useState<Option | null>(null);

	// Handle case when value exists but option is not in the list
	useEffect(() => {
		if (!localValue) {
			setTempSelectedOption(null);
			return;
		}

		const option = options.find(opt => opt.id === localValue);
		if (option) {
			setTempSelectedOption(null);
		} else if (objectName) {
			setTempSelectedOption({ id: localValue, name: objectName });
		} else {
			setTempSelectedOption({ id: localValue, name: `ID: ${localValue}` });
		}
	}, [localValue, options, objectName]);

	const displayOption = selectedOption || tempSelectedOption;

	// Handle selection with local state update
	const handleSelect = (optionId: string) => {
		setLocalValue(optionId);
		onSelect(optionId);
		setIsOpen(false);
	};

	// Render option in the dropdown list
	const renderOption = ({ item }: { item: Option }) => (
		<Pressable
			style={({ pressed }) => [dropdownStyles.option, pressed && dropdownStyles.optionPressed]}
			onPress={() => handleSelect(item.id)}
		>
			<Text style={dropdownStyles.optionText}>{item.name}</Text>
		</Pressable>
	);

	return (
		<View style={styles.container}>
			<View style={styles.dropdownContainer}>
				<View style={{ flex: 1, marginRight: 8 }}>
					<View style={dropdownStyles.container}>
						<Text style={dropdownStyles.label}>{label}</Text>
						<Pressable
							style={[dropdownStyles.input, error && dropdownStyles.inputError, disabled && dropdownStyles.inputDisabled]}
							onPress={() => !disabled && setIsOpen(true)}
						>
							<Text style={[dropdownStyles.inputText, !displayOption && dropdownStyles.placeholder]}>
								{displayOption ? displayOption.name : (loading ? 'Ielādē...' : placeholder)}
							</Text>
						</Pressable>
						{error && <Text style={dropdownStyles.errorText}>{error}</Text>}

						<Modal visible={isOpen} transparent animationType="slide" onRequestClose={() => setIsOpen(false)}>
							<View style={dropdownStyles.modalContainer}>
								<View style={dropdownStyles.modalContent}>
									<FlatList
										data={listOptions}
										renderItem={renderOption}
										keyExtractor={(item) => item.id}
										contentContainerStyle={dropdownStyles.optionsContent}
									/>
								</View>
							</View>
						</Modal>
					</View>
				</View>
				<Pressable
					disabled={disabled}
					style={({ pressed }) => [
						styles.addButton,
						pressed && !disabled && styles.addButtonPressed,
						disabled && { opacity: 0.5 }
					]}
					onPress={onAddPress}
				>
					<Text style={styles.addButtonText}>+</Text>
				</Pressable>
			</View>
		</View>
	);
};

// Styles for the dropdown part (copied from FormDropdown)
const dropdownStyles = StyleSheet.create({
	container: { marginBottom: 16 },
	label: { fontFamily: FONT.medium, fontSize: 16, color: COLORS.white, marginBottom: 4 },
	input: {
		height: 48,
		backgroundColor: COLORS.black100,
		borderRadius: 8,
		justifyContent: 'center',
		paddingLeft: 12,
	},
	inputText: { fontFamily: FONT.regular, fontSize: 16, color: COLORS.white },
	placeholder: { color: COLORS.gray },
	inputError: { borderColor: COLORS.error, borderWidth: 1 },
	errorText: { fontSize: 14, color: COLORS.error, marginTop: 4 },
	option: { padding: 16, borderRadius: 8 },
	optionPressed: { backgroundColor: COLORS.black100 },
	optionText: { fontSize: 16, color: COLORS.white },
	inputDisabled: { opacity: 0.5 },
	modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
	modalContent: { backgroundColor: COLORS.primary, borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '80%' },
	optionsContent: { padding: 8 }
});

// Styles for the container and add button
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
