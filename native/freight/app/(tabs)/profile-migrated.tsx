import {useRouter} from 'expo-router'
import {Alert, Platform, StyleSheet, Text, TextStyle, View, ViewStyle} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {COLORS, CONTAINER_WIDTH, FONT} from '../../constants/theme'
import {useAuth} from '../../context/AuthContext'

// NEW: Import offline hooks and components
import { useOfflineData } from '@/hooks/useOfflineData'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { CACHE_KEYS } from '@/config/offlineConfig'
import GlobalOfflineIndicator from '@/components/GlobalOfflineIndicator'

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  // NEW: Use network status hook
  const { isOnline, isOfflineMode } = useNetworkStatus()

  // NEW: Use offline data for user profile (cache user data)
  const {
    data: cachedUser,
    isLoading: profileLoading,
    isFromCache: profileFromCache,
    isStale: profileStale,
    error: profileError,
    refetch: refetchProfile
  } = useOfflineData(
    CACHE_KEYS.PROFILE,
    async () => {
      // In real app, this would fetch fresh user data from API
      // For now, we'll just return the current user data
      return user;
    },
    {
      strategy: 'cache-first',
      enabled: !!user,
      onError: (error) => {
        console.error('Failed to cache user profile:', error)
      }
    }
  )

  // NEW: Use cached user data if available, fallback to context user
  const displayUser = cachedUser || user;

  // NEW: Enhanced sign out with offline support
  const handleSignOut = async () => {
    try {
      // NEW: Check if we're offline
      if (!isOnline) {
        Alert.alert(
          'Offline režīms',
          'Nevar izrakstīties offline režīmā. Lūdzu, pievienojieties internetam.',
          [{ text: 'Sapratu', style: 'default' }]
        );
        return;
      }

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
        {/* NEW: Add offline indicator */}
        <GlobalOfflineIndicator />

        <Text style={styles.title}>Profils</Text>

        {/* NEW: Show cache status if profile data is from cache */}
        {profileFromCache && (
          <View style={styles.cacheIndicator}>
            <Text style={styles.cacheText}>
              📱 Profila dati no cache
              {profileStale && ' (dati var būt novecojuši)'}
            </Text>
          </View>
        )}

        {/* NEW: Show error if profile failed to load and no cache */}
        {profileError && !profileFromCache && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              ⚠️ Neizdevās ielādēt profila datus
            </Text>
          </View>
        )}

        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Vārds</Text>
            <Text style={styles.value}>{displayUser?.firstName || '-'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Uzvārds</Text>
            <Text style={styles.value}>{displayUser?.lastName || '-'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>E-pasts</Text>
            <Text style={styles.value}>{displayUser?.email || '-'}</Text>
          </View>

          {/* NEW: Show offline status in profile */}
          <View style={styles.infoRow}>
            <Text style={styles.label}>Savienojuma statuss</Text>
            <Text style={[
              styles.value, 
              { color: isOnline ? COLORS.success : COLORS.warning }
            ]}>
              {isOnline ? '🟢 Online' : '🔴 Offline'}
            </Text>
          </View>

          {/* NEW: Show cache info */}
          {profileFromCache && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Datu avots</Text>
              <Text style={[styles.value, { color: COLORS.warning }]}>
                📱 Cache {profileStale ? '(novecojuši)' : '(aktuāli)'}
              </Text>
            </View>
          )}
        </View>

        {/* NEW: Enhanced sign out section with offline awareness */}
        <View style={styles.actionsContainer}>
          {!isOnline && (
            <View style={styles.offlineWarning}>
              <Text style={styles.offlineWarningText}>
                🔴 Offline režīmā nav iespējams izrakstīties
              </Text>
            </View>
          )}
        </View>
      </View>
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
  // NEW: Offline-related styles
  cacheIndicator: ViewStyle;
  cacheText: TextStyle;
  errorContainer: ViewStyle;
  errorText: TextStyle;
  offlineWarning: ViewStyle;
  offlineWarningText: TextStyle;
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
  // NEW: Offline-related styles
  cacheIndicator: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
  },
  cacheText: {
    fontSize: 12,
    fontFamily: FONT.medium,
    color: COLORS.warning,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.3)',
  },
  errorText: {
    fontSize: 14,
    fontFamily: FONT.medium,
    color: '#FF6B6B',
    textAlign: 'center',
  },
  offlineWarning: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
  },
  offlineWarningText: {
    fontSize: 14,
    fontFamily: FONT.medium,
    color: COLORS.warning,
    textAlign: 'center',
  },
});
