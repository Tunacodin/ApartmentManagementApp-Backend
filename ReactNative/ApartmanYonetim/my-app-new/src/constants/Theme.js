import { DefaultTheme } from 'react-native-paper';
import Colors, { Gradients } from './Colors';
import Fonts from './Fonts';

const Theme = {
  ...DefaultTheme,
  fonts: {
    ...DefaultTheme.fonts,
    // React Native Paper font variants
    headlineLarge: {
      fontFamily: Fonts.urbanist.bold,
    },
    headlineMedium: {
      fontFamily: Fonts.urbanist.bold,
    },
    headlineSmall: {
      fontFamily: Fonts.urbanist.bold,
    },
    titleLarge: {
      fontFamily: Fonts.urbanist.semiBold,
    },
    titleMedium: {
      fontFamily: Fonts.urbanist.semiBold,
    },
    titleSmall: {
      fontFamily: Fonts.urbanist.semiBold,
    },
    bodyLarge: {
      fontFamily: Fonts.urbanist.regular,
    },
    bodyMedium: {
      fontFamily: Fonts.urbanist.regular,
    },
    bodySmall: {
      fontFamily: Fonts.urbanist.regular,
    },
    labelLarge: {
      fontFamily: Fonts.urbanist.medium,
    },
    labelMedium: {
      fontFamily: Fonts.urbanist.medium,
    },
    labelSmall: {
      fontFamily: Fonts.urbanist.medium,
    },
  },
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.primary,
    secondary: Colors.secondary,
    success: Colors.success,
    warning: Colors.warning,
    error: Colors.error,
    background: Colors.background,
    surface: Colors.surface,
    text: Colors.text,
    textSecondary: Colors.textSecondary,
  },
  gradients: Gradients
};

export default Theme; 