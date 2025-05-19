import React, { useState } from 'react';
import { View, StyleSheet, Text, Alert } from 'react-native';
import ImprovedFormDropdown from './ImprovedFormDropdown';
import ImprovedFormDropdownWithAddButton from './ImprovedFormDropdownWithAddButton';
import { COLORS, FONT } from '@/constants/theme';

// Piemēra opcijas
const sampleOptions = [
  { id: '1', name: 'Opcija 1' },
  { id: '2', name: 'Opcija 2' },
  { id: '3', name: 'Opcija 3' },
  { id: '4', name: 'Opcija 4' },
  { id: '5', name: 'Opcija 5' },
];

const FormDropdownExample: React.FC = () => {
  // Stāvokļi dropdown vērtībām
  const [simpleDropdownValue, setSimpleDropdownValue] = useState('');
  const [dropdownWithButtonValue, setDropdownWithButtonValue] = useState('');
  
  // Apstrādāt "Pievienot jaunu" pogas nospiešanu
  const handleAddNew = () => {
    Alert.alert(
      'Pievienot jaunu',
      'Šeit varētu atvērt formu, lai pievienotu jaunu ierakstu',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>FormDropdown Piemēri</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vienkāršs Dropdown</Text>
        <ImprovedFormDropdown
          label="Izvēlieties opciju"
          value={simpleDropdownValue}
          onSelect={setSimpleDropdownValue}
          externalOptions={sampleOptions}
          placeholder="Izvēlieties no saraksta"
        />
        <Text style={styles.selectedValue}>
          Izvēlētā vērtība: {simpleDropdownValue || 'Nav izvēlēta'}
        </Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dropdown ar "Pievienot" pogu</Text>
        <ImprovedFormDropdownWithAddButton
          label="Izvēlieties opciju"
          value={dropdownWithButtonValue}
          onSelect={setDropdownWithButtonValue}
          onAddPress={handleAddNew}
          externalOptions={sampleOptions}
          placeholder="Izvēlieties vai pievienojiet jaunu"
          addButtonLabel="Pievienot jaunu opciju"
        />
        <Text style={styles.selectedValue}>
          Izvēlētā vērtība: {dropdownWithButtonValue || 'Nav izvēlēta'}
        </Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dropdown ar kļūdas ziņojumu</Text>
        <ImprovedFormDropdown
          label="Izvēlieties opciju"
          value=""
          onSelect={() => {}}
          externalOptions={sampleOptions}
          placeholder="Izvēlieties no saraksta"
          error="Šis lauks ir obligāts"
        />
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Atspējots Dropdown</Text>
        <ImprovedFormDropdown
          label="Atspējots dropdown"
          value=""
          onSelect={() => {}}
          externalOptions={sampleOptions}
          placeholder="Šis dropdown ir atspējots"
          disabled={true}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.primary,
  },
  title: {
    fontSize: 24,
    fontFamily: FONT.bold,
    color: COLORS.white,
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONT.semiBold,
    color: COLORS.white,
    marginBottom: 12,
  },
  selectedValue: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: FONT.regular,
    color: COLORS.gray,
  },
});

export default FormDropdownExample;
