import {WEB_BORDER_RADIUS, WEB_COMPONENT_SIZES, WEB_SIZES, WEB_SPACING} from '@/constants/webStyles'
import React, {useEffect, useState} from 'react'
import {FlatList, Modal, Platform, Pressable, StyleSheet, Text, View} from 'react-native'
import freightAxiosInstance from '../config/freightAxios'
import {COLORS, FONT} from '../constants/theme'

interface FormDropdownProps {
  label: string;
  value: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  error?: string;
  endpoint: string;
  filterValue?: string;
  disabled?: boolean;
}

interface Option {
  id: string;
  name: string;
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
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastEndpoint, setLastEndpoint] = useState(endpoint);


  const fetchOptions = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await freightAxiosInstance.get(endpoint);
      console.log('API response:', response.data);

      // Pārveidojam datus vajadzīgajā formātā
      const formattedOptions = Array.isArray(response.data)
        ? response.data.map(item => {
            const itemObj = item as Record<string, any>;
            // Special handling for trucks to use numeric ID
            if (endpoint.includes('trucks')) {
              return {
                id: String(itemObj.id),
                name: String(itemObj.registrationNumber)
              };
            }
            // Default handling for other types
            return {
              id: String(
                itemObj.id ||
                itemObj._id ||
                itemObj.value ||
                itemObj
              ),
              name: String(
                itemObj.name ||
                itemObj.title ||
                itemObj.label ||
                itemObj
              )
            };
          })
        : Object.entries(response.data as Record<string, any>).map(([key, value]) => ({
            id: key,
            name: typeof value === 'object' && value !== null
              ? String(value.name || value.title || value.label || key)
              : String(value)
          }));

      console.log('Formatted options:', formattedOptions);
      setOptions(formattedOptions);
    } catch (err) {
      console.error('Failed to fetch options:', err);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    // Fetch if we have an endpoint and either:
    // 1. Options are empty, or
    // 2. Endpoint has changed
    if (endpoint && (options.length === 0 || endpoint !== lastEndpoint)) {
      fetchOptions();
      setLastEndpoint(endpoint);
    }
  }, [endpoint, options.length, lastEndpoint, fetchOptions]);

  const filteredOptions = filterValue 
    ? options.filter(opt => opt.id !== filterValue)
    : options;

  const selectedOption = filteredOptions.find(opt => opt.id === value);

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <select
          value={value}
          onChange={(e) => onSelect(e.target.value)}
          style={{
            ...styles.webSelect,
            ...(error && styles.inputError),
            ...(disabled ? styles.inputDisabled : {})
          }}
          disabled={loading || disabled}
        >
          <option value="" disabled>
            {loading ? 'Ielādē...' : placeholder}
          </option>
          {filteredOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  }

  const renderOption = ({ item }: { item: Option }) => (
    <Pressable
      style={({ pressed }) => [
        styles.option,
        pressed && styles.optionPressed
      ]}
      onPress={() => {
        onSelect(item.id);
        setIsOpen(false);
      }}
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
        <Text style={[styles.inputText, !selectedOption && styles.placeholder]}>
          {selectedOption ? selectedOption.name : (loading ? 'Ielādē...' : placeholder)}
        </Text>
      </Pressable>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <Pressable
                onPress={() => setIsOpen(false)}
                style={({ pressed }) => [
                  styles.closeButton,
                  pressed && styles.closeButtonPressed
                ]}
              >
                <Text style={styles.closeButtonText}>Aizvērt</Text>
              </Pressable>
            </View>
            <FlatList
              data={filteredOptions}
              renderItem={renderOption}
              keyExtractor={(item) => item.id}
              style={styles.optionsList}
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
    marginBottom: 16,
    marginTop: 28,
  },
  label: {
    fontFamily: FONT.medium,
    fontSize: Platform.select({ web: WEB_SIZES.medium, default: 16 }),
    color: COLORS.white,
	  marginBottom: 4,
  },
  input: {
    height: Platform.select({ web: WEB_COMPONENT_SIZES.input, default: 48 }),
    backgroundColor: COLORS.black100,
    borderRadius: Platform.select({ web: WEB_BORDER_RADIUS.l, default: 8 }),
    paddingRight: Platform.select({ web: WEB_SPACING.m, default: 16 }),
    justifyContent: 'center',
  },
  inputText: {
    fontFamily: FONT.regular,
    fontSize: Platform.select({ web: WEB_SIZES.medium, default: 16 }),
    color: COLORS.white,
    paddingLeft: Platform.select({ web: WEB_SPACING.s, default: 12 }),
  },
  placeholder: {
    color: COLORS.gray,
  },
  inputError: {
    borderColor: COLORS.error,
    borderWidth: 1,
  },
  errorText: {
    fontFamily: FONT.regular,
    fontSize: 14,
    color: COLORS.error,
    marginTop: 4,
  },
  webSelect: Platform.select({
    web: {
      width: '100%',
      height: WEB_COMPONENT_SIZES.input,
      backgroundColor: COLORS.black100,
      borderRadius: WEB_BORDER_RADIUS.l,
      paddingLeft: WEB_SPACING.s,
      paddingHorizontal: WEB_SPACING.m,
      color: COLORS.white,
      border: '1px solid transparent',
      fontFamily: FONT.regular,
      fontSize: WEB_SIZES.medium,
      outline: 'none',
      cursor: 'pointer',
      textAlign: 'left',
    },
  }) as any,
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: Platform.select({ web: WEB_BORDER_RADIUS.xxl, default: 16 }),
    borderTopRightRadius: Platform.select({ web: WEB_BORDER_RADIUS.xxl, default: 16 }),
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Platform.select({ web: WEB_SPACING.m, default: 16 }),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.black100,
  },
  modalTitle: {
    fontFamily: FONT.medium,
    fontSize: Platform.select({ web: WEB_SIZES.large, default: 18 }),
    color: COLORS.white,
  },
  closeButton: {
    padding: Platform.select({ web: WEB_SPACING.xs, default: 8 }),
  },
  closeButtonPressed: {
    opacity: 0.7,
  },
  closeButtonText: {
    color: COLORS.white,
    fontSize: Platform.select({ web: WEB_SIZES.medium, default: 16 }),
  },
  optionsList: {
    maxHeight: '70%',
  },
  optionsContent: {
    padding: Platform.select({ web: WEB_SPACING.xs, default: 8 }),
  },
  option: {
    padding: Platform.select({ web: WEB_SPACING.m, default: 16 }),
    borderRadius: Platform.select({ web: WEB_BORDER_RADIUS.l, default: 8 }),
  },
  optionPressed: {
    backgroundColor: COLORS.black100,
  },
  optionText: {
    fontSize: Platform.select({ web: WEB_SIZES.medium, default: 16 }),
    color: COLORS.white,
  },
  inputDisabled: {
    opacity: 0.5,
  },
});

export default FormDropdown;
