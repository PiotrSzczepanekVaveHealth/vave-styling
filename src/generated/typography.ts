/* eslint-disable */
// This file is generated from the Figma typography samples.
// Do not edit it manually.

import { Dimensions, PixelRatio } from 'react-native';

export const fontFamilies = {
  fragmentMono: 'Fragment Mono',
  mulish: 'Mulish',
} as const;

const typographyReferenceWidth = 402;
const typographyScaleFactor = 0.35;
const tabletMinShortestSide = 600;

interface TypographyStyleConfig {
  fontFamily: (typeof fontFamilies)[keyof typeof fontFamilies];
  fontSize: number;
  fontWeight: '400' | '500' | '700';
  lineHeight: number;
  letterSpacing: number;
  textTransform?: 'capitalize' | 'uppercase';
}

const getResponsiveTypographyValue = (value: number) => {
  const { height, width } = Dimensions.get('window');

  if (Math.min(width, height) >= tabletMinShortestSide) {
    return value;
  }

  const scaledValue = value * (width / typographyReferenceWidth);
  const moderatedValue = value + (scaledValue - value) * typographyScaleFactor;

  return PixelRatio.roundToNearestPixel(moderatedValue);
};

const createTypographyStyle = ({
  fontSize,
  lineHeight,
  letterSpacing,
  ...style
}: TypographyStyleConfig) => ({
  ...style,
  fontSize: getResponsiveTypographyValue(fontSize),
  lineHeight: getResponsiveTypographyValue(lineHeight),
  letterSpacing,
});

export const typography = {
  text16Bold: createTypographyStyle({
    fontFamily: fontFamilies.mulish,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 16,
    letterSpacing: 0,
  }),
  text14Bold: createTypographyStyle({
    fontFamily: fontFamilies.mulish,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 16,
    letterSpacing: 0,
  }),
  text12BoldAllCaps: createTypographyStyle({
    fontFamily: fontFamilies.mulish,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    letterSpacing: 0,
    textTransform: 'uppercase',
  }),
  text12Medium: createTypographyStyle({
    fontFamily: fontFamilies.mulish,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 14,
    letterSpacing: 0,
  }),
  text10Bold: createTypographyStyle({
    fontFamily: fontFamilies.mulish,
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 10,
    letterSpacing: 0.2,
    textTransform: 'capitalize',
  }),
  rulerLabel: createTypographyStyle({
    fontFamily: fontFamilies.fragmentMono,
    fontSize: 11,
    fontWeight: '400',
    lineHeight: 11,
    letterSpacing: -0.5,
  }),
} as const;

export type FontFamilyName = keyof typeof fontFamilies;
export type TypographyName = keyof typeof typography;
export type TypographyStyle = (typeof typography)[TypographyName];
