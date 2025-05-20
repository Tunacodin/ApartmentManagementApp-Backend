const colors = {
  primary: '#6C63FF',         // Ana renk (canlı bir mor tonu)
  secondary: '#A29BFE',       // İkincil renk (pastel mor tonu)
  background: '#eee',         // Arka plan (koyu gri)
  textPrimary: '#EDF2F4',     // Ana metin rengi (açık gri/beyaz)
  textSecondary: '#8D99AE',   // İkincil metin rengi (orta ton gri)
  white: '#FFFFFF',           // Beyaz
  black: '#1A1A1D',           // Siyah (hafif yumuşak ton)
  lightGray: '#4A4E69',       // Hafif gri
  darkGray: '#22223B',        // Koyu gri

  // Yeni renk paleti
  palette: {
    primary: {
      main: '#2C3E50',
      light: '#34495E',
      dark: '#1A252F',
    },
    secondary: {
      main: '#3498DB',
      light: '#5DADE2',
      dark: '#2E86C1',
    },
    success: {
      main: '#2ECC71',
      light: '#58D68D',
      dark: '#27AE60',
    },
    warning: {
      main: '#F1C40F',
      light: '#F4D03F',
      dark: '#F39C12',
    },
    error: {
      main: '#E74C3C',
      light: '#EC7063',
      dark: '#C0392B',
    },
    grey: {
      100: '#F5F6FA',
      200: '#E5E8ED',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
      dark: '#1E293B',
    },
    text: {
      primary: '#1E293B',
      secondary: '#64748B',
      disabled: '#94A3B8',
    },
    chart: {
      blue: '#3498DB',
      green: '#2ECC71',
      yellow: '#F1C40F',
      red: '#E74C3C',
      purple: '#9B59B6',
      orange: '#E67E22',
    }
  }
};

// Kolay erişim için kısayollar
export const palette = {
  primaryMain: colors.palette.primary.main,
  secondaryMain: colors.palette.secondary.main,
  successMain: colors.palette.success.main,
  warningMain: colors.palette.warning.main,
  errorMain: colors.palette.error.main,
};

export default colors;
