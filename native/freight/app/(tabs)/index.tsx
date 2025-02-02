import {useRouter} from 'expo-router'
import {Platform, StyleSheet, Text, TextStyle, View, ViewStyle} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import Button from '../../components/Button'
import {COLORS, CONTAINER_WIDTH, FONT} from '../../constants/theme'
import {useAuth} from '../../context/AuthContext'

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Sveicināti, {user?.firstName}!</Text>

      <Button
        title="Sākt braucienu"
        onPress={() => router.push('/transportation')}
        style={styles.startTripButton}
      />
      </View>
    </SafeAreaView>
  );
}

type Styles = {
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
};

const styles = StyleSheet.create<Styles>({
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
});
