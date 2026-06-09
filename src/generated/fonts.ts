/* eslint-disable */
// This file maps packaged font assets.
// Do not edit it manually.

export const fontAssetPaths = {
  fragmentMonoRegular: 'vave-styling/assets/fonts/FragmentMono-Regular.ttf',
  mulishBold: 'vave-styling/assets/fonts/Mulish-Bold.ttf',
  mulishExtraBold: 'vave-styling/assets/fonts/Mulish-ExtraBold.ttf',
  mulishLight: 'vave-styling/assets/fonts/Mulish-Light.ttf',
  mulishMedium: 'vave-styling/assets/fonts/Mulish-Medium.ttf',
  mulishRegular: 'vave-styling/assets/fonts/Mulish-Regular.ttf',
  mulishSemiBold: 'vave-styling/assets/fonts/Mulish-SemiBold.ttf',
  mulishSemiBoldItalic: 'vave-styling/assets/fonts/Mulish-SemiBoldItalic.ttf',
  icomoon: 'vave-styling/assets/fonts/icomoon.ttf',
} as const;

export const fontAssetFileNames = [
  'FragmentMono-Regular.ttf',
  'Mulish-Bold.ttf',
  'Mulish-ExtraBold.ttf',
  'Mulish-Light.ttf',
  'Mulish-Medium.ttf',
  'Mulish-Regular.ttf',
  'Mulish-SemiBold.ttf',
  'Mulish-SemiBoldItalic.ttf',
  'icomoon.ttf',
] as const;

export type FontAssetName = keyof typeof fontAssetPaths;
export type FontAssetFileName = (typeof fontAssetFileNames)[number];
