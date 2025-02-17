import {COLORS, CONTAINER_WIDTH, FONT} from '@/constants/theme'
import {useAuth} from '@/context/AuthContext'
import {useFocusEffect, useRouter} from 'expo-router'
import React, {useCallback, useEffect, useState} from 'react'
import {ActivityIndicator, FlatList, Platform, StyleSheet, Text, TextStyle, View, ViewStyle} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import Button from '../../components/Button'
import freightAxiosInstance from '../../config/freightAxios'

interface TruckRoutePage {
  id: number;
  dateFrom: string;
  dateTo: string;
  truckRegistrationNumber: string;
  fuelConsumptionNorm: number;
  fuelBalanceAtStart: number;
  fuelBalanceAtEnd: number | null;
}

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [routes, setRoutes] = useState<TruckRoutePage[]>([]);
  const [loading, setLoading] = useState(true);
  const [buttonText, setButtonText] = useState('Starts');

  const checkLastRouteStatus = useCallback(async () => {
    try {
      await freightAxiosInstance.get('/api/freight-tracking/truck-routes/last');
      setButtonText('FINIŠS');
    } catch (error: any) {
      if (error.response?.status === 404) {
        setButtonText('STARTS');
      }
    }
  }, []);

  const fetchRoutes = async () => {
    try {
      const response = await freightAxiosInstance.get<TruckRoutePage[]>('/api/freight-tracking/route-pages');
      setRoutes(response.data);
    } catch (error) {
      console.error('Failed to fetch routes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      setLoading(true);
      fetchRoutes();
      checkLastRouteStatus();
    }, [])
  );

  // Initial fetch
  useEffect(() => {
    fetchRoutes();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Sveicināti, {user?.firstName}!</Text>

      <Button
        title={buttonText}
        onPress={() => router.push('/truck-route')}
        style={styles.startTripButton}
      />
      
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.secondary} style={styles.loader} />
      ) : (
        <FlatList
          data={routes}
          keyExtractor={(item) => item.id.toString()}
          style={styles.list}
          renderItem={({ item }) => (
            <View style={styles.routeCard}>
              <View style={styles.routeInfo}>
                <Text style={styles.routeLabel}>Datums no - līdz:</Text>
                <Text style={styles.routeText}>
                  {new Date(item.dateFrom).toLocaleDateString('lv-LV', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })} - {new Date(item.dateTo).toLocaleDateString('lv-LV', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </Text>
              </View>
            </View>
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nav pieejamu maršrutu lapu</Text>
            </View>
          )}
        />
      )}
      </View>
    </SafeAreaView>
  );
}

type Styles = {
  list: ViewStyle;
  loader: ViewStyle;
  routeCard: ViewStyle;
  routeInfo: ViewStyle;
  routeLabel: TextStyle;
  routeText: TextStyle;
  emptyContainer: ViewStyle;
  emptyText: TextStyle;
  container: ViewStyle;
  content: ViewStyle;
  heading: TextStyle;
  title: TextStyle;
  subtitle: TextStyle;
  statsContainer: ViewStyle;
  statCard: ViewStyle;
  statNumber: TextStyle;
  statLabel: TextStyle;
  infoContainer: ViewStyle;
  infoText: TextStyle;
  startTripButton: ViewStyle;
  addRouteButton: ViewStyle;
  sectionTitle: TextStyle;
};

const styles = StyleSheet.create<Styles>({
  list: {
    marginTop: 16,
  },
  loader: {
    marginTop: 24,
  },
  routeCard: {
    backgroundColor: COLORS.black100,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  routeInfo: {
    marginBottom: 8,
  },
  routeLabel: {
    fontSize: 14,
    fontFamily: FONT.medium,
    color: COLORS.gray,
    marginBottom: 4,
  },
  routeText: {
    fontSize: 16,
    fontFamily: FONT.semiBold,
    color: COLORS.white,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: FONT.regular,
    color: COLORS.gray,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  content: Platform.OS === 'web' ? {
    flex: 1,
    paddingHorizontal: 16,
    marginVertical: 24,
    width: '100%' as const,
    maxWidth: CONTAINER_WIDTH.web,
    alignSelf: 'center' as const,
  } : {
    flex: 1,
    paddingHorizontal: 16,
    marginVertical: 24,
    width: CONTAINER_WIDTH.mobile,
  },
  heading: {
    fontSize: 32,
    fontFamily: FONT.bold,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontFamily: FONT.semiBold,
    color: COLORS.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: FONT.regular,
    color: COLORS.gray,
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.black100,
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontFamily: FONT.bold,
    color: COLORS.secondary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: FONT.regular,
    color: COLORS.gray,
    textAlign: 'center',
  },
  infoContainer: {
    backgroundColor: COLORS.black100,
    borderRadius: 8,
    padding: 16,
  },
  infoText: {
    fontSize: 14,
    fontFamily: FONT.regular,
    color: COLORS.gray,
    lineHeight: 20,
  },
  startTripButton: {
    marginTop: 24,
  },
  addRouteButton: {
    marginTop: 16,
    backgroundColor: COLORS.black100,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: FONT.semiBold,
    color: COLORS.white,
    marginTop: 32,
    marginBottom: 16,
  },
});
