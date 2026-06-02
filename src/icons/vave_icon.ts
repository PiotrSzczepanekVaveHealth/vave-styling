import { createElement } from 'react';
import { SvgXml } from 'react-native-svg';

import { iconSizes, icons, type IconName, type IconSize, type IconWeightFor } from '../generated/icons';
import { iconSvgSources } from './svg-sources';

export interface VaveIconProps<TName extends IconName = IconName> {
  name: TName;
  size?: IconSize;
  weight?: IconWeightFor<TName>;
  color?: string;
  testID?: string;
}

export const VaveIcon = <TName extends IconName>({
  name,
  size = 24,
  weight,
  color,
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
    xml: applyIconColor(xml, color),
    width: size,
    height: size,
    ...(testID ? { testID } : {}),
  });
};

const applyIconColor = (xml: string, color?: string): string => {
  if (!color) {
    return xml;
  }

  return xml.replace(/fill="(?!none)[^"]+"/g, `fill="${color}"`);
};
