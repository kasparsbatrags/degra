import {Redirect, Stack} from 'expo-router'
import {useAuth} from '../../context/AuthContext'

export default function AuthLayout() {
  const { isAuthenticated, loading } = useAuth();

  // Ja lietotājs jau ir autentificēts, novirzām uz galveno ekrānu
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  // Kamēr pārbaudam autentifikācijas statusu, neko nerādām
  if (loading) {
    return null;
  }

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
