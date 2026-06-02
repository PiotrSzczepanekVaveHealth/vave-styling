declare module 'react-native-unistyles' {
  export interface UnistylesThemes {}
  export interface UnistylesBreakpoints {}

  export interface UnistylesSettings {
    initialTheme?: string | (() => string);
    adaptiveThemes?: boolean;
    CSSVars?: boolean;
    nativeBreakpointsMode?: 'pixels' | 'points';
  }

  export const StyleSheet: {
    configure(config: {
      themes?: Record<string, unknown>;
      breakpoints?: Record<string, number>;
      settings?: UnistylesSettings;
    }): void;
  };

  export const UnistylesRuntime: {
    readonly themeName: keyof UnistylesThemes | string;
    readonly hasAdaptiveThemes: boolean;
    readonly colorScheme: 'light' | 'dark' | 'unspecified';
    setTheme(themeName: keyof UnistylesThemes | string): void;
    setAdaptiveThemes(enabled: boolean): void;
  };
}
