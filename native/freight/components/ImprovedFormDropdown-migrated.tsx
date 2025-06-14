import React, { useEffect, useReducer, useCallback, useMemo } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Pressable, 
  FlatList, 
  TextInput,
  Modal,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming 
} from 'react-native-reanimated';
import freightAxiosInstance from '@/config/freightAxios';
import { COLORS, FONT } from '@/constants/theme';
import { handleUserActivity, ACTIVITY_LEVELS } from '@/utils/userActivityTracker';

// NEW: Import offline hooks and components
import { useOfflineData } from '@/hooks/useOfflineData'
import { useNetworkStatus } from '../hooks/useNetworkStatus'
import { CACHE_KEYS } from '@/config/offlineConfig'

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
  showAddButton?: boolean;
  onAddPress?: () => void;
  addButtonLabel?: string;
}

// Definēt stāvokļa tipu un sākotnējo stāvokli
interface State {
  isOpen: boolean;
  options: Option[];
  filteredOptions: Option[];
  loading: boolean;
  searchQuery: string;
  tempSelectedOption: Option | null;
}

const initialState: State = {
  isOpen: false,
  options: [],
  filteredOptions: [],
  loading: false,
  searchQuery: '',
  tempSelectedOption: null
};

// Reducer funkcija stāvokļa pārvaldībai
type Action = 
  | { type: 'TOGGLE_DROPDOWN' }
  | { type: 'CLOSE_DROPDOWN' }
  | { type: 'SET_OPTIONS'; payload: Option[]; filterValue?: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SEARCH_QUERY'; payload: string; filterValue?: string }
  | { type: 'SET_TEMP_SELECTED'; payload: Option | null };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'TOGGLE_DROPDOWN':
      return { ...state, isOpen: !state.isOpen, searchQuery: '' };
    case 'CLOSE_DROPDOWN':
      return { ...state, isOpen: false, searchQuery: '' };
    case 'SET_OPTIONS':
      return { 
        ...state, 
        options: action.payload,
        filteredOptions: action.payload.filter(opt => opt.id !== action.filterValue)
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_SEARCH_QUERY':
      return { 
        ...state, 
        searchQuery: action.payload,
        filteredOptions: state.options
          .filter(opt => opt.id !== action.filterValue)
          .filter(opt => 
            opt.name.toLowerCase().includes(action.payload.toLowerCase())
          )
      };
    case 'SET_TEMP_SELECTED':
      return { ...state, tempSelectedOption: action.payload };
    default:
      return state;
  }
}

