import { UnistylesRuntime } from 'react-native-unistyles';

import type { VaveThemeName } from './generated/themes';

export type VaveThemePreference = VaveThemeName | 'system';

export const setTheme = (themeName: VaveThemeName): void => {
  UnistylesRuntime.setAdaptiveThemes(false);
  UnistylesRuntime.setTheme(themeName);
};

export const setSystemTheme = (): void => {
  UnistylesRuntime.setAdaptiveThemes(true);
};

export const setThemePreference = (preference: VaveThemePreference): void => {
  if (preference === 'system') {
    setSystemTheme();
    return;
  }

  setTheme(preference);
};

export const getThemeName = (): string => UnistylesRuntime.themeName;

export const isAdaptiveThemeEnabled = (): boolean => UnistylesRuntime.hasAdaptiveThemes;

export const getDeviceColorScheme = (): 'light' | 'dark' | 'unspecified' => UnistylesRuntime.colorScheme;
