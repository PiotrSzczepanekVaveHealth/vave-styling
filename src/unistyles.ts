import type { breakpoints, themes } from './generated/themes';

type VaveUnistylesThemes = typeof themes;
type VaveUnistylesBreakpoints = typeof breakpoints;

declare module 'react-native-unistyles' {
  export interface UnistylesThemes extends VaveUnistylesThemes {}
  export interface UnistylesBreakpoints extends VaveUnistylesBreakpoints {}
}

export type { VaveUnistylesBreakpoints, VaveUnistylesThemes };
