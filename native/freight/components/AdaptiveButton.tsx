import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { usePlatform } from '../hooks/usePlatform';
import { tokens } from '../styles/tokens';

interface AdaptiveButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: string;
  className?: string;
}

export const AdaptiveButton: React.FC<AdaptiveButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'md',
  fullWidth = true,
  icon,
  className = '',
}) => {
  const { isWeb } = usePlatform();

  const getButtonClasses = () => {
    const baseClasses = [
      'rounded-lg',
      'font-pmedium',
      'transition-all duration-200',
      'flex flex-row items-center justify-center',
      fullWidth ? 'w-full' : 'self-start',
      disabled || loading ? 'opacity-50' : '',
    ];

    // Size classes
    switch (size) {
      case 'sm':
        baseClasses.push('px-4 py-2');
        break;
      case 'lg':
        baseClasses.push('px-8 py-4');
        break;
      default: // md
        baseClasses.push('px-6 py-3');
    }

    // Variant classes
    switch (variant) {
      case 'primary':
        baseClasses.push(
          'bg-primary-500',
          isWeb ? 'hover:bg-primary-600 active:bg-primary-700' : ''
        );
        break;
      case 'secondary':
        baseClasses.push(
          'bg-secondary-500',
          isWeb ? 'hover:bg-secondary-600 active:bg-secondary-700' : ''
        );
        break;
      case 'outline':
        baseClasses.push(
          'bg-transparent border-2 border-primary-500',
          isWeb ? 'hover:bg-primary-50 active:bg-primary-100' : '',
          isWeb ? 'hover:border-primary-600' : ''
        );
        break;
      case 'danger':
        baseClasses.push(
          'bg-error-500',
          isWeb ? 'hover:bg-error-600 active:bg-error-700' : ''
        );
        break;
    }

    // Web-specific classes
    if (isWeb) {
      baseClasses.push(
        'cursor-pointer',
        'select-none',
        disabled || loading ? 'cursor-not-allowed' : '',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        variant === 'primary' ? 'focus:ring-primary-500' :
        variant === 'secondary' ? 'focus:ring-secondary-500' :
        variant === 'danger' ? 'focus:ring-error-500' :
        'focus:ring-primary-500'
      );
    }

    return [...baseClasses, className].filter(Boolean).join(' ');
  };

  const getTextClasses = () => {
    const baseClasses = ['font-pmedium'];

    // Size-based text classes
    switch (size) {
      case 'sm':
        baseClasses.push('text-sm');
        break;
      case 'lg':
        baseClasses.push('text-lg');
        break;
      default: // md
        baseClasses.push('text-base');
    }

    // Variant-based text classes
    switch (variant) {
      case 'outline':
        baseClasses.push('text-primary-500');
        break;
      default:
        baseClasses.push('text-white');
    }

    return baseClasses.join(' ');
  };

  const getLoadingSize = () => {
    switch (size) {
      case 'sm': return 16;
      case 'lg': return 24;
      default: return 20;
    }
  };

  return (
    <TouchableOpacity
      className={getButtonClasses()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={{
        minHeight: size === 'sm' ? tokens.components.button.height.sm :
                   size === 'lg' ? tokens.components.button.height.xl :
                   tokens.components.button.height.md,
      }}
    >
      {loading && (
        <View className="mr-2">
          <ActivityIndicator 
            size={getLoadingSize()} 
            color={variant === 'outline' ? tokens.colors.primary[500] : 'white'}
          />
        </View>
      )}

      {icon && !loading && (
        <Text className="mr-2 text-lg">{icon}</Text>
      )}

      <Text className={getTextClasses()}>
        {loading ? 'Notiek...' : title}
      </Text>
    </TouchableOpacity>
  );
};

export default AdaptiveButton;