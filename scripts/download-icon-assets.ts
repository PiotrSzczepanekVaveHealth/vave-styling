import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
}

interface IconAsset {
  id: string;
  name: string;
  weight: string;
  size: number;
}

const FIGMA_FILE_KEY = 'kxh6WdJoOH391Llbs8MvEv';
const ICON_ROOT_NODE_ID = '408:7788';
const FIGMA_API_BASE_URL = 'https://api.figma.com/v1';
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const main = async (): Promise<void> => {
  const accessToken = await getFigmaAccessToken();

  if (!accessToken) {
    throw new Error('Missing FIGMA_ACCESS_TOKEN. The token needs the file_content:read scope.');
  }

  const rootNode = await fetchIconRoot(accessToken);
  const assets = collectIconAssets(rootNode);
  const images = await fetchImageUrls(accessToken, assets.map((asset) => asset.id));
  const iconPayload = [];

  for (const asset of assets) {
    const imageUrl = images[asset.id];

    if (!imageUrl) {
      throw new Error(`Missing SVG image URL for Figma node ${asset.id}.`);
    }

    const svg = await fetchText(imageUrl);
    const allIconAssets = assets.filter((item) => item.name === asset.name);

    iconPayload.push({
      name: asset.name,
      weight: asset.weight,
      size: asset.size,
      sizes: [...new Set(allIconAssets.map((item) => item.size))].sort((a, b) => a - b),
      weights: [...new Set(allIconAssets.map((item) => item.weight))].sort(),
      svg,
      sourceNodeId: asset.id,
    });
  }

  const payloadPath = resolve(projectRoot, 'tokens/figma.icon-assets.json');
  await writeTextFile(payloadPath, `${JSON.stringify({ icons: iconPayload }, null, 2)}\n`);

  await importIcons();
  console.info(`[vave-styling] Downloaded ${iconPayload.length} SVG icon assets.`);
};

const getFigmaAccessToken = async (): Promise<string | undefined> => {
  if (process.env.FIGMA_ACCESS_TOKEN) {
    return process.env.FIGMA_ACCESS_TOKEN;
  }

  try {
    const envContent = await readFile(resolve(projectRoot, '.env'), 'utf8');
    const lines = envContent
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'));

    for (const line of lines) {
      const [key, ...valueParts] = line.split('=');

      if (key?.toUpperCase() === 'FIGMA_ACCESS_TOKEN') {
        return valueParts.join('=').replace(/^"|"$/g, '');
      }
    }

    const rawToken = lines.find((line) => !line.includes('='));

    return rawToken?.replace(/^"|"$/g, '');
  } catch {
    return undefined;
  }
};

const fetchIconRoot = async (accessToken: string): Promise<FigmaNode> => {
  const url = `${FIGMA_API_BASE_URL}/files/${FIGMA_FILE_KEY}/nodes?ids=${encodeURIComponent(ICON_ROOT_NODE_ID)}`;
  const response = await fetch(url, {
    headers: {
      'X-Figma-Token': accessToken,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Figma icon root: ${response.status} ${await response.text()}`);
  }

  const payload = (await response.json()) as {
    nodes: Record<string, { document: FigmaNode }>;
  };
  const node = payload.nodes[ICON_ROOT_NODE_ID]?.document;

  if (!node) {
    throw new Error(`Figma icon root node ${ICON_ROOT_NODE_ID} was not found.`);
  }

  return node;
};

const collectIconAssets = (rootNode: FigmaNode): IconAsset[] => {
  const assets: IconAsset[] = [];
  const componentSets = flattenNodes(rootNode).filter((node) => node.type === 'COMPONENT_SET' && node.name.startsWith('icon/'));

  for (const componentSet of componentSets) {
    const iconName = normalizeIconName(componentSet.name);

    for (const component of componentSet.children ?? []) {
      if (component.type !== 'COMPONENT') {
        continue;
      }

      const variant = parseVariantName(component.name);
      const size = Number(variant.size);
      const weight = variant.weight ?? 'regular';

      if (!size) {
        continue;
      }

      assets.push({
        id: component.id,
        name: iconName,
        weight,
        size,
      });
    }
  }

  return dedupeAssets(assets).sort((a, b) => `${a.name}:${a.weight}:${a.size}`.localeCompare(`${b.name}:${b.weight}:${b.size}`));
};

const fetchImageUrls = async (accessToken: string, ids: string[]): Promise<Record<string, string>> => {
  const chunks = chunk(ids, 80);
  const images: Record<string, string> = {};

  for (const idsChunk of chunks) {
    const url = `${FIGMA_API_BASE_URL}/images/${FIGMA_FILE_KEY}?format=svg&ids=${encodeURIComponent(idsChunk.join(','))}`;
    const response = await fetch(url, {
      headers: {
        'X-Figma-Token': accessToken,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Figma SVG URLs: ${response.status} ${await response.text()}`);
    }

    const payload = (await response.json()) as { images: Record<string, string> };
    Object.assign(images, payload.images);
  }

  return images;
};

const fetchText = async (url: string): Promise<string> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to download SVG asset: ${response.status} ${await response.text()}`);
  }

  return response.text();
};

const importIcons = async (): Promise<void> => {
  const { spawn } = await import('node:child_process');

  await new Promise<void>((resolvePromise, reject) => {
    const child = spawn(process.execPath, ['--import', 'tsx', 'scripts/import-icon-assets.ts'], {
      cwd: projectRoot,
      stdio: 'inherit',
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolvePromise();
        return;
      }

      reject(new Error(`Icon import failed with exit code ${code}.`));
    });
    child.on('error', reject);
  });
};

const writeTextFile = async (path: string, content: string): Promise<void> => {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content);
};

const flattenNodes = (node: FigmaNode): FigmaNode[] => [node, ...(node.children ?? []).flatMap(flattenNodes)];

const parseVariantName = (name: string): Record<string, string> =>
  Object.fromEntries(
    name
      .split(',')
      .map((part) => part.trim().split('=').map((item) => item.trim()))
      .filter(([key, value]) => Boolean(key) && Boolean(value)),
  );

const normalizeIconName = (name: string): string => name.replace(/^icon\//, '').replace(/^[A-Z]/, (letter) => letter.toLowerCase());

const dedupeAssets = (assets: IconAsset[]): IconAsset[] => {
  const byKey = new Map<string, IconAsset>();

  for (const asset of assets) {
    byKey.set(`${asset.name}:${asset.weight}:${asset.size}`, asset);
  }

  return [...byKey.values()];
};

const chunk = <T>(items: T[], size: number): T[][] => {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
};

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
