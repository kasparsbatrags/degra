import React, { useState } from 'react';
import { Link, useRouter } from 'expo-router';
import { View, Text, Alert } from 'react-native';
import { AuthLayout, AdaptiveFormInput, AdaptiveButton } from '../../components/web';
import { useAuth } from '../../context/AuthContext';
import { usePlatform } from '../../hooks/usePlatform';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const { isWeb } = usePlatform();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState({
    email: '',
    password: '',
  });
  const router = useRouter();

  // Function to validate email format
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    setFormErrors({ email: '', password: '' });

    const { email, password } = form;
    let emailError = '';
    let passwordError = '';

    if (!email) emailError = 'Lūdzu, ievadiet e-pastu';
    if (!password) passwordError = 'Lūdzu, ievadiet paroli';

    if (emailError || passwordError) {
      setFormErrors({ email: emailError, password: passwordError });
      return;
    }

    if (!isValidEmail(email)) {
      setFormErrors({
        email: 'Nepareizs e-pasta formāts. Lūdzu, ievadiet derīgu e-pastu.',
        password: '',
      });
      return;
    }

    try {
      setLoading(true);
      await signIn(email, password);
    } catch (error: any) {
      const message = error.message || '';

      if (message.includes('Invalid credentials') || message === 'Nepareizs e-pasts vai parole') {
        setFormErrors({
          email: '',
          password: 'Nepareiza parole. Lūdzu, pārbaudiet un mēģiniet vēlreiz.',
        });
      } else if (message.includes('Invalid email or password')) {
        setFormErrors({
          email: '',
          password: 'Nepareizs e-pasts vai parole. Lūdzu, pārbaudiet un mēģiniet vēlreiz.',
        });
      } else {
        setFormErrors({
          email: '',
          password: 'Neizdevās pieslēgties - serveris neatbild. Lūdzu, mēģiniet vēlreiz mazliet vēlāk!',
        });
      }

      // Show alert on mobile
      if (!isWeb) {
        Alert.alert(
          'Pieslēgšanās kļūda',
          formErrors.password || 'Neizdevās pieslēgties. Lūdzu, pārbaudiet savus datus.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Degra Freight"
      subtitle="Auto izmantošanas uzskaites sistēma"
    >
      {/* Login Form Header */}
      <View className="mb-8">
        <Text className="text-2xl lg:text-3xl font-pbold text-neutral-900 mb-2">
          Pieslēgties
        </Text>
        <Text className="text-neutral-600 font-pregular">
          Ievadiet savus datus, lai piekļūtu sistēmai
        </Text>
      </View>

      {/* Login Form */}
      <View className="space-y-6">
        <AdaptiveFormInput
          label="E-pasta adrese"
          value={form.email}
          onChangeText={(text) => {
            setForm({ ...form, email: text });
            setFormErrors({ ...formErrors, email: '' });
          }}
          error={formErrors.email}
          placeholder="ievadiet.savu@e-pastu.lv"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          required
        />

        <AdaptiveFormInput
          label="Parole"
          value={form.password}
          onChangeText={(text) => {
            setForm({ ...form, password: text });
            setFormErrors({ ...formErrors, password: '' });
          }}
          error={formErrors.password}
          placeholder="Ievadiet savu paroli"
          secureTextEntry
          autoComplete="current-password"
          textContentType="password"
          required
        />

        {/* Forgot Password Link - Web Only */}
        {isWeb && (
          <View className="flex items-end">
            <Text className="text-sm text-primary-600 hover:text-primary-700 cursor-pointer font-pmedium">
              Aizmirsi paroli?
            </Text>
          </View>
        )}

        {/* Login Button */}
        <AdaptiveButton
          title="Pieslēgties"
          onPress={handleLogin}
          loading={loading}
          variant="primary"
          size="lg"
          icon="🔐"
        />

        {/* Divider */}
        <View className="flex flex-row items-center my-6">
          <View className="flex-1 h-px bg-neutral-300" />
          <Text className="mx-4 text-neutral-500 font-pregular">vai</Text>
          <View className="flex-1 h-px bg-neutral-300" />
        </View>

        {/* Register Link */}
        <View className="text-center">
          <Text className="text-neutral-600 font-pregular">
            Nav konta?{' '}
            <Link href="/register" asChild>
              <Text className="text-primary-600 hover:text-primary-700 font-pmedium cursor-pointer">
                Reģistrēties šeit
              </Text>
            </Link>
          </Text>
        </View>

        {/* Additional Options - Web Only */}
        {isWeb && (
          <View className="mt-8 pt-6 border-t border-neutral-200">
            <Text className="text-xs text-neutral-500 text-center leading-relaxed">
              Pieslēdzoties, jūs piekrītat mūsu{' '}
              <Text className="text-primary-600 hover:text-primary-700 cursor-pointer">
                lietošanas noteikumiem
              </Text>{' '}
              un{' '}
              <Text className="text-primary-600 hover:text-primary-700 cursor-pointer">
                privātuma politikai
              </Text>
              .
            </Text>
          </View>
        )}
      </View>
    </AuthLayout>
  );
}