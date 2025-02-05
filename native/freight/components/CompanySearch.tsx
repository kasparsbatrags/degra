import React, {useEffect, useState} from 'react'
import {ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TextStyle, TouchableOpacity, View, ViewStyle,} from 'react-native'
import {COLORS, FONT} from '../constants/theme'
import {CompanySuggestion, searchCompanies} from '../lib/api'

interface CompanySearchProps {
  onSelect: (registrationNumber: string) => void;
  value?: string;
  label?: string;
}

export default function CompanySearch({ onSelect, value, label }: CompanySearchProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<CompanySuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const searchTimer = setTimeout(async () => {
      if (query.length >= 2) {
        setLoading(true);
        try {
          const results = await searchCompanies(query);
          setSuggestions(results);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Kļūda meklējot uzņēmumus:', error);
          setSuggestions([]);
        } finally {
          setLoading(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(searchTimer);
  }, [query]);

  const handleSelect = (suggestion: CompanySuggestion) => {
    onSelect(suggestion.registrationNumber);
    setQuery(suggestion.name);
    setShowSuggestions(false);
  };

  return (
    <View style={[styles.container, { marginBottom: 16 }]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="Sāciet rakstīt..."
          onFocus={() => setShowSuggestions(true)}
        />
        {loading && <ActivityIndicator style={styles.loader} color={COLORS.primary} />}
      </View>

      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.registrationNumber}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => handleSelect(item)}
              >
                <Text style={styles.registrationNumber}>{item.registrationNumber}</Text>
                <Text style={styles.companyName}>{item.name}</Text>
              </TouchableOpacity>
            )}
            style={styles.suggestionsList}
          />
        </View>
      )}
    </View>
  );
}

type Styles = {
  container: ViewStyle;
  inputContainer: ViewStyle;
  input: TextStyle;
  label: TextStyle;
  loader: ViewStyle;
  suggestionsContainer: ViewStyle;
  suggestionsList: ViewStyle;
  suggestionItem: ViewStyle;
  registrationNumber: TextStyle;
  companyName: TextStyle;
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
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  input: {
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: FONT.regular,
    color: COLORS.black,
  },
  loader: {
    marginRight: 16,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gray,
    marginTop: 4,
    maxHeight: 200,
    zIndex: 2,
  },
  suggestionsList: {
    flex: 1,
  },
  suggestionItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
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
});
