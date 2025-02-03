import {useRouter} from 'expo-router'
import React, {useState} from 'react'
import {Alert, Dimensions, Image, ImageStyle, Platform, ScrollView, StyleSheet, Text, TextStyle, View, ViewStyle,} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
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
    router.replace('/(auth)/login');
  };

  const updateFormData = (field: keyof UserRegistrationData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
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
			<Text style={styles.heading}>
				Kravu uzskaite...
			</Text>

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

            <CompanySearch
              label="Organizācijas reģistrācijas numurs"
              value={formData.organizationRegistrationNumber}
              onSelect={(value) =>
                updateFormData('organizationRegistrationNumber', value)
              }
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
