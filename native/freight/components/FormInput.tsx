import {icons} from '@/constants/assets'
import {formStyles} from '@/constants/styles'
import {COLORS, FONT} from '@/constants/theme'
import React, {useState} from 'react'
import {Image, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native'
import {handleUserActivity, ACTIVITY_LEVELS} from '../utils/userActivityTracker'

interface FormInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  editable?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  disabled?: boolean;
  visible?: boolean;
  // Autocomplete props
  autocomplete?: string; // Web platform
  textContentType?: string; // iOS platform
  autoCompleteType?: string; // Android platform
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  error,
  autoCapitalize = 'none',
  keyboardType = 'default',
  editable = true,
  multiline = false,
  numberOfLines = 1,
  disabled = false,
  visible = true,
  // Autocomplete props
  autocomplete,
  textContentType,
  autoCompleteType,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  
  if (!visible) {
    return null;
  }
  
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        {Platform.OS === 'web' ? (
          // For web, use a regular input element with HTML autocomplete
          <input
            style={{
              height: 48,
              backgroundColor: COLORS.black100,
              borderRadius: 8,
              paddingLeft: 16,
			  paddingRight: secureTextEntry && Platform.OS !== 'web' ? 50 : 16,
              fontFamily: FONT.regular,
              fontSize: 16,
              color: COLORS.white,
              border: error ? `1px solid ${COLORS.error}` : 'none',
              outline: 'none',
            }}
            value={value}
            onChange={(e) => {
              // Call handleUserActivity when user inputs text
              handleUserActivity(ACTIVITY_LEVELS.HIGH);
              onChangeText(e.target.value);
            }}
            placeholder={placeholder}
            type={secureTextEntry && !showPassword ? 'password' : keyboardType === 'email-address' ? 'email' : keyboardType === 'numeric' ? 'number' : 'text'}
            autoCapitalize={autoCapitalize}
            disabled={disabled || !editable}
            autoComplete={autocomplete}
          />
        ) : (
          // For native platforms, use React Native TextInput
          <TextInput
            style={[
              styles.input,
              error && styles.inputError,
              disabled && formStyles.inputDisabled,
              multiline && { height: numberOfLines * 24 + 24 },
              secureTextEntry && { paddingRight: 50 }
            ]}
            value={value}
            onChangeText={(text) => {
              // Call handleUserActivity when user inputs text
              handleUserActivity(ACTIVITY_LEVELS.HIGH);
              onChangeText(text);
            }}
            placeholder={placeholder}
            placeholderTextColor={COLORS.gray}
            secureTextEntry={secureTextEntry && !showPassword}
            autoCapitalize={autoCapitalize}
            keyboardType={keyboardType}
            editable={!disabled && editable}
            multiline={multiline}
            numberOfLines={numberOfLines}
            // Apply platform-specific props only if they're provided
            {...(Platform.OS === 'ios' && textContentType ? 
              // Cast to any to avoid TypeScript errors
              { textContentType: textContentType as any } : 
              autoCompleteType ? { autoCompleteType } : {}
            )}
          />
        )}
        {secureTextEntry && (
          <TouchableOpacity 
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Image 
              source={showPassword ? icons.eyeHide : icons.eye}
              style={styles.icon}
            />
          </TouchableOpacity>
        )}
      </View>
		{typeof error === 'string' && error.trim() !== '' && (
				<Text style={styles.errorText}>{error}</Text>
		)}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    position: 'relative',
  },
  container: {
    marginBottom: 16,
    marginTop: 8,
  },
  label: {
    fontFamily: FONT.medium,
    fontSize: 16,
    color: COLORS.white,
    marginBottom: 8,
  },
  input: {
    height: 48,
    backgroundColor: COLORS.black100,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontFamily: FONT.regular,
    fontSize: 16,
    color: COLORS.white,
    width: '100%',
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 12,
    height: 24,
    width: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: COLORS.gray,
  },
  inputError: {
    borderColor: COLORS.error,
    borderWidth: 1,
  },
  errorText: {
    fontFamily: FONT.regular,
    fontSize: 14,
    color: COLORS.error,
    marginTop: 4,
  },
});

export default FormInput;
