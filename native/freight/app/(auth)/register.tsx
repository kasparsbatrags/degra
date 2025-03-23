import {useRouter} from 'expo-router'
import React, {useState} from 'react'
import {Alert, Dimensions, Image, ImageStyle, Platform, ScrollView, StyleSheet, Text, TextStyle, View, ViewStyle,} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import BackButton from '../../components/BackButton'
import Button from '../../components/Button'
import CompanySearch from '../../components/CompanySearch'
import FormInput from '../../components/FormInput'
import {images} from '../../constants/assets'
import {COLORS, CONTAINER_WIDTH, FONT} from '../../constants/theme'
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
  const [companyName, setCompanyName] = useState('');
  const [formErrors, setFormErrors] = useState({
    email: '',
    firstName: '',
    lastName: '',
    organizationRegistrationNumber: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  // Function to validate email format
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRegister = async () => {
    // Reset all errors
    setFormErrors({
      email: '',
      firstName: '',
      lastName: '',
      organizationRegistrationNumber: '',
      password: '',
    });

    // Validate each field
    let hasErrors = false;
    const newErrors = { ...formErrors };

    if (!formData.email) {
      newErrors.email = 'Lūdzu, ievadiet e-pastu';
      hasErrors = true;
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Nepareizs e-pasta formāts. Lūdzu, ievadiet derīgu e-pastu.';
      hasErrors = true;
    }

    if (!formData.firstName) {
      newErrors.firstName = 'Ievadiet vārdu';
      hasErrors = true;
    }

    if (!formData.lastName) {
      newErrors.lastName = 'Ievadiet uzvārdu';
      hasErrors = true;
    }

    if (!formData.organizationRegistrationNumber) {
      newErrors.organizationRegistrationNumber = 'Izvēlieties uzņēmumu';
      hasErrors = true;
    }

    if (!formData.password) {
      newErrors.password = 'Ievadiet paroli';
      hasErrors = true;
    } else if (formData.password.length < 1) {
      newErrors.password = 'Parolei jābūt vismaz 6 simbolus garai';
      hasErrors = true;
    }

    if (hasErrors) {
      setFormErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      console.log('Attempting registration with data:', formData);
      await register(formData);
      console.log('Registration successful');
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Registration error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      Alert.alert(
        'Kļūda',
        error.message || 'Neizdevās reģistrēties. Lūdzu, mēģiniet vēlreiz.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    router.replace('/(auth)/login');
  };

  const updateFormData = (field: keyof UserRegistrationData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error when user types
    if (field in formErrors) {
      setFormErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View
          style={[
            styles.content,
            {
              minHeight: Dimensions.get("window").height - 100,
            },
          ]}
        >

          <Image
            source={images.logo}
            resizeMode="contain"
            style={styles.logo}
          />
          <Text style={styles.title}>
            Reģistrēties
          </Text>

          <Text style={styles.subtitle}>
            Izveidojiet jaunu kontu, lai sāktu lietot sistēmu
          </Text>

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
              error={formErrors.email}
            />

            <FormInput
              label="Vārds"
              value={formData.firstName}
              onChangeText={(value) => updateFormData('firstName', value)}
              placeholder="Ievadiet vārdu"
              autoCapitalize="words"
              error={formErrors.firstName}
            />

            <FormInput
              label="Uzvārds"
              value={formData.lastName}
              onChangeText={(value) => updateFormData('lastName', value)}
              placeholder="Ievadiet uzvārdu"
              autoCapitalize="words"
              error={formErrors.lastName}
            />

            <CompanySearch
              label="Uzņēmuma nosaukums"
              value={companyName}
              onSelect={(registrationNumber, name) => {
                updateFormData('organizationRegistrationNumber', registrationNumber);
                if (name) {
                  setCompanyName(name);
                }
              }}
              errorMessage={formErrors.organizationRegistrationNumber}
            />

            <FormInput
              label="Parole"
              value={formData.password}
              onChangeText={(value) => updateFormData('password', value)}
              placeholder="Ievadiet paroli"
              secureTextEntry
              error={formErrors.password}
            />
          <Button
            title="Reģistrēties"
            onPress={handleRegister}
            loading={loading}
            style={styles.registerButton}
          />

          <BackButton
            title="Atpakaļ uz pieslēgšanos"
            onPress={handleLogin}
            style={styles.loginButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type Styles = {
  container: ViewStyle;
  content: ViewStyle;
  heading: TextStyle;
  logo: ImageStyle;
  title: TextStyle;
  subtitle: TextStyle;
  registerButton: ViewStyle;
  loginButton: ViewStyle;
};

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  content: Platform.OS === 'web' ? {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginVertical: 24,
    width: '100%' as const,
    maxWidth: CONTAINER_WIDTH.web,
    alignSelf: 'center' as const,
  } : {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginVertical: 24,
    width: CONTAINER_WIDTH.mobile,
  },
  heading: {
    fontSize: 32,
    fontFamily: FONT.bold,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 200,
    height: 60,
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: FONT.semiBold,
    color: COLORS.white,
    marginTop: 40,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: FONT.regular,
    color: COLORS.gray,
    marginBottom: 28,
  },
  registerButton: {
    marginTop: 28,
  },
  loginButton: {
    marginTop: 16,
  },
});
