import React, { useEffect, useState, useCallback } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import freightAxiosInstance from '@/config/freightAxios';
import { COLORS, FONT } from '@/constants/theme';
import { handleUserActivity, ACTIVITY_LEVELS } from '@/utils/userActivityTracker';

// NEW: Import offline hooks and components
import { useOfflineData } from '@/hooks/useOfflineData'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { CACHE_KEYS } from '@/config/offlineConfig'
import { Ionicons } from '@expo/vector-icons';

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
		cacheKey || 'form_dropdown_default',
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

	// NEW: Handle retry for failed options loading
	const handleRetry = useCallback(() => {
		refetchOptions();
	}, [refetchOptions]);

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

			{/* NEW: Show cache status if options data is from cache */}
			{optionsFromCache && endpoint && (
				<View style={styles.cacheIndicator}>
					<Text style={styles.cacheText}>
						📱 Opcijas no cache
						{optionsStale && ' (dati var būt novecojuši)'}
					</Text>
				</View>
			)}

			{/* NEW: Show error if options failed to load and no cache */}
			{optionsError && !optionsFromCache && endpoint && (
				<View style={styles.errorContainer}>
					<Text style={styles.errorIndicatorText}>
						⚠️ Neizdevās ielādēt opcijas
					</Text>
					<TouchableOpacity
						style={styles.retryButton}
						onPress={handleRetry}
					>
						<Text style={styles.retryButtonText}>Mēģināt vēlreiz</Text>
					</TouchableOpacity>
				</View>
			)}

			{/* NEW: Show offline warning if no cached data available */}
			{!isOnline && !optionsFromCache && endpoint && (
				<View style={styles.offlineWarning}>
					<Text style={styles.offlineWarningText}>
						🔴 Offline režīmā opcijas nav pieejamas
					</Text>
				</View>
			)}

			<Pressable
				style={[
					styles.input, 
					error && styles.inputError, 
					disabled && styles.inputDisabled,
					// NEW: Show different style when using cached data
					optionsFromCache && styles.inputCached
				]}
				onPress={() => !disabled && setIsOpen(true)}
			>
				<Text style={[styles.inputText, !displayOption && styles.placeholder]}>
					{displayOption ? displayOption.name : (loading ? 'Ielādē...' : placeholder)}
				</Text>

				{/* NEW: Show cache indicator icon */}
				{optionsFromCache && (
					<Ionicons 
						name="phone-portrait-outline" 
						size={16} 
						color={COLORS.warning} 
						style={styles.cacheIcon as any}
					/>
				)}
			</Pressable>
			{error && <Text style={styles.errorText}>{error}</Text>}

			<Modal visible={isOpen} transparent animationType="slide" onRequestClose={() => setIsOpen(false)}>
				<View style={styles.modalContainer}>
					<View style={styles.modalContent}>
						{/* NEW: Show cache status in modal header */}
						{optionsFromCache && (
							<View style={styles.modalCacheIndicator}>
								<Text style={styles.modalCacheText}>
									📱 Rādīti saglabātie dati
									{optionsStale && ' (var būt novecojuši)'}
								</Text>
							</View>
						)}

						{/* NEW: Show loading indicator */}
						{loading ? (
							<View style={styles.loadingContainer}>
								<ActivityIndicator size="large" color={COLORS.white} />
								<Text style={styles.loadingText}>
									{optionsFromCache ? 'Atjaunina datus...' : 'Ielādē opcijas...'}
								</Text>
							</View>
						) : listOptions.length === 0 ? (
							<View style={styles.emptyContainer}>
								<Text style={styles.emptyText}>
									{!isOnline && !optionsFromCache 
										? 'Offline režīmā opcijas nav pieejamas'
										: 'Nav pieejamu opciju'
									}
								</Text>
								{/* NEW: Show retry button if there's an error */}
								{optionsError && !optionsFromCache && (
									<TouchableOpacity
										style={styles.retryButton}
										onPress={handleRetry}
									>
										<Text style={styles.retryButtonText}>Mēģināt ielādēt vēlreiz</Text>
									</TouchableOpacity>
								)}
							</View>
						) : (
							<FlatList
								data={listOptions}
								renderItem={renderOption}
								keyExtractor={(item) => item.id}
								contentContainerStyle={styles.optionsContent}
							/>
						)}

						{/* NEW: Add close button */}
						<TouchableOpacity 
							style={styles.closeButton}
							onPress={() => setIsOpen(false)}
						>
							<Text style={styles.closeButtonText}>Aizvērt</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		marginBottom: 16,
	},
	label: { 
		fontFamily: FONT.medium, 
		fontSize: 16, 
		color: COLORS.white, 
		marginBottom: 4 
	},
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
	placeholder: { 
		color: COLORS.gray 
	},
	inputError: { 
		borderColor: COLORS.error, 
		borderWidth: 1 
	},
	errorText: { 
		fontSize: 14, 
		color: COLORS.error, 
		marginTop: 4 
	},
	option: { 
		padding: 16, 
		borderRadius: 8 
	},
	optionPressed: { 
		backgroundColor: COLORS.black100 
	},
	optionText: { 
		fontSize: 16, 
		color: COLORS.white 
	},
	inputDisabled: { 
		opacity: 0.5 
	},
	modalContainer: { 
		flex: 1, 
		justifyContent: 'flex-end', 
		backgroundColor: 'rgba(0,0,0,0.5)' 
	},
	modalContent: { 
		backgroundColor: COLORS.primary, 
		borderTopLeftRadius: 16, 
		borderTopRightRadius: 16, 
		maxHeight: '80%' 
	},
	optionsContent: { 
		padding: 8 
	},
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

export default FormDropdown;
