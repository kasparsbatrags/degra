import React, {useState} from 'react'
import {Platform, ScrollView, StyleSheet, Switch, Text, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import Button from '../../components/Button'
import FormDropdown from '../../components/FormDropdown'
import FormInput from '../../components/FormInput'
import {COLORS, CONTAINER_WIDTH, FONT} from '../../constants/theme'

export default function TruckRouteScreen() {
  const [hasCargo, setHasCargo] = useState(false);
  const [form, setForm] = useState({
    origin: '',
    destination: '',
    cargoType: '',
    weight: '',
    notes: '',
  });

  const handleSubmit = () => {
    // TODO: Implement form submission
    console.log('Form submitted:', form);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.content}>
          <FormDropdown
            label="Sākuma punkts"
            value={form.origin}
            onSelect={(value) => setForm({ ...form, origin: value })}
            placeholder="Izvēlieties sākuma punktu"
            endpoint="api/freight-tracking/objects"
          />

          <FormDropdown
            label="Galamērķis"
            value={form.destination}
            onSelect={(value) => setForm({ ...form, origin: value })}
            placeholder="  Ievadiet galamērķi"
            endpoint="api/freight-tracking/objects"
          />


          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Ar kravu</Text>
            <Switch
              value={hasCargo}
              onValueChange={setHasCargo}
              trackColor={{ false: COLORS.black100, true: COLORS.secondary }}
              thumbColor={COLORS.white}
            />
          </View>

          {hasCargo && (
            <>
              <FormInput
                label="Kravas tips"
                value={form.cargoType}
                onChangeText={(text) => setForm({ ...form, cargoType: text })}
                placeholder="Ievadiet kravas tipu"
              />

              <FormInput
                label="Kravas apjoms"
                value={form.weight}
                onChangeText={(text) => setForm({ ...form, weight: text })}
                placeholder="Ievadiet kravas svaru"
                keyboardType="numeric"
              />
            </>
          )}

          <Button
            title="Saglabāt"
            onPress={handleSubmit}
            style={styles.submitButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  content: Platform.OS === 'web' ? {
    flex: 1,
    paddingHorizontal: 16,
    marginVertical: 24,
    width: '100%',
    maxWidth: CONTAINER_WIDTH.web,
    alignSelf: 'center',
  } : {
    flex: 1,
    paddingHorizontal: 16,
    marginVertical: 24,
    width: CONTAINER_WIDTH.mobile,
  },
  submitButton: {
    marginTop: 24,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontFamily: FONT.medium,
    color: COLORS.white,
  },
});
