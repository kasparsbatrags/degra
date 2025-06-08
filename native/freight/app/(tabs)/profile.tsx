import {useRouter} from 'expo-router'
import {Alert, Platform, StyleSheet, Text, TextStyle, View, ViewStyle} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {COLORS, CONTAINER_WIDTH, FONT} from '../../constants/theme'
import {useAuth} from '../../context/AuthContext'
import OfflinePurgeButton from '../../components/Profile/OfflinePurgeButton'

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/(auth)/login');
    } catch (error: any) {
      Alert.alert(
        'Kļūda',
        error.message || 'Neizdevās izrakstīties. Lūdzu, mēģiniet vēlreiz.'
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Profils</Text>

        <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Vārds</Text>
          <Text style={styles.value}>{user?.firstName}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Uzvārds</Text>
          <Text style={styles.value}>{user?.lastName}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>E-pasts</Text>
          <Text style={styles.value}>{user?.email}</Text>
        </View>
      </View>
      </View>
      <OfflinePurgeButton />
    </SafeAreaView>
  );
}

type Styles = {
  container: ViewStyle;
  content: ViewStyle;
  title: TextStyle;
  infoContainer: ViewStyle;
  infoRow: ViewStyle;
  label: TextStyle;
  value: TextStyle;
  actionsContainer: ViewStyle;
  signOutButton: ViewStyle;
};

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  content: Platform.OS === 'web' ? {
    flex: 1,
    width: '100%' as const,
    maxWidth: CONTAINER_WIDTH.web,
    alignSelf: 'center' as const,
    padding: 24,
  } : {
    flex: 1,
    width: CONTAINER_WIDTH.mobile,
    padding: 24,
	alignSelf: 'center' as const,
  },
  title: {
    fontSize: 24,
    fontFamily: FONT.semiBold,
    color: COLORS.white,
    marginBottom: 32,
  },
  infoContainer: {
    backgroundColor: COLORS.black100,
    borderRadius: 8,
    padding: 24,
    marginBottom: 24,
  },
  infoRow: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: FONT.regular,
    color: COLORS.gray,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontFamily: FONT.medium,
    color: COLORS.white,
  },
  actionsContainer: {
    marginTop: 'auto',
  },
  signOutButton: {
    backgroundColor: 'transparent',
    borderColor: COLORS.error,
  },
});