const ImprovedFormDropdown: React.FC<FormDropdownProps> = React.memo(({
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
  showAddButton = false,
  onAddPress,
  addButtonLabel = '',
}) => {
  // Izmantot useReducer stāvokļa pārvaldībai
  const [state, dispatch] = useReducer(reducer, initialState);
  
  // Animācijas vērtības
  const animatedHeight = useSharedValue(0);
  const rotateIcon = useSharedValue(0);
  
  // Atjaunināt lokālo vērtību, kad mainās props
  const [localValue, setLocalValue] = React.useState(value || '');
  
  // NEW: Use network status hook
  const { isOnline, isOfflineMode } = useNetworkStatus()

  // NEW: Generate cache key based on endpoint
  const cacheKey = useMemo(() => {
    if (!endpoint) return null;
    // Create a unique cache key for each endpoint
    const endpointKey = endpoint.replace(/[^a-zA-Z0-9]/g, '_');
    return `dropdown_${endpointKey}`;
  }, [endpoint]);

  // NEW: Use offline data for dropdown options
  const {
    data: cachedOptions,
    isLoading: optionsLoading,
    isFromCache: optionsFromCache,
    isStale: optionsStale,
    error: optionsError,
    refetch: refetchOptions
  } = useOfflineData(
    cacheKey || 'dropdown_default',
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
  
  useEffect(() => {
    if (value !== localValue) {
      setLocalValue(value);
    }
  }, [value, localValue]);

  // NEW: Use cached options or external options
  useEffect(() => {
    if (externalOptions) {
      dispatch({ 
        type: 'SET_OPTIONS', 
        payload: externalOptions,
        filterValue
      });
    } else if (cachedOptions) {
      dispatch({ 
        type: 'SET_OPTIONS', 
        payload: cachedOptions,
        filterValue
      });
    }
  }, [externalOptions, cachedOptions, filterValue]);

  // NEW: Handle loading state from offline hook
  useEffect(() => {
    dispatch({ type: 'SET_LOADING', payload: optionsLoading });
  }, [optionsLoading]);

  // Ielādēt opcijas no API (DEPRECATED - now using useOfflineData)
  const fetchOptions = useCallback(async () => {
    // This is now handled by useOfflineData hook
    // Keep for backward compatibility but it won't be called
    console.warn('fetchOptions is deprecated, using useOfflineData instead');
  }, []);

  // Atrast izvēlēto opciju
  const selectedOption = useMemo(() => 
    state.options.find(opt => opt.id === localValue),
    [state.options, localValue]
  );

  // Iestatīt pagaidu izvēlēto opciju, ja tā nav atrasta opciju sarakstā
  useEffect(() => {
    if (!localValue) {
      dispatch({ type: 'SET_TEMP_SELECTED', payload: null });
      return;
    }

    if (!selectedOption && objectName) {
      dispatch({ 
        type: 'SET_TEMP_SELECTED', 
        payload: { id: localValue, name: objectName }
      });
    } else if (!selectedOption) {
      dispatch({ 
        type: 'SET_TEMP_SELECTED', 
        payload: { id: localValue, name: `ID: ${localValue}` }
      });
    } else {
      dispatch({ type: 'SET_TEMP_SELECTED', payload: null });
    }
  }, [localValue, selectedOption, objectName]);

  // Apstrādāt opcijas izvēli
  const handleSelect = useCallback((optionId: string) => {
    handleUserActivity(ACTIVITY_LEVELS.HIGH);
    setLocalValue(optionId);
    onSelect(optionId);
    dispatch({ type: 'CLOSE_DROPDOWN' });
  }, [onSelect]);

  // Pārvaldīt dropdown atvēršanu/aizvēršanu
  const toggleDropdown = useCallback(() => {
    if (disabled) return;
    
    dispatch({ type: 'TOGGLE_DROPDOWN' });
  }, [disabled]);

  // Animēt dropdown atvēršanu/aizvēršanu
  useEffect(() => {
    animatedHeight.value = withTiming(
      state.isOpen ? 300 : 0, 
      { duration: 300 }
    );
    
    rotateIcon.value = withTiming(
      state.isOpen ? 1 : 0,
      { duration: 300 }
    );
  }, [state.isOpen, animatedHeight, rotateIcon]);

  // Animācijas stili
  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: animatedHeight.value,
      opacity: animatedHeight.value > 0 ? 1 : 0,
    };
  });

  const iconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ 
        rotate: `${rotateIcon.value * 180}deg` 
      }]
    };
  });

  // Renderēt opciju
  const renderOption = useCallback(({ item }: { item: Option }) => (
    <Pressable
      style={({ pressed }) => [
        styles.option,
        pressed && styles.optionPressed
      ]}
      onPress={() => handleSelect(item.id)}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={item.name}
      accessibilityHint={`Izvēlēties ${item.name}`}
    >
      <Text style={styles.optionText}>{item.name}</Text>
    </Pressable>
  ), [handleSelect]);

  // Attēlojamā opcija (izvēlētā vai pagaidu)
  const displayOption = selectedOption || state.tempSelectedOption;

  // Apstrādāt meklēšanas vaicājuma maiņu
  const handleSearch = useCallback((text: string) => {
    dispatch({ 
      type: 'SET_SEARCH_QUERY', 
      payload: text,
      filterValue
    });
  }, [filterValue]);

  // Aizvērt dropdown, kad tiek nospiests ārpus tā
  const handleOutsidePress = useCallback(() => {
    dispatch({ type: 'CLOSE_DROPDOWN' });
  }, []);

  // NEW: Handle retry for failed options loading
  const handleRetry = useCallback(() => {
    refetchOptions();
  }, [refetchOptions]);

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
          <Text style={styles.errorText}>
            ⚠️ Neizdevās ielādēt opcijas
          </Text>
          <Pressable
            style={styles.retryButton}
            onPress={handleRetry}
          >
            <Text style={styles.retryButtonText}>Mēģināt vēlreiz</Text>
          </Pressable>
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
      
      <View style={styles.inputContainer}>
        <Pressable
          style={[
            styles.input,
            showAddButton && styles.inputWithButton,
            error && styles.inputError,
            disabled && styles.inputDisabled,
            // NEW: Show different style when using cached data
            optionsFromCache && styles.inputCached
          ]}
          onPress={toggleDropdown}
          accessible={true}
          accessibilityLabel={`Izvēlieties ${label}`}
          accessibilityHint="Atver izvēlni ar opcijām"
          accessibilityRole="button"
          accessibilityState={{ disabled }}
        >
          <Text 
            style={[
              styles.inputText,
              !displayOption && styles.placeholder
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {displayOption 
              ? displayOption.name 
              : (state.loading ? 'Ielādē...' : placeholder)}
          </Text>
          
          {/* NEW: Show cache indicator icon */}
          {optionsFromCache && (
            <Ionicons 
              name="phone-portrait-outline" 
              size={16} 
              color={COLORS.warning} 
              style={styles.cacheIcon}
            />
          )}
          
          <Animated.View style={iconStyle}>
            <Ionicons 
              name="chevron-down" 
              size={24} 
              color={COLORS.white} 
            />
          </Animated.View>
        </Pressable>
        
        {showAddButton && onAddPress && (
          <Pressable
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.addButtonPressed,
              disabled && styles.addButtonDisabled
            ]}
            onPress={() => {
              handleUserActivity(ACTIVITY_LEVELS.HIGH);
              onAddPress();
            }}
            disabled={disabled}
            accessible={true}
            accessibilityLabel={addButtonLabel}
            accessibilityRole="button"
            accessibilityHint="Atver formu, lai pievienotu jaunu ierakstu"
            accessibilityState={{ disabled }}
          >
            <Ionicons name="add" size={24} color={COLORS.white} />
            {addButtonLabel && (
              <Text style={styles.addButtonText}>{addButtonLabel}</Text>
            )}
          </Pressable>
        )}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={state.isOpen}
        transparent
        animationType="none"
        onRequestClose={() => dispatch({ type: 'CLOSE_DROPDOWN' })}
      >
        <TouchableWithoutFeedback onPress={handleOutsidePress}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContainer}>
                {/* NEW: Show cache status in modal header */}
                {optionsFromCache && (
                  <View style={styles.modalCacheIndicator}>
                    <Text style={styles.modalCacheText}>
                      📱 Rādīti saglabātie dati
                      {optionsStale && ' (var būt novecojuši)'}
                    </Text>
                  </View>
                )}

                <View style={styles.modalHeader}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Meklēt..."
                    placeholderTextColor={COLORS.gray}
                    value={state.searchQuery}
                    onChangeText={handleSearch}
                    autoFocus
                  />
                </View>
                
                <Animated.View style={[styles.modalContent, animatedStyle]}>
                  {state.loading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="large" color={COLORS.white} />
                      <Text style={styles.loadingText}>
                        {optionsFromCache ? 'Atjaunina datus...' : 'Ielādē opcijas...'}
                      </Text>
                    </View>
                  ) : state.filteredOptions.length === 0 ? (
                    <View style={styles.noResultsContainer}>
                      <Text style={styles.noResultsText}>
                        {state.searchQuery 
                          ? 'Nav atrasts neviens rezultāts' 
                          : 'Nav pieejamu opciju'}
                      </Text>
                      {/* NEW: Show retry button if there's an error */}
                      {optionsError && (
                        <Pressable
                          style={styles.retryButton}
                          onPress={handleRetry}
                        >
                          <Text style={styles.retryButtonText}>Mēģināt ielādēt vēlreiz</Text>
                        </Pressable>
                      )}
                    </View>
                  ) : (
                    <FlatList
                      data={state.filteredOptions}
                      renderItem={renderOption}
                      keyExtractor={(item) => item.id}
                      contentContainerStyle={styles.optionsContent}
                      initialNumToRender={10}
                      maxToRenderPerBatch={20}
                      windowSize={10}
                      removeClippedSubviews={true}
                    />
                  )}
                </Animated.View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
});

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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    height: 48,
    backgroundColor: COLORS.black100,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    flex: 1,
  },
  inputWithButton: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  // NEW: Cached input style
  inputCached: {
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
  },
  addButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
  },
  addButtonPressed: {
    opacity: 0.8,
    backgroundColor: COLORS.secondary200,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    color: COLORS.white,
    fontFamily: FONT.medium,
    fontSize: 16,
    marginLeft: 8,
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
  inputDisabled: { 
    opacity: 0.5 
  },
  // NEW: Cache icon
  cacheIcon: {
    marginRight: 8,
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
  errorText: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
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
  modalHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.black100,
  },
  searchInput: {
    backgroundColor: COLORS.black100,
    borderRadius: 8,
    padding: 12,
    color: COLORS.white,
    fontFamily: FONT.regular,
    fontSize: 16,
  },
  modalContent: {
    overflow: 'hidden',
  },
  optionsContent: { 
    padding: 8
  },
  option: { 
    padding: Platform.OS === 'web' ? 10 : 16,
    borderRadius: 8,
    marginVertical: Platform.OS === 'web' ? 2 : 6,
  },
  optionPressed: { 
    backgroundColor: COLORS.black100 
  },
  optionText: { 
    fontSize: 16, 
    color: COLORS.white,
    fontFamily: FONT.regular,
  },
  // NEW: Enhanced loading and no results containers
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
  noResultsContainer: {
    padding: 24,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: FONT.regular,
  }
});

export default ImprovedFormDropdown;
