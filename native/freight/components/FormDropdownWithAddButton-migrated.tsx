import React, { useEffect, useState, useCallback } from 'react';
import { View, Pressable, Text, StyleSheet, Platform, FlatList, Modal, ActivityIndicator, TouchableOpacity } from 'react-native';
import { COLORS, FONT, SHADOWS } from '@/constants/theme';
import freightAxiosInstance from '../config/freightAxios';
import { Ionicons } from '@expo/vector-icons';

// NEW: Import offline hooks and components
import { useOfflineData } from '@/hooks/useOfflineData'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { CACHE_KEYS } from '@/config/offlineConfig'

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

	// NEW: Use network status hook
	const { isOnline, isOfflineMode } = useNetworkStatus()

	// NEW: Generate cache key based on endpoint
	const cacheKey = endpoint ? `dropdown_${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}` : null;

	// NEW: Use offline data for dropdown options
	const {
		data: cachedOptions,
		isLoading: optionsLoading,
		isFromCache: optionsFromCache,
		isStale: optionsStale,
		error: optionsError,
		refetch: refetchOptions
	} = useOfflineData(
		cacheKey || 'form_dropdown_with_add_button_default',
		async () => {
			if (!endpoint) return [];
			const response = await freightAxiosInstance.get(endpoint);
			return response.data.map((item: any) => ({
				id: String(item.id),
				name: item.registration_number || item.registrationNumber || item.name || String(item)
			}));
		},
		{
			strategy: 'stale-while-revalidate',
			enabled: !!endpoint && !externalOptions,
			onError: (error) => {
				console.error(`Failed to fetch dropdown options for ${endpoint}:`, error)
			}
		}
	)

	// Update local value when prop changes
	useEffect(() => {
		if (value !== localValue) {
			setLocalValue(value);
		}
	}, [value]);

	// NEW: Use cached options or external options
	useEffect(() => {
		if (externalOptions) {
			setOptions(externalOptions);
		} else if (cachedOptions) {
			setOptions(cachedOptions);
		}
	}, [externalOptions, cachedOptions]);

	// NEW: Handle loading state from offline hook
	useEffect(() => {
		setLoading(optionsLoading);
	}, [optionsLoading]);

	// Fetch options from API (DEPRECATED - now using useOfflineData)
	const fetchOptions = useCallback(async () => {
		// This is now handled by useOfflineData hook
		// Keep for backward compatibility but it won't be called
		console.warn('fetchOptions is deprecated, using useOfflineData instead');
	}, []);

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

	// NEW: Handle retry for failed options loading
	const handleRetry = useCallback(() => {
		refetchOptions();
	}, [refetchOptions]);

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

						{/* NEW: Show cache status if options data is from cache */}
						{optionsFromCache && endpoint && (
							<View style={dropdownStyles.cacheIndicator}>
								<Text style={dropdownStyles.cacheText}>
									📱 Opcijas no cache
									{optionsStale && ' (dati var būt novecojuši)'}
								</Text>
							</View>
						)}

						{/* NEW: Show error if options failed to load and no cache */}
						{optionsError && !optionsFromCache && endpoint && (
							<View style={dropdownStyles.errorContainer}>
								<Text style={dropdownStyles.errorIndicatorText}>
									⚠️ Neizdevās ielādēt opcijas
								</Text>
								<TouchableOpacity
									style={dropdownStyles.retryButton}
									onPress={handleRetry}
								>
									<Text style={dropdownStyles.retryButtonText}>Mēģināt vēlreiz</Text>
								</TouchableOpacity>
							</View>
						)}

						{/* NEW: Show offline warning if no cached data available */}
						{!isOnline && !optionsFromCache && endpoint && (
							<View style={dropdownStyles.offlineWarning}>
								<Text style={dropdownStyles.offlineWarningText}>
									🔴 Offline režīmā opcijas nav pieejamas
								</Text>
							</View>
						)}

						<Pressable
							style={[
								dropdownStyles.input, 
								error && dropdownStyles.inputError, 
								disabled && dropdownStyles.inputDisabled,
								// NEW: Show different style when using cached data
								optionsFromCache && dropdownStyles.inputCached
							]}
							onPress={() => !disabled && setIsOpen(true)}
						>
							<Text style={[dropdownStyles.inputText, !displayOption && dropdownStyles.placeholder]}>
								{displayOption ? displayOption.name : (loading ? 'Ielādē...' : placeholder)}
							</Text>

							{/* NEW: Show cache indicator icon */}
							{optionsFromCache && (
								<Ionicons 
									name="phone-portrait-outline" 
									size={16} 
									color={COLORS.warning} 
									style={dropdownStyles.cacheIcon as any}
								/>
							)}
						</Pressable>
						{error && <Text style={dropdownStyles.errorText}>{error}</Text>}

						<Modal visible={isOpen} transparent animationType="slide" onRequestClose={() => setIsOpen(false)}>
							<View style={dropdownStyles.modalContainer}>
								<View style={dropdownStyles.modalContent}>
									{/* NEW: Show cache status in modal header */}
									{optionsFromCache && (
										<View style={dropdownStyles.modalCacheIndicator}>
											<Text style={dropdownStyles.modalCacheText}>
												📱 Rādīti saglabātie dati
												{optionsStale && ' (var būt novecojuši)'}
											</Text>
										</View>
									)}

									{/* NEW: Show loading indicator */}
									{loading ? (
										<View style={dropdownStyles.loadingContainer}>
											<ActivityIndicator size="large" color={COLORS.white} />
											<Text style={dropdownStyles.loadingText}>
												{optionsFromCache ? 'Atjaunina datus...' : 'Ielādē opcijas...'}
											</Text>
										</View>
									) : listOptions.length === 0 ? (
										<View style={dropdownStyles.emptyContainer}>
											<Text style={dropdownStyles.emptyText}>
												{!isOnline && !optionsFromCache 
													? 'Offline režīmā opcijas nav pieejamas'
													: 'Nav pieejamu opciju'
												}
											</Text>
											{/* NEW: Show retry button if there's an error */}
											{optionsError && !optionsFromCache && (
												<TouchableOpacity
													style={dropdownStyles.retryButton}
													onPress={handleRetry}
												>
													<Text style={dropdownStyles.retryButtonText}>Mēģināt ielādēt vēlreiz</Text>
												</TouchableOpacity>
											)}
										</View>
									) : (
										<FlatList
											data={listOptions}
											renderItem={renderOption}
											keyExtractor={(item) => item.id}
											contentContainerStyle={dropdownStyles.optionsContent}
										/>
									)}

									{/* NEW: Add close button */}
									<TouchableOpacity 
										style={dropdownStyles.closeButton}
										onPress={() => setIsOpen(false)}
									>
										<Text style={dropdownStyles.closeButtonText}>Aizvērt</Text>
									</TouchableOpacity>
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

