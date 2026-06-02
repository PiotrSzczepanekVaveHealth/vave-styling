/* eslint-disable */
// This file is generated from the Figma typography samples.
// Do not edit it manually.

export const fontFamilies = {
  mulish: 'Mulish',
} as const;

export const typography = {
  text16Bold: {
    fontFamily: fontFamilies.mulish,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 16,
    letterSpacing: 0,
  },
  text14Bold: {
    fontFamily: fontFamilies.mulish,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 16,
    letterSpacing: 0,
  },
  text12BoldAllCaps: {
    fontFamily: fontFamilies.mulish,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  text12Medium: {
    fontFamily: fontFamilies.mulish,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 14,
    letterSpacing: 0,
  },
  text10Bold: {
    fontFamily: fontFamilies.mulish,
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 10,
    letterSpacing: 0,
    textTransform: 'capitalize',
  },
} as const;

export type FontFamilyName = keyof typeof fontFamilies;
export type TypographyName = keyof typeof typography;
export type TypographyStyle = (typeof typography)[TypographyName];
