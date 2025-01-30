import {useRouter} from 'expo-router'
import {Alert, StyleSheet, Text, View} from 'react-native'
import Button from '../../components/Button'
import {useAuth} from '../../context/AuthContext'

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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profils</Text>
      </View>

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

      <View style={styles.actionsContainer}>
        <Button
          title="Izrakstīties"
          onPress={handleSignOut}
          variant="outline"
          style={styles.signOutButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  infoContainer: {
    padding: 20,
  },
  infoRow: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  actionsContainer: {
    padding: 20,
    marginTop: 'auto',
  },
  signOutButton: {
    backgroundColor: '#fff',
    borderColor: '#ff3b30',
  },
});
