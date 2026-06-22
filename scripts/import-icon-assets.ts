import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

interface IncomingIconAsset {
  name: string;
  weight: string;
  size: number;
  sizes: number[];
  weights: string[];
  svg: string;
  sourceNodeId: string;
}

interface IncomingPayload {
  icons: IncomingIconAsset[];
}

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const inputPath = resolve(projectRoot, 'tokens/figma.icon-assets.json');

const main = async (): Promise<void> => {
  const payload = JSON.parse(await readFile(inputPath, 'utf8')) as IncomingPayload;

  if (!Array.isArray(payload.icons) || payload.icons.length === 0) {
    throw new Error(`Invalid icon asset payload at ${inputPath}. Expected a non-empty icons array.`);
  }

  await writeIconAssets(payload.icons);
  const icons = await collectFilesystemIcons();
  await fillPlaceholderIconsFromReferenceSize(icons);
  await regenerateDerivedAssets(icons);
  console.info(`[vave-styling] Imported ${icons.length} icon SVG assets.`);
};

const writeIconAssets = async (icons: IncomingIconAsset[]): Promise<void> => {
  const sortedIcons = [...icons].sort((a, b) => `${a.name}:${a.weight}:${a.size}`.localeCompare(`${b.name}:${b.weight}:${b.size}`));

  for (const icon of sortedIcons) {
    const iconPath = getIconPath(icon.name, icon.weight, icon.size);
    const outputPath = resolve(projectRoot, 'assets/icons', iconPath);

    await writeTextFile(outputPath, icon.svg);
  }
};

const iconWeightNames = new Set(['bold', 'fill', 'light', 'regular']);

const collectFilesystemIcons = async (): Promise<IncomingIconAsset[]> => {
  const iconsRoot = resolve(projectRoot, 'assets/icons');
  const icons: IncomingIconAsset[] = [];

  const walk = async (currentDir: string, nameParts: string[]): Promise<void> => {
    const entries = await readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }

      const fullPath = join(currentDir, entry.name);

      if (iconWeightNames.has(entry.name)) {
        const name = nameParts.join('/');
        const weight = entry.name;
        const sizeFiles = await readdir(fullPath);

        for (const fileName of sizeFiles) {
          if (!fileName.endsWith('.svg')) {
            continue;
          }

          const size = Number(fileName.replace('.svg', ''));

          if (!size) {
            continue;
          }

          icons.push({
            name,
            weight,
            size,
            sizes: [],
            weights: [],
            svg: await readFile(join(fullPath, fileName), 'utf8'),
            sourceNodeId: 'filesystem',
          });
        }

        continue;
      }

      await walk(fullPath, [...nameParts, entry.name]);
    }
  };

  await walk(iconsRoot, []);

  return icons.sort((a, b) => `${a.name}:${a.weight}:${a.size}`.localeCompare(`${b.name}:${b.weight}:${b.size}`));
};

const regenerateDerivedAssets = async (icons: IncomingIconAsset[]): Promise<void> => {
  const metadataByName = new Map<string, { weights: Set<string> }>();

  for (const icon of icons) {
    const existing = metadataByName.get(icon.name) ?? { weights: new Set<string>() };

    existing.weights.add(icon.weight);
    metadataByName.set(icon.name, existing);
  }

  const iconsWithMetadata = icons.map((icon) => ({
    ...icon,
    sizes: [...new Set(icons.filter((item) => item.name === icon.name).map((item) => item.size))].sort((a, b) => a - b),
    weights: [...(metadataByName.get(icon.name)?.weights ?? [])].sort(),
  }));

  const svgEntries = iconsWithMetadata.map(
    (icon) => `  ${JSON.stringify(`${icon.name}:${icon.weight}:${icon.size}`)}: ${JSON.stringify(icon.svg)},`,
  );

  await writeTextFile(resolve(projectRoot, 'src/icons/svg-sources.ts'), createSvgSourcesSource(svgEntries));
  await writeIconsMetadata(iconsWithMetadata);
};

const writeTextFile = async (path: string, content: string): Promise<void> => {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content);
};

const getIconPath = (name: string, weight: string, size: number): string => `${name}/${weight}/${size}.svg`;

const isPlaceholderSvg = (svg: string): boolean =>
  /stroke-opacity="0\.1"/.test(svg) && (svg.match(/<path/g)?.length ?? 0) <= 1;

const scaleSvgToSize = (svg: string, targetSize: number): string => {
  const inner = svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');

  return `<svg width="${targetSize}" height="${targetSize}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">\n${inner.trim()}\n</svg>\n`;
};

