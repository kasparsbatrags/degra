import React from 'react'
import {StyleSheet, Text, TextInput, View} from 'react-native'
import {COLORS, FONT} from '../constants/theme'

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
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          error && styles.inputError,
          !editable && styles.disabledInput,
          multiline && { height: numberOfLines * 24 + 24 },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.gray}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        editable={editable}
        multiline={multiline}
        numberOfLines={numberOfLines}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
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
  },
  inputError: {
    borderColor: COLORS.error,
    borderWidth: 1,
  },
  disabledInput: {
    opacity: 0.5,
  },
  errorText: {
    fontFamily: FONT.regular,
    fontSize: 14,
    color: COLORS.error,
    marginTop: 4,
  },
});

export default FormInput;
