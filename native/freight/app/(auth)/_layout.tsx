import {Redirect, Stack} from 'expo-router'
import {useAuth} from '../../context/AuthContext'

export default function AuthLayout() {
  const { isAuthenticated, loading } = useAuth();

  console.log('🔐 AuthLayout render - isAuthenticated:', isAuthenticated, 'loading:', loading);

  // Ja lietotājs jau ir autentificēts, novirzām uz galveno ekrānu
  if (isAuthenticated) {
    console.log('✅ User authenticated, redirecting to tabs...');
    return <Redirect href="/(tabs)" />;
  }

  // Neblokējam auth ekrānu loading laikā, lai saglabātu formas stāvokli
  // if (loading) {
  //   console.log('⏳ Auth loading, showing nothing...');
  //   return null;
  // }

  console.log('📱 Showing auth screens...');

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          title: 'Pieslēgties',
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          title: 'Reģistrēties',
        }}
      />
    </Stack>
  );
}
