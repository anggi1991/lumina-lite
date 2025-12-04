import { MD3LightTheme, MD3DarkTheme } from "react-native-paper";

export const colors = {
  primary: "#6A5AE0", // Purple Glow
  primaryDark: "#4B3FB3",
  accent: "#D99000", // Darker Gold for visibility
  background: "#FFFFFF", // Light
  surface: "#F7F7FA", // Light Surface
  surfaceVariant: "#F0F0F3",
  text: "#0D0D0F", // Dark Text
  textSecondary: "#8A8F98",
  success: "#4ADE80",
  error: "#EF4444",
  warning: "#FACC15",
  white: "#FFFFFF",
  black: "#000000",

  // Dark Mode Colors
  darkBackground: "#0D0D0F",
  darkSurface: "#1A1A1E",
  darkSurfaceVariant: "#2C2C35",
  darkText: "#F7F7FA",
  darkTextSecondary: "#A0A0B0",
};

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    secondary: colors.accent,
    error: colors.error,
    background: colors.background,
    surface: colors.surface,
    surfaceVariant: colors.surfaceVariant,
    onPrimary: colors.white,
    onSecondary: colors.black,
    onBackground: colors.text,
    onSurface: colors.text,
    onSurfaceVariant: colors.textSecondary,
    text: colors.text,
    placeholder: colors.textSecondary,
    elevation: {
      level1: colors.surface,
      level2: colors.surfaceVariant,
      level3: colors.surface,
      level4: colors.surface,
      level5: colors.surface,
    },
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.primary,
    secondary: colors.accent,
    error: colors.error,
    background: colors.darkBackground,
    surface: colors.darkSurface,
    surfaceVariant: colors.darkSurfaceVariant,
    onPrimary: colors.white,
    onSecondary: colors.black,
    onBackground: colors.darkText,
    onSurface: colors.darkText,
    onSurfaceVariant: colors.darkTextSecondary,
    text: colors.darkText,
    placeholder: colors.darkTextSecondary,
    elevation: {
      level1: colors.darkSurface,
      level2: colors.darkSurfaceVariant,
      level3: colors.darkSurface,
      level4: colors.darkSurface,
      level5: colors.darkSurface,
    },
  },
};

// Default export for backward compatibility if needed, but prefer named exports
export const theme = lightTheme;
