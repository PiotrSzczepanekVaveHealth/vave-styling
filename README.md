# vave-styling

Shared design tokens and Unistyles themes for Vave React Native apps.

The package consumes Figma Variables exported from the Vave design system file, converts them into typed TypeScript theme objects, and exposes a small runtime API for React Native Unistyles v3.

## Requirements

Consuming apps must install and configure:

- `react-native-unistyles` v3
- `react-native-nitro-modules`
- React Native `>=0.78.0` with the New Architecture enabled

These packages are peer dependencies because they belong to the app runtime.

## Figma Sync Through MCP

The sync path uses Cursor's Figma MCP integration.

Ask Cursor to run a Figma MCP variables export for:

- file key: `kxh6WdJoOH391Llbs8MvEv` (also documented in the exporter)
- script: `scripts/figma-mcp-export.js`

Write the returned object to:

- `tokens/figma.variables.json`

Then regenerate TypeScript tokens:

```sh
npm run sync:figma
```

This reads the local MCP snapshot and regenerates:

- `src/generated/themes.ts`
- `src/generated/types.ts`

If generation reports `0` variables, `tokens/figma.variables.json` still contains the empty placeholder and the MCP export result has not been written yet.

If the MCP response is too large for one call, export one collection at a time by editing `collectionNames` in `scripts/figma-mcp-export.js`, then merge the returned `variables` and `variableCollections` maps into `tokens/figma.variables.json`.

## App Setup

Call `configureVaveStyling` once in the app entrypoint, before any `StyleSheet.create` call.

```ts
import 'vave-styling/unistyles';
import { configureVaveStyling } from 'vave-styling';

configureVaveStyling();
```

By default, the package enables adaptive themes when `light` and `dark` themes exist.

Manual initial theme:

```ts
configureVaveStyling({
  initialTheme: 'light',
});
```

## Theme Switching

```ts
import { setSystemTheme, setTheme, setThemePreference } from 'vave-styling';

setTheme('dark');
setSystemTheme();
setThemePreference('system');
```

Selecting a concrete theme disables adaptive themes before switching. Selecting `system` enables adaptive themes again.

## Styling Usage

In app or feature libraries, import `StyleSheet` from `react-native-unistyles`:

```tsx
import { StyleSheet } from 'react-native-unistyles';

const styles = StyleSheet.create((theme) => ({
  title: {
    color: theme.colors.primary,
  },
}));
```

Feature libraries may import tokens directly without configuring runtime:

```ts
import type { VaveTheme } from 'vave-styling';
import { themes } from 'vave-styling';

const lightTheme: VaveTheme = themes.light;
```

## Icons

The package exports icon metadata from the Figma `Navigation Bar` component set. Each icon supports four sizes: `16`, `24`, `32`, and `48`.

```ts
import { iconNames, iconSizes, iconVariants, icons } from 'vave-styling';

const supportedSizes = iconSizes;
const availableWeights = icons.probe.weights;
const allProbeVariants = iconVariants.filter((variant) => variant.name === 'probe');
```

Raw SVG assets are expected under `assets/icons` and can be generated from Figma with `scripts/figma-plugin-export-icons.js` plus `npm run import:icons`. Cursor MCP can read SVGs with `exportAsync`, but its plugin runtime cannot currently POST/write the large export payload directly to local disk.

Physical SVG import flow:

Automatic download flow:

1. Create a Figma token with `file_content:read`.
2. Run `FIGMA_ACCESS_TOKEN=... npm run download:icons`.

Manual fallback:

1. Run `scripts/figma-plugin-export-icons.js` in a Figma plugin context for node `408:7788`.
2. Save the downloaded payload as `tokens/figma.icon-assets.json`.
3. Run `npm run import:icons`.

This writes raw SVG files to `assets/icons` and regenerates the `VaveIcon` SVG source map.

```tsx
import { VaveIcon } from 'vave-styling';

<VaveIcon name="probe" size={24} weight="light" color="#00b2b2" />;
```

## Typography

```ts
import { fontAssetPaths, typography } from 'vave-styling';

const labelStyle = typography.text12Medium;
const titleStyle = typography.text16Bold;
const mulishRegular = fontAssetPaths.mulishRegular;
```

Physical font files are packaged in `assets/fonts`.

## Scripts

```sh
npm run generate:tokens
npm run download:icons
npm run import:icons
npm run sync:figma
npm run typecheck
npm run test
npm run build
```
