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
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      setLoading(true);
      const response = await freightAxiosInstance.get(endpoint);
      console.log('API response:', response.data);

      // Pārveidojam datus vajadzīgajā formātā
      const formattedOptions = Array.isArray(response.data)
        ? response.data.map(item => {
            const itemObj = item as Record<string, any>;
            return {
              id: String(
                itemObj.id ||
                itemObj._id ||
                itemObj.value ||
				itemObj.registrationNumber ||
                itemObj
              ),
              name: String(
                itemObj.name ||
                itemObj.title ||
                itemObj.label ||
				itemObj.registrationNumber ||
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
  };

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
          style={styles.webSelect}
          disabled={loading}
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
        style={[styles.input, error && styles.inputError]}
        onPress={() => setIsOpen(true)}
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
    fontSize: 16,
    color: COLORS.white,
    marginBottom: 8,
  },
  input: {
    height: 48,
    backgroundColor: COLORS.black100,
    borderRadius: 8,
    paddingRight: 16,
    justifyContent: 'center',
  },
  inputText: {
    fontFamily: FONT.regular,
    fontSize: 16,
    color: COLORS.white,
    paddingLeft: 12,
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
      height: 48,
      backgroundColor: COLORS.black100,
      borderRadius: 8,
      paddingLeft: 12,
      paddingHorizontal: 16,
      color: COLORS.white,
      border: 'none',
      fontFamily: FONT.regular,
      fontSize: 16,
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
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.black100,
  },
  modalTitle: {
    fontFamily: FONT.medium,
    fontSize: 18,
    color: COLORS.white,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonPressed: {
    opacity: 0.7,
  },
  closeButtonText: {
    color: COLORS.white,
    fontSize: 16,
  },
  optionsList: {
    maxHeight: '70%',
  },
  optionsContent: {
    padding: 8,
  },
  option: {
    padding: 16,
    borderRadius: 8,
  },
  optionPressed: {
    backgroundColor: COLORS.black100,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.white,
  },
});

export default FormDropdown;
