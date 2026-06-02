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

## Scripts

```sh
npm run generate:tokens
npm run sync:figma
npm run typecheck
npm run test
npm run build
```
