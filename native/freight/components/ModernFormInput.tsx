import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { usePlatform } from '../hooks/usePlatform';

interface ModernFormInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: any;
  autoCapitalize?: any;
  autoComplete?: any;
  textContentType?: any;
  required?: boolean;
  rightIcon?: string;
  showPassword?: boolean;
}

export const ModernFormInput: React.FC<ModernFormInputProps> = ({
  label,
  value,
  onChangeText,
  error,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoComplete,
  textContentType,
  required = false,
  rightIcon,
  showPassword = false,
}) => {
  const { isWeb } = usePlatform();
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);
  const togglePasswordVisibility = () => setIsPasswordVisible(!isPasswordVisible);

  // Modern styling
  const containerStyle = {
    marginBottom: 20,
  };

  const labelStyle = {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#374151',
    marginBottom: 6,
  };

  const inputContainerStyle = {
    position: 'relative' as const,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#ffffff',
    borderWidth: error ? 2 : isFocused ? 2 : 0,
    borderColor: error ? '#ef4444' : isFocused ? '#000000' : 'transparent',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 0,
    minHeight: 52,
    shadowColor: isFocused ? '#000000' : '#000',
    shadowOffset: { width: 0, height: isFocused ? 2 : 0 },
    shadowOpacity: isFocused ? 0.15 : 0,
    shadowRadius: isFocused ? 4 : 0,
    elevation: isFocused ? 4 : 0,
    ...(isFocused && {
      // Additional focus styling for web
      outline: 'none',
      boxShadow: '0 0 0 2px rgba(0, 0, 0, 0.1)',
    }),
  };

  const inputStyle = {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#1f2937',
    paddingVertical: 16,
    paddingRight: (secureTextEntry && showPassword) || rightIcon ? 45 : 0,
	outlineStyle: 'none',
  };

  const errorStyle = {
    marginTop: 6,
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#ef4444',
  };

  return (
    <View style={containerStyle}>
      {/* Label */}
      <Text style={labelStyle}>
        {label}
        {required && <Text style={{ color: '#ef4444' }}> *</Text>}
      </Text>

      {/* Input Container */}
      <View style={inputContainerStyle}>
        {/* Input */}
        <TextInput
          style={inputStyle}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder || label}
          placeholderTextColor="#9ca3af"
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          textContentType={textContentType}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />

        {/* Password visibility toggle or custom right icon */}
        {(secureTextEntry && showPassword) && (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={{
              position: 'absolute',
              right: 16,
              width: 24,
              height: 24,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 18, color: '#9ca3af' }}>
              {isPasswordVisible ? '👁' : '👁'}
            </Text>
          </TouchableOpacity>
        )}
        
        {/* Custom right icon (when not password field) */}
        {rightIcon && !secureTextEntry && (
          <View style={{
            position: 'absolute',
            right: 16,
            width: 24,
            height: 24,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Text style={{ fontSize: 18, color: '#9ca3af' }}>
              {rightIcon}
            </Text>
          </View>
        )}
      </View>

      {/* Error Message */}
      {error && <Text style={errorStyle}>{error}</Text>}
    </View>
  );
};

export default ModernFormInput;