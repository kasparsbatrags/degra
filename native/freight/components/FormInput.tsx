import React from 'react'
import {StyleSheet, Text, TextInput, View} from 'react-native'
import {formStyles} from '../constants/styles'
import {COLORS} from '../constants/theme'

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
    <View style={formStyles.inputContainer}>
      <Text style={formStyles.label}>{label}</Text>
      <TextInput
        style={[
          formStyles.input,
          error && formStyles.inputError,
          !editable && styles.disabledInput,
          multiline && { height: numberOfLines * 24 + 24 }, // 24 is line height
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.text.tertiary}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        editable={editable}
        multiline={multiline}
        numberOfLines={numberOfLines}
      />
      {error && <Text style={formStyles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  disabledInput: {
    opacity: 0.5,
    backgroundColor: COLORS.gray3,
  },
});

export default FormInput;
