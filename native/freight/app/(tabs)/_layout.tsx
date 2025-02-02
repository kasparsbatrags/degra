import FontAwesome from '@expo/vector-icons/FontAwesome'
import {Redirect, Tabs} from 'expo-router'
import {COLORS} from '../../constants/theme'
import {useAuth} from '../../context/AuthContext'

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const { isAuthenticated, loading } = useAuth();

  // Ja lietotājs nav autentificēts, novirzām uz login ekrānu
  if (!isAuthenticated && !loading) {
    return <Redirect href="/(auth)/login" />;
  }

  // Kamēr pārbaudam autentifikācijas statusu, neko nerādām
  if (loading) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.secondary,
        tabBarInactiveTintColor: COLORS.gray,
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.white,
        tabBarStyle: {
          backgroundColor: COLORS.black100,
          borderTopWidth: 0,
        },
        headerTitleStyle: {
          color: COLORS.white,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Sākums',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profils',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
    </Tabs>
  );
}
