import {useRouter} from 'expo-router'
import React, {useState} from 'react'
import {Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View,} from 'react-native'
import Button from '../../components/Button'
import FormInput from '../../components/FormInput'
import {images} from '../../constants/assets'
import {commonStyles} from '../../constants/styles'
import {SPACING} from '../../constants/theme'
import {useAuth} from '../../context/AuthContext'
import type {UserRegistrationData} from '../../types/auth'

export default function RegisterScreen() {
  const [formData, setFormData] = useState<UserRegistrationData>({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    organizationRegistrationNumber: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleRegister = async () => {
    // Pārbaudam, vai visi lauki ir aizpildīti
    const emptyFields = Object.entries(formData).filter(([_, value]) => !value);
    if (emptyFields.length > 0) {
      Alert.alert('Kļūda', 'Lūdzu, aizpildiet visus laukus');
      return;
    }

    try {
      setLoading(true);
      await register(formData);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert(
        'Kļūda',
        error.message || 'Neizdevās reģistrēties. Lūdzu, mēģiniet vēlreiz.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    router.back();
  };

  const updateFormData = (field: keyof UserRegistrationData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={commonStyles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Image source={images.logo} style={styles.logo} resizeMode="contain" />
          </View>

          <Text style={commonStyles.title}>Reģistrēties</Text>
          <Text style={[commonStyles.textSecondary, styles.subtitle]}>
            Izveidojiet jaunu kontu, lai sāktu lietot sistēmu
          </Text>

          <View style={styles.form}>
            <FormInput
              label="E-pasts"
              value={formData.email}
              onChangeText={(value) => {
                updateFormData('email', value);
                updateFormData('username', value);
              }}
              placeholder="Ievadiet e-pastu"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <FormInput
              label="Vārds"
              value={formData.firstName}
              onChangeText={(value) => updateFormData('firstName', value)}
              placeholder="Ievadiet vārdu"
              autoCapitalize="words"
            />

            <FormInput
              label="Uzvārds"
              value={formData.lastName}
              onChangeText={(value) => updateFormData('lastName', value)}
              placeholder="Ievadiet uzvārdu"
              autoCapitalize="words"
            />

            <FormInput
              label="Organizācijas reģistrācijas numurs"
              value={formData.organizationRegistrationNumber}
              onChangeText={(value) =>
                updateFormData('organizationRegistrationNumber', value)
              }
              placeholder="Ievadiet reģistrācijas numuru"
            />

            <FormInput
              label="Parole"
              value={formData.password}
              onChangeText={(value) => updateFormData('password', value)}
              placeholder="Ievadiet paroli"
              secureTextEntry
            />

            <Button
              title="Reģistrēties"
              onPress={handleRegister}
              loading={loading}
              style={styles.registerButton}
            />

            <Button
              title="Atpakaļ uz pieslēgšanos"
              onPress={handleLogin}
              variant="outline"
              style={styles.loginButton}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: SPACING.m,
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },
  logo: {
    width: 200,
    height: 80,
  },
  subtitle: {
    marginTop: SPACING.xs,
    marginBottom: SPACING.xl,
  },
  form: {
    width: '100%',
  },
  registerButton: {
    marginTop: SPACING.l,
  },
  loginButton: {
    marginTop: SPACING.m,
  },
});
