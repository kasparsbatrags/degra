import {useNetInfo} from '@react-native-community/netinfo'
import {useRouter} from 'expo-router'
import React, {useState} from 'react'
import {
	Alert,
	Dimensions,
	ImageStyle,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextStyle,
	View,
	ViewStyle
} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import BackButton from '../../components/BackButton'
import Button from '../../components/Button'
import CompanySearch from '../../components/CompanySearch'
import FormInput from '../../components/FormInput'
import {COLORS, CONTAINER_WIDTH, FONT} from '../../constants/theme'
import {useAuth} from '../../context/AuthContext'
import type {UserRegistrationData} from '../../types/auth'

export default function RegisterScreen() {
  const [formData, setFormData] = useState<UserRegistrationData>({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    organizationRegistrationNumber: '',
    password: '',
    truckMaker: '',
    truckModel: '',
    truckRegistrationNumber: '',
    fuelConsumptionNorm: '',
  });
  const [companyName, setCompanyName] = useState('');
  const [formErrors, setFormErrors] = useState({
    email: '',
    firstName: '',
    lastName: '',
    organizationRegistrationNumber: '',
    password: '',
    truckMaker: '',
    truckModel: '',
    truckRegistrationNumber: '',
    fuelConsumptionNorm: '',
  });
  const [activeTab, setActiveTab] = useState<'basic' | 'truck'>('basic');
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState(''); // Jauns stāvoklis vispārīgai kļūdai
  const { register } = useAuth();
  const router = useRouter();
  
  // Pārbaudām tīkla savienojuma statusu
  const netInfo = useNetInfo();
  const isConnected = netInfo.isConnected;

  // Function to validate email format
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRegister = async () => {
    // Reset all errors
    setFormErrors({
      email: '',
      firstName: '',
      lastName: '',
      organizationRegistrationNumber: '',
      password: '',
      truckMaker: '',
      truckModel: '',
      truckRegistrationNumber: '',
      fuelConsumptionNorm: '',
    });

    // Validate basic data fields first
    let hasBasicErrors = false;
    const newErrors = { ...formErrors };

    if (!formData.email) {
      newErrors.email = 'Lūdzu, ievadiet e-pastu';
      hasBasicErrors = true;
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Nepareizs e-pasta formāts. Lūdzu, ievadiet derīgu e-pastu.';
      hasBasicErrors = true;
    }

    if (!formData.firstName) {
      newErrors.firstName = 'Ievadiet vārdu';
      hasBasicErrors = true;
    }

    if (!formData.lastName) {
      newErrors.lastName = 'Ievadiet uzvārdu';
      hasBasicErrors = true;
    }

    if (!formData.organizationRegistrationNumber || !companyName) {
      newErrors.organizationRegistrationNumber = 'Izvēlieties uzņēmumu';
      hasBasicErrors = true;
    }

    if (!formData.password) {
      newErrors.password = 'Ievadiet paroli';
      hasBasicErrors = true;
    }
	const passwordErrors = validatePassword(formData.password);
	if (passwordErrors.length > 0) {
	  newErrors.password = passwordErrors.join('\n');
	  hasBasicErrors = true;
	}

    // If there are errors in basic data, show them and stay on the basic tab
    if (hasBasicErrors) {
      setFormErrors(newErrors);
      setActiveTab('basic');
      return;
    }

    // If basic data is valid, validate truck data fields
    let hasTruckErrors = false;
    
    if (!formData.truckMaker) {
      newErrors.truckMaker = 'Ievadiet kravas auto ražotāju';
      hasTruckErrors = true;
    }
    
    if (!formData.truckModel) {
      newErrors.truckModel = 'Ievadiet kravas auto modeli';
      hasTruckErrors = true;
    }
    
    if (!formData.truckRegistrationNumber) {
      newErrors.truckRegistrationNumber = 'Ievadiet reģistrācijas numuru';
      hasTruckErrors = true;
    }
    
    if (!formData.fuelConsumptionNorm) {
      newErrors.fuelConsumptionNorm = 'Ievadiet degvielas patēriņa normu';
      hasTruckErrors = true;
    }

    // If there are errors in truck data, show them and switch to the truck tab
    if (hasTruckErrors) {
      setFormErrors(newErrors);
      setActiveTab('truck');
      return;
    }

    try {
      setLoading(true);
      // Notīrām vispārīgo kļūdu pirms mēģinājuma
      setGeneralError('');
      console.log('Attempting registration with data:', formData);
      await register(formData);
      console.log('Registration successful');
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Registration error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      const errorMessage = error.response?.data?.message === "Username or Email already exists" ||
                          error.message?.includes("Username or Email already exists")
                          ? 'E-pasta adrese jau tiek izmantota sistēmā. Lūdzu izmantojiet paroles atgūšanas funkcionalitāti '
                          : error.message || 'Neizdevās reģistrēties. Lūdzu, mēģiniet vēlreiz.';
      
      if (Platform.OS === 'web') {
        // Web platformai izmantojam stāvokli, lai parādītu kļūdu
        setGeneralError(errorMessage);
      } else {
        // Mobilajām platformām izmantojam Alert
        Alert.alert('Kļūda', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

	const validatePassword = (password: string): string[] => {
		const errors: string[] = [];

		if (password.length < 8) {
			errors.push('Parolei jābūt vismaz 8 simbolus garai');
		}
		if (!/[A-Z]/.test(password)) {
			errors.push('Parolei jāietver vismaz viens lielais burts');
		}
		if (!/\d/.test(password)) {
			errors.push('Parolei jāietver vismaz viens cipars');
		}
		if (!/[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\;/]/.test(password)) {
			errors.push('Parolei jāietver vismaz viens speciālais simbols');
		}
		if (errors.length>0) {
			errors.push('Piemēram: 3.Augusts');
		}
		return errors;
	};



	const handleLogin = () => {
    router.replace('/(auth)/login');
  };

  const updateFormData = (field: keyof UserRegistrationData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error when user types
    if (field in formErrors) {
      setFormErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
    
    // Notīrām vispārīgo kļūdu, kad lietotājs sāk rediģēt formu
    if (generalError) {
      setGeneralError('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}
      >
        <ScrollView 
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{flexGrow: 1}}
        >
          <View
            style={[
              styles.content,
              {
                minHeight: Dimensions.get("window").height - 100,
              },
            ]}
          >

          <Text style={styles.title}>
            Reģistrēties
          </Text>

          <Text style={styles.subtitle}>
            Izveidojiet jaunu kontu, lai sāktu lietot Kravu uzskaites sistēmu
          </Text>

          {/* Tab buttons */}
          <View style={styles.tabContainer}>
            <Pressable
              style={[styles.tabButton, activeTab === 'basic' && styles.tabButtonActive]}
              onPress={() => setActiveTab('basic')}
            >
              <Text style={[styles.tabText, activeTab === 'basic' && styles.tabTextActive]}>Pamatdati</Text>
            </Pressable>
            <Pressable
              style={[styles.tabButton, activeTab === 'truck' && styles.tabButtonActive]}
              onPress={() => setActiveTab('truck')}
            >
              <Text style={[styles.tabText, activeTab === 'truck' && styles.tabTextActive]}>Auto dati</Text>
            </Pressable>
          </View>

          {/* Basic data tab */}
          {activeTab === 'basic' && (
            <View style={styles.tabContent}>
              <FormInput
                label="E-pasts"
                value={formData.email}
                onChangeText={(value) => {
                  updateFormData('email', value);
                  updateFormData('username', value);
                }}
                placeholder="Ievadiet e-pastu"
                keyboardType="email-address"
                autoCapitalize="none"
                error={formErrors.email}
                autocomplete="email"
                textContentType="emailAddress"
                autoCompleteType="email"
              />

              <FormInput
                label="Vārds"
                value={formData.firstName}
                onChangeText={(value) => updateFormData('firstName', value)}
                placeholder="Ievadiet vārdu"
                autoCapitalize="words"
                error={formErrors.firstName}
                autocomplete="given-name"
                textContentType="givenName"
                autoCompleteType="name"
              />

              <FormInput
                label="Uzvārds"
                value={formData.lastName}
                onChangeText={(value) => updateFormData('lastName', value)}
                placeholder="Ievadiet uzvārdu"
                autoCapitalize="words"
                error={formErrors.lastName}
                autocomplete="family-name"
                textContentType="familyName"
                autoCompleteType="name"
              />

              <CompanySearch
                label="Uzņēmuma nosaukums"
                value={companyName}
                onSelect={(registrationNumber, name) => {
                  updateFormData('organizationRegistrationNumber', registrationNumber);
                  if (name) {
                    setCompanyName(name);
                  }
                }}
                errorMessage={!isConnected ? "Uzņēmumu meklēšana nav pieejama offline režīmā" : formErrors.organizationRegistrationNumber}
                disabled={!isConnected}
              />

              <FormInput
                label="Parole"
                value={formData.password}
                onChangeText={(value) => updateFormData('password', value)}
                placeholder="Ievadiet paroli"
                secureTextEntry
                error={formErrors.password}
                autocomplete="new-password"
                textContentType="newPassword"
                autoCompleteType="password"
              />
            </View>
          )}

          {/* Truck data tab */}
          {activeTab === 'truck' && (
            <View style={styles.tabContent}>
              <FormInput
                label="Kravas auto ražotājs"
                value={formData.truckMaker}
                onChangeText={(value) => updateFormData('truckMaker', value)}
                placeholder="Ievadiet ražotāju"
                error={formErrors.truckMaker}
                autocomplete="organization"
              />

              <FormInput
                label="Kravas auto modelis"
                value={formData.truckModel}
                onChangeText={(value) => updateFormData('truckModel', value)}
                placeholder="Ievadiet modeli"
                error={formErrors.truckModel}
                autocomplete="off"
              />

              <FormInput
                label="Reģistrācijas numurs"
                value={formData.truckRegistrationNumber}
                onChangeText={(value) => updateFormData('truckRegistrationNumber', value)}
                placeholder="Ievadiet reģistrācijas numuru"
                error={formErrors.truckRegistrationNumber}
                autocomplete="off"
              />

              <FormInput
                label="Degvielas patēriņa norma (l/100km)"
                value={formData.fuelConsumptionNorm}
                onChangeText={(value) => updateFormData('fuelConsumptionNorm', value)}
                placeholder="Ievadiet degvielas patēriņa normu"
                keyboardType="numeric"
                error={formErrors.fuelConsumptionNorm}
              />
            </View>
          )}
          {/* Paziņojums par offline režīmu */}
          {!isConnected && (
            <Text style={styles.offlineMessage}>
              Reģistrācija nav pieejama offline režīmā. Lūdzu, pievienojieties internetam, lai reģistrētos.
            </Text>
          )}

          {/* Vispārīgā kļūda - parādās tikai web platformā */}
          {Platform.OS === 'web' && generalError ? (
            <Text style={styles.errorMessage}>
              {generalError}
            </Text>
          ) : null}

          <Button
            title="Reģistrēties"
            onPress={handleRegister}
            loading={loading}
            disabled={!isConnected || loading}
            style={styles.registerButton}
          />

          <BackButton
            title="Atpakaļ uz pieslēgšanos"
            onPress={handleLogin}
            style={styles.loginButton}
          />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type Styles = {
  container: ViewStyle;
  content: ViewStyle;
  heading: TextStyle;
  logo: ImageStyle;
  title: TextStyle;
  subtitle: TextStyle;
  registerButton: ViewStyle;
  loginButton: ViewStyle;
  tabContainer: ViewStyle;
  tabButton: ViewStyle;
  tabButtonActive: ViewStyle;
  tabText: TextStyle;
  tabTextActive: TextStyle;
  tabContent: ViewStyle;
  offlineMessage: TextStyle;
  errorMessage: TextStyle;
};

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  content: Platform.OS === 'web' ? {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginVertical: 24,
    width: '100%' as const,
    maxWidth: CONTAINER_WIDTH.web,
    alignSelf: 'center' as const,
  } : {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginVertical: 24,
    width: CONTAINER_WIDTH.mobile,
	alignSelf: 'center' as const,
  },
  heading: {
    fontSize: 32,
    fontFamily: FONT.bold,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 200,
    height: 60,
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: FONT.semiBold,
    color: COLORS.white,
    marginTop: 40,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: FONT.regular,
    color: COLORS.gray,
    marginBottom: 28,
  },
  registerButton: {
    marginTop: 28,
  },
  loginButton: {
    marginTop: 16,
  },
  tabContainer: Platform.OS === 'web' ? {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.black200,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  } : {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.black200,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)', // Increased opacity for mobile
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  tabButtonActive: Platform.OS === 'web' ? {
    backgroundColor: COLORS.secondary,
  } : {
    backgroundColor: COLORS.secondary,
  },
  tabText: {
    fontSize: 14,
    fontFamily: FONT.medium,
    color: COLORS.gray,
  },
  tabTextActive: {
    color: COLORS.white,
    fontFamily: FONT.semiBold,
  },
  tabContent: {
    paddingTop: 8,
  },
  offlineMessage: {
    color: '#FF6B6B', // Sarkana krāsa brīdinājumam
    fontFamily: FONT.medium,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  errorMessage: {
    color: '#FF6B6B', // Sarkana krāsa kļūdas paziņojumam
    fontFamily: FONT.medium,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 8,
    padding: 10,
    backgroundColor: 'rgba(255, 107, 107, 0.1)', // Viegls sarkans fons
    borderRadius: 8,
  },
});
