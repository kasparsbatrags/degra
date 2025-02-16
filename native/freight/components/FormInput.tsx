import {icons} from '@/constants/assets'
import {formStyles} from '@/constants/styles'
import {COLORS, FONT} from '@/constants/theme'
import React, {useState} from 'react'
import {Image, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native'

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
}) => {
  const [showPassword, setShowPassword] = useState(false);
  
  if (!visible) {
    return null;
  }
  
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            error && styles.inputError,
            disabled && formStyles.inputDisabled,
            multiline && { height: numberOfLines * 24 + 24 },
            secureTextEntry && { paddingRight: 50 }
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.gray}
          secureTextEntry={secureTextEntry && !showPassword}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          editable={!disabled && editable}
          multiline={multiline}
          numberOfLines={numberOfLines}
        />
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
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    position: 'relative',
  },
  container: {
    marginBottom: 16,
    marginTop: 28,
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
