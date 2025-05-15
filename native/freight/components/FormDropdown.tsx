import React, { useEffect, useState, useCallback } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import freightAxiosInstance from '@/config/freightAxios';
import { COLORS, FONT } from '@/constants/theme';
import { handleUserActivity, ACTIVITY_LEVELS } from '@/utils/userActivityTracker';

interface Option {
	id: string;
	name: string;
}

interface FormDropdownProps {
	label: string;
	value: string;
	onSelect: (value: string) => void;
	placeholder?: string;
	error?: string;
	endpoint?: string;
	filterValue?: string;
	disabled?: boolean;
	forceRefresh?: number;
	objectName?: string;
	externalOptions?: Option[];
}

const FormDropdown: React.FC<FormDropdownProps> = ({
	label,
	value,
	onSelect,
	placeholder = 'Izvēlieties vērtību',
	error,
	endpoint,
	filterValue,
	disabled,
	forceRefresh = 0,
	objectName,
	externalOptions,
}) => {
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

	useEffect(() => {
		if (externalOptions) {
			setOptions(externalOptions);
		} else if (endpoint && (options.length === 0 || forceRefresh > 0)) {
			fetchOptions();
		}
	}, [externalOptions, endpoint, fetchOptions, forceRefresh]);

	const listOptions = filterValue
			? options.filter(opt => opt.id !== filterValue)
			: options;

	// Find selected option in the options list
	const selectedOption = options.find(opt => opt.id === localValue);
	const [tempSelectedOption, setTempSelectedOption] = useState<Option | null>(null);

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
		// Call handleUserActivity when user selects an option
		handleUserActivity(ACTIVITY_LEVELS.HIGH);
		setLocalValue(optionId);
		onSelect(optionId);
		setIsOpen(false);
	};

	const renderOption = ({ item }: { item: Option }) => (
			<Pressable
					style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
					onPress={() => handleSelect(item.id)}
			>
				<Text style={styles.optionText}>{item.name}</Text>
			</Pressable>
	);

	return (
			<View style={styles.container}>
				<Text style={styles.label}>{label}</Text>
				<Pressable
						style={[styles.input, error && styles.inputError, disabled && styles.inputDisabled]}
						onPress={() => !disabled && setIsOpen(true)}
				>
					<Text style={[styles.inputText, !displayOption && styles.placeholder]}>
						{displayOption ? displayOption.name : (loading ? 'Ielādē...' : placeholder)}
					</Text>
				</Pressable>
				{error && <Text style={styles.errorText}>{error}</Text>}

				<Modal visible={isOpen} transparent animationType="slide" onRequestClose={() => setIsOpen(false)}>
					<View style={styles.modalContainer}>
						<View style={styles.modalContent}>
							<FlatList
									data={listOptions}
									renderItem={renderOption}
									keyExtractor={(item) => item.id}
									contentContainerStyle={styles.optionsContent}
							/>
						</View>
					</View>
				</Modal>
			</View>
	);
};

const styles = StyleSheet.create({
	container: {
		height: 96,
	},
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

export default FormDropdown;
