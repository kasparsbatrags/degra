import FontAwesome from '@expo/vector-icons/FontAwesome'
import {Redirect, Stack, useRouter} from 'expo-router'
import React, {useState} from 'react'
import {TouchableOpacity} from 'react-native'
import Menu from '../../components/Menu'
import {COLORS} from '../../constants/theme'
import {useAuth} from '../../context/AuthContext'

function HeaderIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
  onPress?: () => void;
  style?: any;
}) {
  return (
    <TouchableOpacity onPress={props.onPress} style={props.style}>
      <FontAwesome size={24} {...props} />
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);

  console.log('📱 TabLayout render - isAuthenticated:', isAuthenticated, 'loading:', loading);

  // Ja lietotājs nav autentificēts, novirzām uz login ekrānu
  if (!isAuthenticated && !loading) {
    console.log('❌ User not authenticated, redirecting to login...');
    return <Redirect href="/(auth)/login" />;
  }

  // Kamēr pārbaudam autentifikācijas statusu, neko nerādām
  if (loading) {
    console.log('⏳ Tabs loading, showing nothing...');
    return null;
  }

  console.log('✅ Showing tabs interface...');

  return (
    <>
      <Menu visible={menuVisible} onClose={() => setMenuVisible(false)} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: COLORS.white,
          headerTitleStyle: {
            color: COLORS.white,
          },
          headerLeft: () => (
            <HeaderIcon 
              name="bars" 
              color={COLORS.white}
              style={{ marginLeft: 12, paddingRight: 12 }}
              onPress={() => setMenuVisible(true)}
            />
          ),
        }}>
        <Stack.Screen
          name="index"
          options={{
            title: 'Maršruta lapu saraksts',
          }}
        />
        <Stack.Screen
          name="profile"
          options={{
            title: 'Profils',
          }}
        />
        <Stack.Screen
          name="truck-route"
          options={{
            title: 'Sākt braucienu',
          }}
        />
		  <Stack.Screen
				  name="truck-route-page"
				  options={{
					  title: 'Maršruta lapa',
				  }}
		  />
        <Stack.Screen
          name="offline-data"
          options={{
            title: 'Nesinhronizētie dati',
          }}
        />
      </Stack>
    </>
  );
}
