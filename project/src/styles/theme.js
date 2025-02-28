import { Platform } from 'react-native';
import { MD3LightTheme, configureFonts } from 'react-native-paper';

const fontConfig = {
  customVariant: {
    fontFamily: Platform.select({
      web: 'Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
      ios: 'System',
      android: 'Roboto',
      default: 'sans-serif',
    }),
    fontWeight: '400',
  },
};

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6C63FF',
    secondary: '#2EC4B6',
    error: '#FF5252',
    background: '#F7F9FC',
    surface: '#FFFFFF',
    accent: '#FF9F1C',
    text: '#2D3436',
    placeholder: '#95A5A6',
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
  fonts: configureFonts({ config: fontConfig }),
  roundness: 8,
};

export const darkTheme = {
  ...theme,
  dark: true,
  colors: {
    ...theme.colors,
    background: '#1A1A1A',
    surface: '#2D2D2D',
    text: '#FFFFFF',
    placeholder: '#95A5A6',
    backdrop: 'rgba(0, 0, 0, 0.7)',
  },
}; 