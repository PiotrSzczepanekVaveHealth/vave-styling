import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  createGeneratedThemesSource,
  createGeneratedTypesSource,
  transformFigmaVariables,
} from '../src/figma/transform';
import type { FigmaVariablesPayload } from '../src/figma/types';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const main = async (): Promise<void> => {
  const snapshotPath = resolve(projectRoot, 'tokens/figma.variables.json');
  const generatedThemesPath = resolve(projectRoot, 'src/generated/themes.ts');
  const generatedTypesPath = resolve(projectRoot, 'src/generated/types.ts');
  const snapshot = await readSnapshot(snapshotPath);
  const result = transformFigmaVariables(snapshot);

  await writeTextFile(generatedThemesPath, createGeneratedThemesSource(result));
  await writeTextFile(generatedTypesPath, createGeneratedTypesSource());

  for (const diagnostic of result.diagnostics) {
    console.warn(`[vave-styling] ${diagnostic}`);
  }

  console.info(`[vave-styling] Generated themes from ${Object.keys(snapshot.variables).length} Figma variables.`);
};

const readSnapshot = async (path: string): Promise<FigmaVariablesPayload> => {
  const content = await readFile(path, 'utf8');
  const parsed = JSON.parse(content) as Partial<FigmaVariablesPayload>;

  if (!parsed.variables || !parsed.variableCollections) {
    throw new Error(`Invalid Figma variables snapshot at ${path}. Expected variables and variableCollections maps.`);
  }

  if (Object.keys(parsed.variables).length === 0 || Object.keys(parsed.variableCollections).length === 0) {
    throw new Error(
      `Figma variables snapshot at ${path} is empty. Export variables with Figma MCP first and write the result to this file.`,
    );
  }

  return parsed as FigmaVariablesPayload;
};

const writeTextFile = async (path: string, content: string): Promise<void> => {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content);
};

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
