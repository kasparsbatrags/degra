import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { usePlatform } from '../hooks/usePlatform';

interface ModernButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const ModernButton: React.FC<ModernButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'md',
  fullWidth = true,
}) => {
  const { isWeb } = usePlatform();

  // Size configurations
  const sizeConfig = {
    sm: { height: 44, paddingHorizontal: 16, fontSize: 14 },
    md: { height: 52, paddingHorizontal: 24, fontSize: 16 },
    lg: { height: 60, paddingHorizontal: 32, fontSize: 18 },
  };

  const config = sizeConfig[size];

  // Base styles
  const baseButtonStyle: any = {
    height: config.height,
    borderRadius: 16,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingHorizontal: config.paddingHorizontal,
    ...(fullWidth && { width: '100%' }),
    opacity: disabled || loading ? 0.6 : 1,
  };

  // Variant styles
  const getVariantStyle = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: '#3b82f6',
          shadowColor: '#3b82f6',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 6,
        };
      case 'secondary':
        return {
          backgroundColor: '#f3f4f6',
          borderWidth: 1,
          borderColor: '#d1d5db',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: '#3b82f6',
        };
      default:
        return {};
    }
  };

  const buttonStyle = {
    ...baseButtonStyle,
    ...getVariantStyle(),
  };

  // Text styles
  const getTextColor = () => {
    switch (variant) {
      case 'primary':
        return '#ffffff';
      case 'secondary':
        return '#374151';
      case 'outline':
        return '#3b82f6';
      default:
        return '#ffffff';
    }
  };

  const textStyle = {
    fontSize: config.fontSize,
    fontFamily: 'Poppins-SemiBold',
    color: getTextColor(),
  };

  // Loading indicator color
  const getLoadingColor = () => {
    return variant === 'primary' ? '#ffffff' : '#3b82f6';
  };

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {/* Loading Indicator */}
      {loading && (
        <ActivityIndicator
          size="small"
          color={getLoadingColor()}
          style={{ marginRight: 8 }}
        />
      )}

      {/* Button Text */}
      <Text style={textStyle}>
        {loading ? 'Notiek...' : title}
      </Text>
    </TouchableOpacity>
  );
};

export default ModernButton;