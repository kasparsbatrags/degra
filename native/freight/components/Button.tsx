import React from 'react'
import {ActivityIndicator, StyleProp, StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle,} from 'react-native'
import * as Animatable from 'react-native-animatable'
import {COLORS} from '../constants/theme'

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  animate?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  onPress,
  title,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
  animate = false,
}) => {
  const buttonStyles = [
    styles.button,
    variant === 'secondary' && styles.buttonSecondary,
    variant === 'outline' && styles.buttonOutline,
    variant === 'primary' && styles.buttonPrimary,
    (disabled || loading) && styles.buttonDisabled,
    style,
  ];

  const textStyles = [
    styles.buttonText,
    variant === 'outline' && styles.buttonTextOutline,
    textStyle,
  ];

  const content = loading ? (
    <ActivityIndicator
      color={variant === 'outline' ? COLORS.primary : COLORS.white}
      size="small"
    />
  ) : (
    <Text style={textStyles}>{title}</Text>
  );

  if (animate) {
    const AnimatedButton = Animatable.createAnimatableComponent(TouchableOpacity);
    return (
      <AnimatedButton
        animation="pulse"
        iterationCount="infinite"
        duration={1000}
        style={buttonStyles}
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        {content}
      </AnimatedButton>
    );
  }

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {content}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  buttonPrimary: {
    backgroundColor: COLORS.primary,
  },
  buttonSecondary: {
    backgroundColor: COLORS.secondary,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  buttonTextOutline: {
    color: COLORS.primary,
  },
});

export default Button;
