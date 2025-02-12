import {Platform, StyleSheet} from 'react-native'
import {BORDER_RADIUS, COLORS, FONT, SHADOWS, SIZES, SPACING} from './theme'
import {WEB_BORDER_RADIUS, WEB_COMPONENT_SIZES, WEB_SIZES, WEB_SPACING} from './webStyles'

// Use platform-specific sizes
const sizes = Platform.select({ web: WEB_SIZES, default: SIZES })
const spacing = Platform.select({ web: WEB_SPACING, default: SPACING })
const borderRadius = Platform.select({ web: WEB_BORDER_RADIUS, default: BORDER_RADIUS })

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
    padding: spacing.m,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
	  gap: 16,
	  paddingBottom: 0,
	  marginBbottom: 0,
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
    borderRadius: borderRadius.m,
    padding: spacing.m,
    ...SHADOWS.small,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: sizes.xLarge,
    color: COLORS.text.primary,
  },
  subtitle: {
    fontFamily: FONT.medium,
    fontSize: sizes.large,
    color: COLORS.text.secondary,
  },
  text: {
    fontFamily: FONT.regular,
    fontSize: sizes.medium,
    color: COLORS.text.primary,
  },
  textSecondary: {
    fontFamily: FONT.regular,
    fontSize: sizes.medium,
    color: COLORS.text.secondary,
  },
  input: {
    height: Platform.select({ web: WEB_COMPONENT_SIZES.input, default: 48 }),
    backgroundColor: COLORS.background.secondary,
    borderRadius: borderRadius.s,
    paddingHorizontal: spacing.m,
    fontFamily: FONT.regular,
    fontSize: sizes.medium,
    color: COLORS.text.primary,
  },
  inputError: {
    borderColor: COLORS.error,
    borderWidth: 1,
  },
  errorText: {
    fontFamily: FONT.regular,
    fontSize: sizes.small,
    color: COLORS.error,
    marginTop: spacing.xs,
  },
  button: {
    height: Platform.select({ web: WEB_COMPONENT_SIZES.button, default: 48 }),
    borderRadius: borderRadius.s,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
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
    fontSize: sizes.medium,
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
    marginVertical: spacing.m,
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
    padding: spacing.m,
  },
  inputContainer: {

  },
  label: {
    fontFamily: FONT.medium,
    fontSize: sizes.medium,
    color: COLORS.text.primary,
    marginBottom: spacing.xs,
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
    marginTop: spacing.m,
  },
});

export default {
  commonStyles,
  formStyles,
};
