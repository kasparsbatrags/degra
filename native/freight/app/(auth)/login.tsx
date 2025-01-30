import {useRouter} from 'expo-router'
import React, {useState} from 'react'
import {Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View,} from 'react-native'
import Button from '../../components/Button'
import FormInput from '../../components/FormInput'
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
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Text style={styles.title}>Pieslēgties</Text>
          
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#000',
  },
  loginButton: {
    marginTop: 16,
  },
  registerButton: {
    marginTop: 12,
  },
});
