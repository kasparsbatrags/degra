import React from 'react'
import {Platform, StyleProp, StyleSheet, ViewStyle} from 'react-native'
import {COLORS, SHADOWS} from '../constants/theme'
import Button from './Button'

interface BackButtonProps {
  onPress: () => void;
  title?: string;
  style?: StyleProp<ViewStyle>;
}

const BackButton: React.FC<BackButtonProps> = ({
  onPress,
  title = 'Atpakaļ',
  style,
}) => {
  return (
    <Button
      title={title}
      onPress={onPress}
      variant="outline"
      style={[styles.backButton, style, { borderColor: COLORS.secondary, borderWidth: 1 }]}
    />
  );
};

const styles = StyleSheet.create({
  backButton: Platform.OS === 'web' ? {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.secondary,
    ...SHADOWS.small,
  } : {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.secondary,
    ...SHADOWS.medium,
  },
});

export default BackButton;
