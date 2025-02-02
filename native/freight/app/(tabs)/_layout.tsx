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

  // Ja lietotājs nav autentificēts, novirzām uz login ekrānu
  if (!isAuthenticated && !loading) {
    return <Redirect href="/(auth)/login" />;
  }

  // Kamēr pārbaudam autentifikācijas statusu, neko nerādām
  if (loading) {
    return null;
  }

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
            title: 'Kravu uzskaite',
          }}
        />
        <Stack.Screen
          name="profile"
          options={{
            title: 'Profils',
          }}
        />
        <Stack.Screen
          name="transportation"
          options={{
            title: 'Sākt braucienu',
          }}
        />
      </Stack>
    </>
  );
}
