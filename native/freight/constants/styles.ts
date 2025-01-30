import {StyleSheet} from 'react-native'
import {BORDER_RADIUS, COLORS, FONT, SHADOWS, SIZES, SPACING} from './theme'

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  content: {
    flex: 1,
    padding: SPACING.m,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  card: {
    backgroundColor: COLORS.background.primary,
    borderRadius: BORDER_RADIUS.m,
    padding: SPACING.m,
    ...SHADOWS.small,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: SIZES.xLarge,
    color: COLORS.text.primary,
  },
  subtitle: {
    fontFamily: FONT.medium,
    fontSize: SIZES.large,
    color: COLORS.text.secondary,
  },
  text: {
    fontFamily: FONT.regular,
    fontSize: SIZES.medium,
    color: COLORS.text.primary,
  },
  textSecondary: {
    fontFamily: FONT.regular,
    fontSize: SIZES.medium,
    color: COLORS.text.secondary,
  },
  input: {
    height: 48,
    backgroundColor: COLORS.background.secondary,
    borderRadius: BORDER_RADIUS.s,
    paddingHorizontal: SPACING.m,
    fontFamily: FONT.regular,
    fontSize: SIZES.medium,
    color: COLORS.text.primary,
  },
  inputError: {
    borderColor: COLORS.error,
    borderWidth: 1,
  },
  errorText: {
    fontFamily: FONT.regular,
    fontSize: SIZES.small,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
  button: {
    height: 48,
    borderRadius: BORDER_RADIUS.s,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.m,
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
  buttonText: {
    fontFamily: FONT.medium,
    fontSize: SIZES.medium,
    color: COLORS.white,
  },
  buttonTextOutline: {
    color: COLORS.primary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border.default,
    marginVertical: SPACING.m,
  },
  shadow: {
    ...SHADOWS.small,
  },
  shadowMedium: {
    ...SHADOWS.medium,
  },
});

export const formStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.m,
  },
  inputContainer: {
    marginBottom: SPACING.m,
  },
  label: {
    fontFamily: FONT.medium,
    fontSize: SIZES.medium,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  input: {
    ...commonStyles.input,
  },
  inputError: {
    ...commonStyles.inputError,
  },
  errorText: {
    ...commonStyles.errorText,
  },
  submitButton: {
    marginTop: SPACING.m,
  },
});

export default {
  commonStyles,
  formStyles,
};
