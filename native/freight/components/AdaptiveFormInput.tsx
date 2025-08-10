import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardTypeOptions, TextInputProps } from 'react-native';
import { usePlatform } from '../hooks/usePlatform';
import { tokens } from '../styles/tokens';

interface AdaptiveFormInputProps extends Omit<TextInputProps, 'style' | 'autoComplete'> {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: TextInputProps['autoComplete'];
  textContentType?: any;
  autoCompleteType?: string;
  required?: boolean;
}

export const AdaptiveFormInput: React.FC<AdaptiveFormInputProps> = ({
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
  autoCompleteType,
  required = false,
  ...props
}) => {
  const { isWeb, deviceType } = usePlatform();
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  // Web-optimized styles
  const getInputClasses = () => {
    const baseClasses = [
      'w-full',
      'px-4 py-3',
      'rounded-lg',
      'font-pregular',
      'transition-all duration-200',
    ];

    if (isWeb) {
      baseClasses.push(
        'form-input',
        'border-2',
        error ? 'border-error-500' : isFocused ? 'border-primary-500' : 'border-neutral-300',
        'bg-white',
        'text-neutral-900',
        'placeholder-neutral-500',
        'focus:outline-none',
        'focus:ring-0',
        error ? 'focus:border-error-500' : 'focus:border-primary-500',
        'hover:border-neutral-400'
      );
    } else {
      // Mobile styles
      baseClasses.push(
        'bg-neutral-100',
        'text-neutral-900',
        'border',
        error ? 'border-error-500' : 'border-neutral-300'
      );
    }

    return baseClasses.join(' ');
  };

  const getLabelClasses = () => {
    const baseClasses = [
      'font-pmedium',
      'mb-2',
      'block',
    ];

    if (isWeb) {
      baseClasses.push(
        'text-sm',
        'text-neutral-700'
      );
      if (required) {
        baseClasses.push("after:content-['*'] after:text-error-500 after:ml-1");
      }
    } else {
      baseClasses.push(
        'text-base',
        'text-neutral-800'
      );
    }

    return baseClasses.join(' ');
  };

  const getContainerClasses = () => {
    return isWeb ? 'mb-6' : 'mb-4';
  };

  return (
    <View className={getContainerClasses()}>
      {/* Label */}
      <Text className={getLabelClasses()}>
        {label}
        {required && isWeb && <Text className="text-error-500 ml-1">*</Text>}
      </Text>

      {/* Input Container */}
      <View className="relative">
        <TextInput
          className={getInputClasses()}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder || label}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          textContentType={textContentType}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={{
            fontSize: isWeb ? tokens.typography.fontSize.base.size : 16,
            lineHeight: isWeb ? tokens.typography.fontSize.base.lineHeight : 20,
            fontFamily: 'Poppins-Regular',
            minHeight: isWeb ? 48 : 44,
          }}
          {...props}
        />

        {/* Password visibility toggle */}
        {secureTextEntry && (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
            style={{ marginTop: -10 }}
          >
            <Text className="text-lg text-neutral-500">
              {isPasswordVisible ? '🙈' : '👁️'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Error Message */}
      {error && (
        <View className="mt-2">
          <Text className={`text-error-500 font-pregular ${
            isWeb ? 'text-sm' : 'text-sm'
          }`}>
            {error}
          </Text>
        </View>
      )}

      {/* Focus indicator removed to prevent layout issues */}
    </View>
  );
};

export default AdaptiveFormInput;