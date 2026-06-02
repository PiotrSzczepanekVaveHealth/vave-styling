import { StyleSheet, type UnistylesSettings } from 'react-native-unistyles';

import { breakpoints as defaultBreakpoints, themes as defaultThemes, type VaveThemeName } from './generated/themes';

export interface ConfigureVaveStylingOptions {
  themes?: typeof defaultThemes;
  breakpoints?: typeof defaultBreakpoints;
  initialTheme?: VaveThemeName | (() => VaveThemeName);
  adaptiveThemes?: boolean;
  CSSVars?: boolean;
  nativeBreakpointsMode?: 'pixels' | 'points';
}

export const configureVaveStyling = ({
  themes = defaultThemes,
  breakpoints = defaultBreakpoints,
  initialTheme,
  adaptiveThemes,
  CSSVars,
  nativeBreakpointsMode,
}: ConfigureVaveStylingOptions = {}): void => {
  const settings: UnistylesSettings = {};

  if (initialTheme) {
    settings.initialTheme = initialTheme;
  } else if (adaptiveThemes ?? hasLightAndDarkThemes(themes)) {
    settings.adaptiveThemes = true;
  }

  if (CSSVars !== undefined) {
    settings.CSSVars = CSSVars;
  }

  if (nativeBreakpointsMode !== undefined) {
    settings.nativeBreakpointsMode = nativeBreakpointsMode;
  }

  StyleSheet.configure({
    themes,
    breakpoints,
    settings,
  });
};

const hasLightAndDarkThemes = (themes: Record<string, unknown>): boolean => 'light' in themes && 'dark' in themes;
