import React, { useState } from 'react';
import { Link, useRouter } from 'expo-router';
import { View, Text, Alert, Dimensions, Image, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { usePlatform } from '../../hooks/usePlatform';

// Import modern components
import ModernFormInput from '../../components/ModernFormInput';
import ModernButton from '../../components/ModernButton';

// Import old components for mobile fallback
import Button from '../../components/Button';
import FormInput from '../../components/FormInput';
import { images } from '../../constants/assets';
import { COLORS, CONTAINER_WIDTH, FONT } from '../../constants/theme';

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

  // WEB VERSION - Ultra Modern Design with CSS Classes
  if (isWeb) {
    return (
      <View
        className="degra-gradient-bg animated fadeIn"
        style={{
          minHeight: Dimensions.get("window").height,
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
        }}>
        
        <View
          className="degra-card animated slideInDown"
          style={{
            width: '100%',
            maxWidth: 420,
            padding: 40,
          }}>
          {/* Modern Header */}
          <View style={{ marginBottom: 40, alignItems: 'center' }}>
            {/* Modern Logo */}
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              marginBottom: 24,
              shadowColor: '#3b82f6',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
              elevation: 10,
              overflow: 'hidden',
            }}>
              {/* Gradient background for logo */}
              <View style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#3b82f6',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
				  <Image
						  source={images.logo}
						  resizeMode="contain"
						  style={{
							  width: 60,
							  height: 60,
							  alignSelf: 'center',
						  }}
				  />
              </View>
            </View>
            
            <Text
              className="animated pulse"
              style={{
                fontSize: 28,
                fontFamily: 'system-ui',
                fontWeight: '700',
                color: '#1f2937',
                textAlign: 'center',
                marginBottom: 8,
              }}>
              Krava
            </Text>
            
            <Text style={{
              fontSize: 15,
              color: '#6b7280',
              textAlign: 'center',
              marginBottom: 32,
              lineHeight: 22,
              fontFamily: 'system-ui',
            }}>
              Auto izmantošanas uzskaites sistēma
            </Text>
          </View>

          {/* Modern Form */}
          <ModernFormInput
            label="E-pasta adrese"
            value={form.email}
            onChangeText={(text) => {
              setForm({ ...form, email: text });
              setFormErrors({ ...formErrors, email: '' });
            }}
            error={formErrors.email}
            placeholder="example@degra.lv"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            required
          />

          <ModernFormInput
            label="Parole"
            value={form.password}
            onChangeText={(text) => {
              setForm({ ...form, password: text });
              setFormErrors({ ...formErrors, password: '' });
            }}
            error={formErrors.password}
            placeholder="••••••••••"
            secureTextEntry
            autoComplete="current-password"
            textContentType="password"
            required
            rightIcon="👁"
            showPassword
          />

          {/* Forgot password link */}
          <View style={{ alignItems: 'flex-end', marginBottom: 24 }}>
            <TouchableOpacity className="animated fadeIn">
              <Text
                className="degra-text-primary"
                style={{
                  fontSize: 14,
                  fontFamily: 'system-ui',
                  fontWeight: '500',
                }}>
                Aizmirsāt paroli?
              </Text>
            </TouchableOpacity>
          </View>

          <ModernButton
            title="Pieslēgties"
            onPress={handleLogin}
            loading={loading}
            variant="primary"
            size="lg"
            fullWidth
          />

          {/* Divider */}
          <View
            className="animated fadeIn"
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: 32,
            }}>
            <View style={{ flex: 1, height: 1, backgroundColor: '#e5e7eb' }} />
            <Text style={{
              marginHorizontal: 16,
              fontSize: 14,
              color: '#9ca3af',
              fontFamily: 'system-ui',
            }}>
              vai
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: '#e5e7eb' }} />
          </View>

          {/* Register section */}
          <View
            className="nifty-text-center animated slideInUp"
            style={{ alignItems: 'center' }}>

            
            <TouchableOpacity
              className="button animated bounce"
              onPress={() => router.push('/register')}
            >
              <Text
                className="degra-text-primary"
                style={{
                  fontSize: 14,
                  fontFamily: 'system-ui',
                  fontWeight: '500',
                }}>
				  Izveidot jaunu kontu
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Footer */}
        <Text
          className="animated fadeIn slow"
          style={{
            position: 'absolute',
            bottom: 20,
            fontSize: 13,
            color: 'rgba(255, 255, 255, 0.7)',
            fontFamily: 'system-ui',
            textAlign: 'center',
          }}>
          © 2024 Degra Freight. Visas tiesības aizsargātas.
        </Text>
      </View>
    );
  }

  // MOBILE VERSION - Keep Original Design (WORKS AS BEFORE!)
  return (
    <SafeAreaView style={{
      flex: 1,
      backgroundColor: COLORS.primary,
    }}>
      <ScrollView>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            paddingHorizontal: 16,
            marginVertical: 24,
            width: CONTAINER_WIDTH.mobile,
            alignSelf: 'center',
            minHeight: Dimensions.get("window").height - 100,
          }}
        >
          <Image
            source={images.logo}
            resizeMode="contain"
            style={{
              width: 60,
              height: 60,
              alignSelf: 'center',
            }}
          />

          <Text style={{
            fontSize: 32,
            fontFamily: FONT.bold,
            color: COLORS.white,
            textAlign: 'center',
          }}>
            Krava
          </Text>

          <Text style={{
            fontSize: 24,
            fontFamily: FONT.semiBold,
            color: COLORS.white,
            marginTop: 5,
            marginBottom: 28,
            textAlign: 'center',
          }}>
            Auto izmantošanas uzskaites sistēma
          </Text>

          <FormInput
            label="E-pasts"
            value={form.email}
            onChangeText={(e) => {
              setForm({ ...form, email: e });
              setFormErrors({ ...formErrors, email: "" });
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            error={formErrors.email}
            autocomplete="email"
            textContentType="emailAddress"
            autoCompleteType="email"
          />

          <FormInput
            label="Parole"
            value={form.password}
            onChangeText={(e) => {
              setForm({ ...form, password: e });
              setFormErrors({ ...formErrors, password: "" });
            }}
            secureTextEntry
            error={formErrors.password}
            autocomplete="current-password"
            textContentType="password"
            autoCompleteType="password"
          />

          <Button
            title="Pieslēgties"
            onPress={handleLogin}
            loading={loading}
            style={{ marginTop: 28 }}
          />

          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: 20,
            gap: 8,
          }}>
            <Link
              href="/register"
              style={{
                fontSize: 18,
                fontFamily: FONT.semiBold,
                color: COLORS.secondary,
              }}
            >
              Reģistrēties
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
