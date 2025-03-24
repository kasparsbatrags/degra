import {useRouter} from 'expo-router'
import React, {useState} from 'react'
import {
	Alert,
	Dimensions,
	Image,
	ImageStyle,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextStyle,
	View,
	ViewStyle,
} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import BackButton from '../../components/BackButton'
import Button from '../../components/Button'
import CompanySearch from '../../components/CompanySearch'
import FormInput from '../../components/FormInput'
import {images} from '../../constants/assets'
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
  const { register } = useAuth();
  const router = useRouter();

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

    // Validate each field
    let hasErrors = false;
    const newErrors = { ...formErrors };

    if (!formData.email) {
      newErrors.email = 'Lūdzu, ievadiet e-pastu';
      hasErrors = true;
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Nepareizs e-pasta formāts. Lūdzu, ievadiet derīgu e-pastu.';
      hasErrors = true;
    }

    if (!formData.firstName) {
      newErrors.firstName = 'Ievadiet vārdu';
      hasErrors = true;
    }

    if (!formData.lastName) {
      newErrors.lastName = 'Ievadiet uzvārdu';
      hasErrors = true;
    }

    if (!formData.organizationRegistrationNumber || !companyName) {
      newErrors.organizationRegistrationNumber = 'Izvēlieties uzņēmumu';
      hasErrors = true;
    }

    if (!formData.password) {
      newErrors.password = 'Ievadiet paroli';
      hasErrors = true;
    }
	const passwordErrors = validatePassword(formData.password);
	if (passwordErrors.length > 0) {
	  newErrors.password = passwordErrors.join('\n');
	  hasErrors = true;
	}

    // Validate truck data fields
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

    if (hasErrors || hasTruckErrors) {
      setFormErrors(newErrors);
      
      // If there are truck errors, switch to the truck tab
      if (hasTruckErrors) {
        setActiveTab('truck');
      }
      
      return;
    }

    try {
      setLoading(true);
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
      Alert.alert(
        'Kļūda',
        error.message || 'Neizdevās reģistrēties. Lūdzu, mēģiniet vēlreiz.'
      );
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
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View
          style={[
            styles.content,
            {
              minHeight: Dimensions.get("window").height - 100,
            },
          ]}
        >

          <Image
            source={images.logo}
            resizeMode="contain"
            style={styles.logo}
          />
          <Text style={styles.title}>
            Reģistrēties
          </Text>

          <Text style={styles.subtitle}>
            Izveidojiet jaunu kontu, lai sāktu lietot sistēmu
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
              />

              <FormInput
                label="Vārds"
                value={formData.firstName}
                onChangeText={(value) => updateFormData('firstName', value)}
                placeholder="Ievadiet vārdu"
                autoCapitalize="words"
                error={formErrors.firstName}
              />

              <FormInput
                label="Uzvārds"
                value={formData.lastName}
                onChangeText={(value) => updateFormData('lastName', value)}
                placeholder="Ievadiet uzvārdu"
                autoCapitalize="words"
                error={formErrors.lastName}
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
                errorMessage={formErrors.organizationRegistrationNumber}
              />

              <FormInput
                label="Parole"
                value={formData.password}
                onChangeText={(value) => updateFormData('password', value)}
                placeholder="Ievadiet paroli"
                secureTextEntry
                error={formErrors.password}
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
              />

              <FormInput
                label="Kravas auto modelis"
                value={formData.truckModel}
                onChangeText={(value) => updateFormData('truckModel', value)}
                placeholder="Ievadiet modeli"
                error={formErrors.truckModel}
              />

              <FormInput
                label="Reģistrācijas numurs"
                value={formData.truckRegistrationNumber}
                onChangeText={(value) => updateFormData('truckRegistrationNumber', value)}
                placeholder="Ievadiet reģistrācijas numuru"
                error={formErrors.truckRegistrationNumber}
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
          <Button
            title="Reģistrēties"
            onPress={handleRegister}
            loading={loading}
            style={styles.registerButton}
          />

          <BackButton
            title="Atpakaļ uz pieslēgšanos"
            onPress={handleLogin}
            style={styles.loginButton}
          />
        </View>
      </ScrollView>
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
});
