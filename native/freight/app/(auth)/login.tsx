import {Link, useRouter} from 'expo-router'
import {useState} from 'react'
import {Dimensions, Image, ImageStyle, Platform, ScrollView, StyleSheet, Text, TextStyle, View, ViewStyle} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import Button from '../../components/Button'
import FormInput from '../../components/FormInput'

import {images} from '../../constants/assets'
import {COLORS, CONTAINER_WIDTH, FONT} from '../../constants/theme'
import {useAuth} from '../../context/AuthContext'

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState({
    email: "",
    password: "",
  });
  const router = useRouter();
  
  // Function to validate email format
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

	const handleLogin = async () => {
		setFormErrors({ email: "", password: "" });

		const { email, password } = form;
		let emailError = "";
		let passwordError = "";

		if (!email) emailError = "Lūdzu, ievadiet e-pastu";
		if (!password) passwordError = "Lūdzu, ievadiet paroli";

		if (emailError || passwordError) {
			setFormErrors({ email: emailError, password: passwordError });
			return;
		}

		if (!isValidEmail(email)) {
			setFormErrors({
				email: "Nepareizs e-pasta formāts. Lūdzu, ievadiet derīgu e-pastu.",
				password: "",
			});
			return;
		}

		try {
			setLoading(true);
			await signIn(email, password);
		} catch (error: any) {
			const message = error.message || "";

			if (message.includes("Invalid credentials") || message === "Nepareizs e-pasts vai parole") {
				setFormErrors({
					email: "",
					password: "Nepareiza parole. Lūdzu, pārbaudiet un mēģiniet vēlreiz.",
				});
			} else if (message.includes("Invalid email or password")) {
				setFormErrors({
					email: "",
					password: "Nepareizs e-pasts vai parole. Lūdzu, pārbaudiet un mēģiniet vēlreiz.",
				});
			} else {
				setFormErrors({
					email: "",
					password: "Neizdevās pieslēgties - serveris neatbild. Lūdzu, mēģiniet vēlreiz mazliet vēlāk!",
				});
			}
		} finally {
			setLoading(false);
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

			<Text style={styles.heading}>
				Krava
			</Text>
			<Text style={styles.titleCenter}>
				Auto izmantošanas uzskaites sistēma
			</Text>
          <FormInput
            label="E-pasts"
            value={form.email}
            onChangeText={(e) => {
              setForm({ ...form, email: e });
              setFormErrors({ ...formErrors, email: "" });
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            error={formErrors.email}
            autocomplete="email"
            textContentType="emailAddress"
            autoCompleteType="email"
          />

          <FormInput
            label="Parole"
            value={form.password}
            onChangeText={(e) => {
              setForm({ ...form, password: e });
              setFormErrors({ ...formErrors, password: "" });
            }}
            secureTextEntry
            error={formErrors.password}
            autocomplete="current-password"
            textContentType="password"
            autoCompleteType="password"
          />

          <Button
            title="Pieslēgties"
            onPress={handleLogin}
            loading={loading}
            style={styles.loginButton}
          />

          <View style={styles.registerContainer}>
            <Link
              href="/register"
              style={styles.registerLink}
            >
              Reģistrēties
            </Link>
          </View>
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
  titleCenter: TextStyle;
  loginButton: ViewStyle;
  registerContainer: ViewStyle;
  registerText: TextStyle;
  registerLink: TextStyle;
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
  },
  logo: {
    width: 60,
    height: 60,
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: FONT.semiBold,
    color: COLORS.white,
    marginTop: 40,
    marginBottom: 28,
  },
	titleCenter: {
		fontSize: 24,
		fontFamily: FONT.semiBold,
		color: COLORS.white,
		marginTop: 5,
		marginBottom: 28,
		textAlign: 'center',
	},
  loginButton: {
    marginTop: 28,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
    gap: 8,
  },
  registerText: {
    fontSize: 18,
    fontFamily: FONT.regular,
    color: COLORS.gray,
  },
  registerLink: {
    fontSize: 18,
    fontFamily: FONT.semiBold,
    color: COLORS.secondary,
  },
});
