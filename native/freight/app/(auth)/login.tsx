import {useRouter} from 'expo-router'
import React, {useState} from 'react'
import {Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View,} from 'react-native'
import Button from '../../components/Button'
import FormInput from '../../components/FormInput'
import {images} from '../../constants/assets'
import {commonStyles} from '../../constants/styles'
import {SPACING} from '../../constants/theme'
import {useAuth} from '../../context/AuthContext'

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Kļūda', 'Lūdzu, aizpildiet visus laukus');
      return;
    }

    try {
      setLoading(true);
      await signIn(email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert(
        'Kļūda',
        error.message || 'Neizdevās pieslēgties. Lūdzu, mēģiniet vēlreiz.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    router.push('/register');
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

          <Text style={commonStyles.title}>Pieslēgties</Text>
          <Text style={[commonStyles.textSecondary, styles.subtitle]}>
            Ievadiet savu e-pastu un paroli, lai pieslēgtos
          </Text>

          <View style={styles.form}>
            <FormInput
              label="E-pasts"
              value={email}
              onChangeText={setEmail}
              placeholder="Ievadiet e-pastu"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <FormInput
              label="Parole"
              value={password}
              onChangeText={setPassword}
              placeholder="Ievadiet paroli"
              secureTextEntry
            />

            <Button
              title="Pieslēgties"
              onPress={handleLogin}
              loading={loading}
              style={styles.loginButton}
            />

            <Button
              title="Reģistrēties"
              onPress={handleRegister}
              variant="outline"
              style={styles.registerButton}
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
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
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
  loginButton: {
    marginTop: SPACING.l,
  },
  registerButton: {
    marginTop: SPACING.m,
  },
});
