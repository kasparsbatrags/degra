import {Ionicons} from '@expo/vector-icons'
import React, {useCallback, useEffect, useRef, useState} from 'react'
import {
	ActivityIndicator,
	FlatList,
	Keyboard,
	Platform,
	StyleSheet,
	Text,
	TextInput,
	TextStyle,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View,
	ViewStyle,
} from 'react-native'
import {BORDER_RADIUS, COLORS, FONT, SHADOWS, SPACING} from '../constants/theme'
import {useDebounce} from '../hooks/useDebounce'
import {CompanySuggestion, searchCompanies} from '../lib/api'

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
  
  const inputRef = useRef<TextInput>(null);
  const listRef = useRef<FlatList>(null);
  
  const debouncedQuery = useDebounce(query, 300);

  // Effect for searching with debounce
  useEffect(() => {
    const searchCompaniesAsync = async () => {
      if (debouncedQuery.length >= 2) {
        setLoading(true);
        setError(null);
        
        try {
          const results = await searchCompanies(debouncedQuery);
          setSuggestions(results);
          setShowSuggestions(results.length > 0);
          setSelectedIndex(-1);
        } catch (error: any) {
          console.error('Kļūda meklējot uzņēmumus:', error);
          setError('Neizdevās ielādēt uzņēmumus. Lūdzu, mēģiniet vēlreiz.');
          setSuggestions([]);
        } finally {
          setLoading(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
        setError(null);
      }
    };

    searchCompaniesAsync();
  }, [debouncedQuery]);

  // Sync external value with internal state
  useEffect(() => {
    if (value !== query && value !== undefined) {
      setQuery(value);
    }
  }, [value]);

  const handleSelect = useCallback((suggestion: CompanySuggestion) => {
    onSelect(suggestion.registrationNumber, suggestion.name);
    setQuery(suggestion.name);
    setShowSuggestions(false);
    Keyboard.dismiss();
  }, [onSelect]);

  const handleClear = useCallback(() => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    setError(null);
    inputRef.current?.focus();
  }, []);

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
      accessibilityLabel={`${item.name}, reģistrācijas numurs ${item.registrationNumber}`}
      accessibilityRole="button"
    >
      <Text style={styles.registrationNumber}>{item.registrationNumber}</Text>
      <Text style={styles.companyName}>{item.name}</Text>
    </TouchableOpacity>
  ), [handleSelect, selectedIndex]);

  return (
    <View style={[styles.container, { marginBottom: SPACING.m }]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={[
        styles.inputContainer,
        error && styles.inputError,
        disabled && styles.inputDisabled
      ]}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder={placeholder}
          placeholderTextColor={COLORS.gray}
          onFocus={() => setShowSuggestions(query.length >= 2)}
          onKeyPress={handleKeyPress}
          editable={!disabled}
          accessibilityLabel={label || "Uzņēmuma meklēšana"}
          accessibilityHint="Ievadiet vismaz divus simbolus, lai meklētu uzņēmumus"
          accessibilityRole="search"
        />
        
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

      {(error || errorMessage) && (
        <Text style={styles.errorText}>{error || errorMessage}</Text>
      )}

      {showSuggestions && (
        <TouchableWithoutFeedback onPress={() => setShowSuggestions(false)}>
          <View style={styles.backdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.suggestionsContainer}>
                {suggestions.length > 0 ? (
                  <FlatList
                    ref={listRef}
                    data={suggestions}
                    keyExtractor={(item) => item.registrationNumber}
                    renderItem={renderSuggestionItem}
                    style={styles.suggestionsList}
                    keyboardShouldPersistTaps="handled"
                    windowSize={5}
                    removeClippedSubviews={Platform.OS !== 'web'}
                    maxToRenderPerBatch={10}
                    initialNumToRender={10}
                    accessibilityRole="list"
                    accessibilityLabel="Uzņēmumu ieteikumu saraksts"
                  />
                ) : (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>
                      Nav atrasti uzņēmumi, kas atbilst meklēšanas kritērijiem
                    </Text>
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
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    fontFamily: FONT.regular,
    marginTop: SPACING.xs,
    marginLeft: SPACING.xs,
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
  suggestionsList: {
    flex: 1,
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
  },
});
