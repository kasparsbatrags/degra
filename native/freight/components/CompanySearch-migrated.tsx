import {BORDER_RADIUS, COLORS, FONT, SHADOWS, SPACING} from '@/constants/theme'
import {useDebounce} from '@/hooks/useDebounce'
import {CompanySuggestion, searchCompanies} from '@/lib/api'
import {Ionicons} from '@expo/vector-icons'
import React, {useCallback, useEffect, useRef, useState} from 'react'
import {
	ActivityIndicator,
	FlatList,
	Keyboard,
	StyleSheet,
	Text,
	TextInput,
	TextStyle,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View,
	ViewStyle,
} from 'react-native'

// NEW: Import offline hooks and components
import { useOfflineData } from '@/hooks/useOfflineData'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { CACHE_KEYS } from '@/config/offlineConfig'

interface CompanySearchProps {
  onSelect: (registrationNumber: string, name?: string) => void;
  value?: string;
  label?: string;
  placeholder?: string;
  errorMessage?: string;
  disabled?: boolean;
}

export default function CompanySearch({
  onSelect,
  value = '',
  label,
  placeholder = "Sāciet rakstīt...",
  errorMessage,
  disabled = false
}: CompanySearchProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<CompanySuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isCompanySelected, setIsCompanySelected] = useState(false);

  const inputRef = useRef<TextInput>(null);
  const listRef = useRef<FlatList>(null);

  const debouncedQuery = useDebounce(query, 300);

  // NEW: Use network status hook
  const { isOnline, isOfflineMode } = useNetworkStatus()

  // NEW: Generate cache key for search results
  const searchCacheKey = debouncedQuery.length >= 2 ? `${CACHE_KEYS.OBJECTS}_search_${debouncedQuery.toLowerCase()}` : null;

  // NEW: Use offline data for search results caching
  const {
    data: cachedSearchResults,
    isLoading: searchLoading,
    isFromCache: searchFromCache,
    isStale: searchStale,
    error: searchError,
    refetch: refetchSearch
  } = useOfflineData(
    searchCacheKey || 'company_search_default',
    async () => {
      if (debouncedQuery.length < 2) return [];
      return await searchCompanies(debouncedQuery);
    },
    {
      strategy: 'stale-while-revalidate',
      enabled: !isCompanySelected && debouncedQuery.length >= 2,
      onError: (error) => {
        console.error('Failed to search companies:', error)
        setError('Neizdevās ielādēt uzņēmumus. Lūdzu, mēģiniet vēlreiz.');
      }
    }
  )

  // NEW: Handle search results from offline hook
  useEffect(() => {
    if (cachedSearchResults) {
      setSuggestions(cachedSearchResults);
      setShowSuggestions(cachedSearchResults.length > 0);
      setSelectedIndex(-1);
      setError(null);
    } else if (searchError && !searchFromCache) {
      setSuggestions([]);
      setShowSuggestions(false);
      setError('Neizdevās ielādēt uzņēmumus. Lūdzu, mēģiniet vēlreiz.');
    }
  }, [cachedSearchResults, searchError, searchFromCache]);

  // NEW: Handle loading state from offline hook
  useEffect(() => {
    setLoading(searchLoading);
  }, [searchLoading]);

  // Effect for searching with debounce (DEPRECATED - now using useOfflineData)
  useEffect(() => {
    // This is now handled by useOfflineData hook
    // Keep for backward compatibility but it won't be called
    if (!cachedSearchResults && !searchLoading && debouncedQuery.length >= 2 && !isCompanySelected) {
      console.warn('Fallback search - useOfflineData should handle this');
    }
  }, [debouncedQuery, isCompanySelected, cachedSearchResults, searchLoading]);

  // Log selection state changes for debugging
  useEffect(() => {
    console.log('CompanySearch selection state changed:', {
      isCompanySelected,
      query,
      value,
      isOnline,
      searchFromCache
    });
  }, [isCompanySelected, query, value, isOnline, searchFromCache]);

  // Sync external value with internal state
  useEffect(() => {
    if (value !== query && value !== undefined) {
      setQuery(value);
      // If value is empty, reset the selected state
      if (value === '') {
        setIsCompanySelected(false);
      }
    }
  }, [value]);

  const handleSelect = useCallback((suggestion: CompanySuggestion) => {
    // Make sure the registration number is a string, not undefined
    const regNumber = suggestion.registerNumber || '';

    // Call the onSelect callback with the registration number and name
    onSelect(regNumber, suggestion.name);

    // Update the internal state
    setQuery(suggestion.name);
    setShowSuggestions(false);
    setIsCompanySelected(true); // Mark that a company has been selected

    // Log the selection for debugging
    console.log('Company selected in CompanySearch:', {
      registerNumber: regNumber,
      name: suggestion.name,
      fromCache: searchFromCache
    });

    Keyboard.dismiss();
  }, [onSelect, searchFromCache]);

  const handleClear = useCallback(() => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    setError(null);
    setIsCompanySelected(false); // Reset selected state when clearing
    inputRef.current?.focus();
  }, []);

  // NEW: Handle retry for failed search
  const handleRetry = useCallback(() => {
    setError(null);
    refetchSearch();
  }, [refetchSearch]);

  const handleKeyPress = useCallback((e: any) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.nativeEvent.key === 'ArrowDown') {
      setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
      if (selectedIndex >= 0) {
        listRef.current?.scrollToIndex({ index: selectedIndex, animated: true });
      }
    } else if (e.nativeEvent.key === 'ArrowUp') {
      setSelectedIndex(prev => Math.max(prev - 1, -1));
      if (selectedIndex > 0) {
        listRef.current?.scrollToIndex({ index: selectedIndex, animated: true });
      }
    } else if (e.nativeEvent.key === 'Enter' && selectedIndex >= 0) {
      handleSelect(suggestions[selectedIndex]);
    }
  }, [showSuggestions, suggestions, selectedIndex, handleSelect]);

  const renderSuggestionItem = useCallback(({ item, index }: { item: CompanySuggestion, index: number }) => (
    <TouchableOpacity
      style={[
        styles.suggestionItem,
        selectedIndex === index && styles.selectedSuggestion
      ]}
      onPress={() => handleSelect(item)}
      accessibilityLabel={`${item.name}, reģistrācijas numurs ${item.registerNumber}`}
      accessibilityRole="button"
    >
      <Text style={styles.registrationNumber}>{item.registerNumber}</Text>
      <Text style={styles.companyName}>{item.name}</Text>
    </TouchableOpacity>
  ), [handleSelect, selectedIndex]);

  return (
    <View style={[styles.container, { marginBottom: SPACING.s, marginTop: SPACING.m }]}>
      {label && <Text style={styles.label}>{label}</Text>}

      {/* NEW: Show cache status if search results are from cache */}
      {searchFromCache && debouncedQuery.length >= 2 && (
        <View style={styles.cacheIndicator}>
          <Text style={styles.cacheText}>
            📱 Meklēšanas rezultāti no cache
            {searchStale && ' (dati var būt novecojuši)'}
          </Text>
        </View>
      )}

      {/* NEW: Show offline warning if no network and no cached results */}
      {!isOnline && !searchFromCache && debouncedQuery.length >= 2 && (
        <View style={styles.offlineWarning}>
          <Text style={styles.offlineWarningText}>
            🔴 Offline režīmā meklēšana nav pieejama
          </Text>
        </View>
      )}

      <View style={[
        styles.inputContainer,
        (error || errorMessage) && styles.inputError,
        disabled && styles.inputDisabled,
        // NEW: Show different style when using cached data
        searchFromCache && styles.inputCached
      ]}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            // If user starts typing, reset the selected state
            if (isCompanySelected) {
              setIsCompanySelected(false);
            }
          }}
          placeholder={isOnline ? placeholder : `${placeholder} (Offline)`}
          placeholderTextColor={COLORS.gray}
          onFocus={() => setShowSuggestions(query.length >= 2)}
          onKeyPress={handleKeyPress}
          editable={!disabled}
          accessibilityLabel={label || "Uzņēmuma meklēšana"}
          accessibilityHint="Ievadiet vismaz divus simbolus, lai meklētu uzņēmumus"
          accessibilityRole="search"
        />

        {/* NEW: Show cache indicator icon */}
        {searchFromCache && (
          <Ionicons 
            name="phone-portrait-outline" 
            size={16} 
            color={COLORS.warning} 
            style={styles.cacheIcon as any}
          />
        )}

        {loading ? (
          <ActivityIndicator style={styles.loader} color={COLORS.primary} />
        ) : query.length > 0 ? (
          <TouchableOpacity
            onPress={handleClear}
            style={styles.clearButton}
            accessibilityLabel="Notīrīt meklēšanas lauku"
            accessibilityRole="button"
          >
            <Ionicons name="close-circle" size={20} color={COLORS.gray} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* NEW: Enhanced error display with retry option */}
      {typeof (error || errorMessage) === 'string' && (error || errorMessage)?.trim() !== '' && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {(error || errorMessage)?.trim()}
          </Text>
          {searchError && !searchFromCache && (
            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleRetry}
            >
              <Text style={styles.retryButtonText}>Mēģināt vēlreiz</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {showSuggestions && (
        <TouchableWithoutFeedback onPress={() => setShowSuggestions(false)}>
          <View style={styles.backdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.suggestionsContainer}>
                {/* NEW: Show cache status in suggestions header */}
                {searchFromCache && (
                  <View style={styles.suggestionsCacheIndicator}>
                    <Text style={styles.suggestionsCacheText}>
                      📱 Rādīti saglabātie rezultāti
                      {searchStale && ' (var būt novecojuši)'}
                    </Text>
                  </View>
                )}

                {suggestions.length > 0 ? (
                  <View style={styles.suggestionsList}>
                    {suggestions.map((item, index) => (
                      <TouchableOpacity
                        key={item.registerNumber}
                        style={[
                          styles.suggestionItem,
                          selectedIndex === index && styles.selectedSuggestion
                        ]}
                        onPress={() => handleSelect(item)}
                        accessibilityLabel={`${item.name}, reģistrācijas numurs ${item.registerNumber}`}
                        accessibilityRole="button"
                      >
                        <Text style={styles.registrationNumber}>{item.registerNumber}</Text>
                        <Text style={styles.companyName}>{item.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>
                      {!isOnline && !searchFromCache 
                        ? 'Meklēšana nav pieejama offline režīmā'
                        : 'Nav atrasti uzņēmumi, kas atbilst meklēšanas kritērijiem'
                      }
                    </Text>
                    {/* NEW: Show retry button in empty state if there's an error */}
                    {searchError && !searchFromCache && (
                      <TouchableOpacity
                        style={styles.retryButton}
                        onPress={handleRetry}
                      >
                        <Text style={styles.retryButtonText}>Mēģināt meklēt vēlreiz</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      )}
    </View>
  );
}

type Styles = {
  container: ViewStyle;
  inputContainer: ViewStyle;
  inputError: ViewStyle;
  inputDisabled: ViewStyle;
  input: TextStyle;
  label: TextStyle;
  loader: ViewStyle;
  clearButton: ViewStyle;
  errorText: TextStyle;
  backdrop: ViewStyle;
  suggestionsContainer: ViewStyle;
  suggestionsList: ViewStyle;
  suggestionItem: ViewStyle;
  selectedSuggestion: ViewStyle;
  registrationNumber: TextStyle;
  companyName: TextStyle;
  emptyState: ViewStyle;
  emptyStateText: TextStyle;
  // NEW: Offline-related styles
  inputCached: ViewStyle;
  cacheIcon: ViewStyle;
  cacheIndicator: ViewStyle;
  cacheText: TextStyle;
  offlineWarning: ViewStyle;
  offlineWarningText: TextStyle;
  errorContainer: ViewStyle;
  retryButton: ViewStyle;
  retryButtonText: TextStyle;
  suggestionsCacheIndicator: ViewStyle;
  suggestionsCacheText: TextStyle;
};

const styles = StyleSheet.create<Styles>({
  container: {
    position: 'relative',
    zIndex: 1,
  },
  label: {
    fontSize: 16,
    fontFamily: FONT.medium,
    color: COLORS.white,
    marginBottom: SPACING.s,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.s,
    borderWidth: 1,
    borderColor: COLORS.gray,
    paddingRight: SPACING.s,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  inputDisabled: {
    backgroundColor: '#f0f0f0',
    opacity: 0.7,
  },
  // NEW: Cached input style
  inputCached: {
    borderColor: 'rgba(255, 193, 7, 0.5)',
    borderWidth: 2,
  },
  input: {
    flex: 1,
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    fontSize: 16,
    fontFamily: FONT.regular,
    color: COLORS.black,
  },
  loader: {
    marginRight: SPACING.s,
  },
  clearButton: {
    padding: SPACING.xs,
  },
  // NEW: Cache icon
  cacheIcon: {
    marginRight: SPACING.s,
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
  errorContainer: {
    marginTop: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    fontFamily: FONT.regular,
    marginBottom: 4,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    fontSize: 11,
    fontFamily: FONT.medium,
    color: COLORS.white,
  },
  backdrop: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    bottom: -500, // Large enough to cover the screen
    zIndex: 1,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: SPACING.xs,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.s,
    borderWidth: 1,
    borderColor: COLORS.gray,
    maxHeight: 200,
    zIndex: 2,
    ...SHADOWS.small,
  },
  // NEW: Suggestions cache indicator
  suggestionsCacheIndicator: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 193, 7, 0.3)',
  },
  suggestionsCacheText: {
    fontSize: 10,
    fontFamily: FONT.medium,
    color: COLORS.warning,
    textAlign: 'center',
  },
  suggestionsList: {
    flex: 1,
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: 'row',
    padding: SPACING.m,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
  },
  selectedSuggestion: {
    backgroundColor: '#f0f0f0',
  },
  registrationNumber: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONT.medium,
    color: COLORS.black,
  },
  companyName: {
    flex: 2,
    fontSize: 14,
    fontFamily: FONT.regular,
    color: COLORS.black,
  },
  emptyState: {
    padding: SPACING.m,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: FONT.regular,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 8,
  },
});
