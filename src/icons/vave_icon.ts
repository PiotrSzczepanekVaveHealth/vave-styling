import { createElement } from 'react';
import { SvgXml } from 'react-native-svg';

import { iconSizes, icons, type IconName, type IconSize, type IconWeightFor } from '../generated/icons';
import { iconSvgSources } from './svg-sources';

export interface VaveIconColorMap {
  black?: string;
  brand?: string;
  caution?: string;
  danger?: string;
  white?: string;
  [sourceColor: string]: string | undefined;
}

export interface VaveIconProps<TName extends IconName = IconName> {
  name: TName;
  size?: IconSize;
  weight?: IconWeightFor<TName>;
  color?: string;
  colors?: VaveIconColorMap;
  testID?: string;
}

export const VaveIcon = <TName extends IconName>({
  name,
  size = 24,
  weight,
  color,
  colors,
  testID,
}: VaveIconProps<TName>) => {
  const icon = icons[name];
  const resolvedWeight = weight ?? icon.weights[0];
  const key = `${String(name)}:${String(resolvedWeight)}:${String(size)}` as keyof typeof iconSvgSources;
  const xml = iconSvgSources[key];

  if (!iconSizes.includes(size) || !xml) {
    return null;
  }

  return createElement(SvgXml, {
    xml: applyIconColors(xml, { color, colors }),
    width: size,
    height: size,
    ...(testID ? { testID } : {}),
  });
};

interface ApplyIconColorsOptions {
  color?: string | undefined;
  colors?: VaveIconColorMap | undefined;
}

const colorAliases: Record<string, string[]> = {
  black: ['black', '#000', '#000000'],
  brand: ['#00b2b2', '#00b8b9'],
  caution: ['#ff9500'],
  danger: ['#ff3333', '#e00505'],
  white: ['white', '#fff', '#ffffff'],
};

const applyIconColors = (xml: string, { color, colors }: ApplyIconColorsOptions): string => {
  const resolvedColors = colors ? normalizeColorMap(colors) : undefined;

  if (resolvedColors) {
    return replacePaints(xml, (sourceColor) => resolvedColors[sourceColor]);
  }

  if (!color) {
    return xml;
  }

  return replacePaints(xml, () => color);
};

const normalizeColorMap = (colors: VaveIconColorMap): Record<string, string> => {
  const normalizedColors: Record<string, string> = {};

  Object.entries(colors).forEach(([sourceColor, targetColor]) => {
    if (!targetColor) {
      return;
    }

    const aliases = colorAliases[sourceColor.toLowerCase()] ?? [sourceColor];

    aliases.forEach((alias) => {
      normalizedColors[normalizeColor(alias)] = targetColor;
    });
  });

  return normalizedColors;
};

const replacePaints = (xml: string, getColor: (sourceColor: string) => string | undefined): string =>
  xml.replace(/(fill|stroke)="(?!none)([^"]+)"/g, (match, attribute: string, sourceColor: string) => {
    const targetColor = getColor(normalizeColor(sourceColor));

    return targetColor ? `${attribute}="${targetColor}"` : match;
  });

const normalizeColor = (color: string): string => color.trim().toLowerCase();
