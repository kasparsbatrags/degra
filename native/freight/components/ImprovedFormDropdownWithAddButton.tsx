import React, { useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Pressable, 
  Text 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ImprovedFormDropdown from './ImprovedFormDropdown';
import { COLORS, FONT } from '@/constants/theme';
import { handleUserActivity, ACTIVITY_LEVELS } from '@/utils/userActivityTracker';

interface Option {
  id: string;
  name: string;
}

interface ImprovedFormDropdownWithAddButtonProps {
  label: string;
  value: string;
  onSelect: (value: string) => void;
  onAddPress: () => void;
  placeholder?: string;
  error?: string;
  endpoint?: string;
  filterValue?: string;
  disabled?: boolean;
  forceRefresh?: number;
  objectName?: string;
  externalOptions?: Option[];
  addButtonLabel?: string;
}

const ImprovedFormDropdownWithAddButton: React.FC<ImprovedFormDropdownWithAddButtonProps> = React.memo(({
  label,
  value,
  onSelect,
  onAddPress,
  placeholder,
  error,
  endpoint,
  filterValue,
  disabled,
  forceRefresh,
  objectName,
  externalOptions,
  addButtonLabel = 'Pievienot jaunu',
}) => {
  // Apstrādāt pogas nospiešanu
  const handleAddButtonPress = useCallback(() => {
    handleUserActivity(ACTIVITY_LEVELS.HIGH);
    onAddPress();
  }, [onAddPress]);

  return (
    <View style={styles.container}>
      <View style={styles.dropdownContainer}>
        <ImprovedFormDropdown
          label={label}
          value={value}
          onSelect={onSelect}
          placeholder={placeholder}
          error={error}
          endpoint={endpoint}
          filterValue={filterValue}
          disabled={disabled}
          forceRefresh={forceRefresh}
          objectName={objectName}
          externalOptions={externalOptions}
        />
      </View>
      
      <Pressable
        style={({ pressed }) => [
          styles.addButton,
          pressed && styles.addButtonPressed,
          disabled && styles.addButtonDisabled
        ]}
        onPress={handleAddButtonPress}
        disabled={disabled}
        accessible={true}
        accessibilityLabel={addButtonLabel}
        accessibilityRole="button"
        accessibilityHint="Atver formu, lai pievienotu jaunu ierakstu"
        accessibilityState={{ disabled }}
      >
        <Ionicons name="add" size={24} color={COLORS.white} />
        <Text style={styles.addButtonText}>{addButtonLabel}</Text>
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  dropdownContainer: {
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
});

export default ImprovedFormDropdownWithAddButton;
