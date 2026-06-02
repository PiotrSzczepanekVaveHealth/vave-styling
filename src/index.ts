export { breakpoints, themes } from './generated/themes';
export { fontAssetFileNames, fontAssetPaths } from './generated/fonts';
export { iconNames, icons, iconSizes, iconVariants, iconWeights } from './generated/icons';
export { fontFamilies, typography } from './generated/typography';
export { iconSvgSources, VaveIcon } from './icons';
export type { IconSvgSourceKey, VaveIconProps } from './icons';
export type {
  FontAssetFileName,
  FontAssetName,
  FontFamilyName,
  IconName,
  IconSize,
  IconVariant,
  IconWeight,
  IconWeightFor,
  TypographyName,
  TypographyStyle,
  VaveBreakpoints,
  VaveTheme,
  VaveThemeName,
} from './generated/types';

export { configureVaveStyling } from './configure';
export type { ConfigureVaveStylingOptions } from './configure';

export {
  getDeviceColorScheme,
  getThemeName,
  isAdaptiveThemeEnabled,
  setSystemTheme,
  setTheme,
  setThemePreference,
} from './theme-controller';
export type { VaveThemePreference } from './theme-controller';

export {
  createGeneratedThemesSource,
  createGeneratedTypesSource,
  figmaColorToCss,
  transformFigmaVariables,
} from './figma/transform';
export type {
  BreakpointsObject,
  ThemeLeafValue,
  ThemeObject,
  ThemesObject,
  ThemeValue,
  TransformFigmaVariablesResult,
} from './figma/transform';
export type {
  FigmaColorValue,
  FigmaVariable,
  FigmaVariableAlias,
  FigmaVariableCollection,
  FigmaVariableMode,
  FigmaVariableResolvedType,
  FigmaVariablesPayload,
  FigmaVariablesResponse,
  FigmaVariableValue,
} from './figma/types';
