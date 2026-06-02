import { describe, expect, it } from 'vitest';

import { fontAssetFileNames, fontAssetPaths } from '../src/generated/fonts';
import { iconNames, icons, iconSizes, iconVariants } from '../src/generated/icons';
import { typography } from '../src/generated/typography';

describe('generated icons', () => {
  it('contains four size variants for every icon', () => {
    expect(iconSizes).toEqual([16, 24, 32, 48]);

    for (const iconName of iconNames) {
      const variants = iconVariants.filter((variant) => variant.name === iconName);
      const sizes = new Set(variants.map((variant) => variant.size));

      expect(sizes).toEqual(new Set(iconSizes));
    }
  });

  it('creates every icon size and weight combination', () => {
    const expectedVariantCount = iconNames.reduce((count, iconName) => count + icons[iconName].weights.length * iconSizes.length, 0);

    expect(iconVariants).toHaveLength(expectedVariantCount);
  });
});

describe('generated typography', () => {
  it('contains the Figma font samples', () => {
    expect(Object.keys(typography)).toEqual([
      'text16Bold',
      'text14Bold',
      'text12BoldAllCaps',
      'text12Medium',
      'text10Bold',
    ]);
  });
});

describe('font assets', () => {
  it('contains packaged Mulish font assets', () => {
    expect(fontAssetFileNames).toContain('Mulish-Regular.ttf');
    expect(fontAssetFileNames).toContain('Mulish-Bold.ttf');
    expect(fontAssetPaths.mulishMedium).toBe('vave-styling/assets/fonts/Mulish-Medium.ttf');
  });
});