const fillPlaceholderIconsFromReferenceSize = async (icons: IncomingIconAsset[]): Promise<void> => {
  const iconsByKey = new Map(icons.map((icon) => [`${icon.name}:${icon.weight}:${icon.size}`, icon]));

  for (const icon of icons) {
    if (!isPlaceholderSvg(icon.svg) || icon.size === 24) {
      continue;
    }

    const referenceIcon = iconsByKey.get(`${icon.name}:${icon.weight}:24`);

    if (!referenceIcon || isPlaceholderSvg(referenceIcon.svg)) {
      continue;
    }

    icon.svg = scaleSvgToSize(referenceIcon.svg, icon.size);

    const iconPath = resolve(projectRoot, 'assets/icons', getIconPath(icon.name, icon.weight, icon.size));
    await writeTextFile(iconPath, icon.svg);
  }
};

const createSvgSourcesSource = (entries: string[]): string =>
  [
    '/* eslint-disable */',
    '// This file is generated by scripts/import-icon-assets.ts.',
    '// Do not edit it manually.',
    '',
    'export const iconSvgSources = {',
    ...entries,
    '} as const;',
    '',
    'export type IconSvgSourceKey = keyof typeof iconSvgSources;',
    '',
  ].join('\n');

const figmaNameOverrides: Record<string, readonly string[]> = {
  ai: ['icon/ai', 'icon/ai'],
  caution: ['icon/Caution'],
  probeUniversal: ['icon/probeUniversal', 'icon/probeUniversal'],
};

const iconSortOrder = (name: string): [number, string] => {
  if (name === 'preset/cardiac') {
    return [0, name];
  }

  if (name.startsWith('preset/')) {
    return [1, name];
  }

  return [2, name];
};

const writeIconsMetadata = async (icons: IncomingIconAsset[]): Promise<void> => {
  const metadataByName = new Map<string, { weights: Set<string> }>();

  for (const icon of icons) {
    const existing = metadataByName.get(icon.name) ?? { weights: new Set<string>() };

    icon.weights.forEach((weight) => existing.weights.add(weight));
    metadataByName.set(icon.name, existing);
  }

  const sortedNames = [...metadataByName.keys()].sort((left, right) => {
    const [leftGroup, leftName] = iconSortOrder(left);
    const [rightGroup, rightName] = iconSortOrder(right);

    if (leftGroup !== rightGroup) {
      return leftGroup - rightGroup;
    }

    return leftName.localeCompare(rightName);
  });

  const iconEntries = sortedNames.map((name) => {
    const weights = [...(metadataByName.get(name)?.weights ?? [])].sort();
    const figmaNames = figmaNameOverrides[name] ?? [`icon/${name}`];
    const key = name.includes('/') ? `'${name}'` : name;

    return `  ${key}: { figmaNames: ${JSON.stringify(figmaNames)}, weights: ${JSON.stringify(weights)} },`;
  });

  await writeTextFile(resolve(projectRoot, 'src/generated/icons.ts'), createIconsSource(iconEntries));
};

const createIconsSource = (entries: string[]): string =>
  [
    '/* eslint-disable */',
    '// This file is generated from the Figma icon component set.',
    '// Do not edit it manually.',
    '',
    'export const iconSizes = [16, 24, 32, 48] as const;',
    "export const iconWeights = ['bold', 'fill', 'light', 'regular'] as const;",
    '',
    'export const icons = {',
    ...entries,
    '} as const satisfies Record<string, { figmaNames: readonly string[]; weights: readonly IconWeight[] }>;',
    '',
    'export type IconName = keyof typeof icons;',
    'export type IconSize = (typeof iconSizes)[number];',
    'export type IconWeight = (typeof iconWeights)[number];',
    "export type IconWeightFor<TName extends IconName> = (typeof icons)[TName]['weights'][number];",
    '',
    'export interface IconVariant<TName extends IconName = IconName> {',
    '  name: TName;',
    '  size: IconSize;',
    '  weight: IconWeightFor<TName>;',
    '}',
    '',
    'export const iconNames = Object.keys(icons) as IconName[];',
    '',
    'export const iconVariants = iconNames.flatMap((name) =>',
    '  icons[name].weights.flatMap((weight) =>',
    '    iconSizes.map((size) => ({',
    '      name,',
    '      size,',
    '      weight,',
    '    })),',
    '  ),',
    ') as IconVariant[];',
    '',
  ].join('\n');

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