// Styles for the dropdown part (enhanced from FormDropdown)
const dropdownStyles = StyleSheet.create({
	container: { marginBottom: 16 },
	label: { fontFamily: FONT.medium, fontSize: 16, color: COLORS.white, marginBottom: 4 },
	input: {
		height: 48,
		backgroundColor: COLORS.black100,
		borderRadius: 8,
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 12,
	},
	inputText: { 
		fontFamily: FONT.regular, 
		fontSize: 16, 
		color: COLORS.white,
		flex: 1,
	},
	placeholder: { color: COLORS.gray },
	inputError: { borderColor: COLORS.error, borderWidth: 1 },
	errorText: { fontSize: 14, color: COLORS.error, marginTop: 4 },
	option: { padding: 16, borderRadius: 8 },
	optionPressed: { backgroundColor: COLORS.black100 },
	optionText: { fontSize: 16, color: COLORS.white },
	inputDisabled: { opacity: 0.5 },
	modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
	modalContent: { backgroundColor: COLORS.primary, borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '80%' },
	optionsContent: { padding: 8 },
	// NEW: Cache icon
	cacheIcon: {
		marginLeft: 8,
	},
	// NEW: Cached input style
	inputCached: {
		borderWidth: 1,
		borderColor: 'rgba(255, 193, 7, 0.3)',
	},
	// NEW: Cache and error indicator styles
	cacheIndicator: {
		backgroundColor: 'rgba(255, 193, 7, 0.1)',
		borderRadius: 6,
		padding: 8,
		marginBottom: 8,
		borderWidth: 1,
		borderColor: 'rgba(255, 193, 7, 0.3)',
	},
	cacheText: {
		fontSize: 11,
		fontFamily: FONT.medium,
		color: COLORS.warning,
		textAlign: 'center',
	},
	errorContainer: {
		backgroundColor: 'rgba(255, 0, 0, 0.1)',
		borderRadius: 6,
		padding: 8,
		marginBottom: 8,
		borderWidth: 1,
		borderColor: 'rgba(255, 0, 0, 0.3)',
	},
	errorIndicatorText: {
		fontSize: 12,
		fontFamily: FONT.medium,
		color: '#FF6B6B',
		textAlign: 'center',
		marginBottom: 4,
	},
	retryButton: {
		backgroundColor: COLORS.secondary,
		borderRadius: 4,
		paddingVertical: 4,
		paddingHorizontal: 8,
		alignSelf: 'center',
	},
	retryButtonText: {
		fontSize: 11,
		fontFamily: FONT.medium,
		color: COLORS.white,
	},
	offlineWarning: {
		backgroundColor: 'rgba(255, 0, 0, 0.1)',
		borderRadius: 6,
		padding: 8,
		marginBottom: 8,
		borderWidth: 1,
		borderColor: 'rgba(255, 0, 0, 0.3)',
	},
	offlineWarningText: {
		fontSize: 12,
		fontFamily: FONT.medium,
		color: '#FF6B6B',
		textAlign: 'center',
	},
	// NEW: Modal cache indicator
	modalCacheIndicator: {
		backgroundColor: 'rgba(255, 193, 7, 0.1)',
		padding: 12,
		borderBottomWidth: 1,
		borderBottomColor: 'rgba(255, 193, 7, 0.3)',
	},
	modalCacheText: {
		fontSize: 12,
		fontFamily: FONT.medium,
		color: COLORS.warning,
		textAlign: 'center',
	},
	// NEW: Loading container
	loadingContainer: {
		padding: 24,
		alignItems: 'center',
	},
	loadingText: {
		fontSize: 14,
		color: COLORS.gray,
		marginTop: 12,
		fontFamily: FONT.regular,
	},
	// NEW: Empty container
	emptyContainer: {
		padding: 24,
		alignItems: 'center',
	},
	emptyText: {
		fontSize: 16,
		color: COLORS.gray,
		textAlign: 'center',
		marginBottom: 12,
		fontFamily: FONT.regular,
	},
	// NEW: Close button
	closeButton: {
		backgroundColor: COLORS.black100,
		padding: 12,
		alignItems: 'center',
		borderBottomLeftRadius: 16,
		borderBottomRightRadius: 16,
	},
	closeButtonText: {
		color: COLORS.white,
		fontFamily: FONT.medium,
		fontSize: 16,
	},
});

// Styles for the container and add button
const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
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
