import { describe, expect, it } from 'vitest';

import { figmaColorToCss, transformFigmaVariables } from '../src/figma/transform';
import type { FigmaVariablesPayload } from '../src/figma/types';

describe('figmaColorToCss', () => {
  it('formats opaque colors as hex values', () => {
    expect(figmaColorToCss({ r: 1, g: 0.5, b: 0, a: 1 })).toBe('#ff8000');
  });

  it('formats translucent colors as rgba values', () => {
    expect(figmaColorToCss({ r: 0, g: 0, b: 0, a: 0.48 })).toBe('rgba(0, 0, 0, 0.48)');
  });
});

describe('transformFigmaVariables', () => {
  it('maps Figma modes and aliases to typed theme objects', () => {
    const payload: FigmaVariablesPayload = {
      variableCollections: {
        colors: {
          id: 'colors',
          key: 'colors-key',
          name: 'Colors',
          defaultModeId: 'light',
          modes: [
            { modeId: 'light', name: 'Light' },
            { modeId: 'dark', name: 'Dark' },
          ],
          variableIds: ['color-primary', 'color-background'],
          remote: false,
        },
        spacing: {
          id: 'spacing',
          key: 'spacing-key',
          name: 'Spacing',
          defaultModeId: 'base',
          modes: [{ modeId: 'base', name: 'Base' }],
          variableIds: ['spacing-md'],
          remote: false,
        },
        breakpoints: {
          id: 'breakpoints',
          key: 'breakpoints-key',
          name: 'Breakpoints',
          defaultModeId: 'base',
          modes: [{ modeId: 'base', name: 'Base' }],
          variableIds: ['breakpoint-sm'],
          remote: false,
        },
      },
      variables: {
        'color-primary': {
          id: 'color-primary',
          key: 'color-primary-key',
          name: 'Primary',
          variableCollectionId: 'colors',
          resolvedType: 'COLOR',
          remote: false,
          valuesByMode: {
            light: { r: 0, g: 0.25, b: 1, a: 1 },
            dark: { r: 0.8, g: 0.9, b: 1, a: 1 },
          },
        },
        'color-background': {
          id: 'color-background',
          key: 'color-background-key',
          name: 'Background',
          variableCollectionId: 'colors',
          resolvedType: 'COLOR',
          remote: false,
          valuesByMode: {
            light: { type: 'VARIABLE_ALIAS', id: 'color-primary' },
            dark: { r: 0, g: 0, b: 0, a: 1 },
          },
        },
        'spacing-md': {
          id: 'spacing-md',
          key: 'spacing-md-key',
          name: 'md',
          variableCollectionId: 'spacing',
          resolvedType: 'FLOAT',
          remote: false,
          valuesByMode: {
            base: 16,
          },
        },
        'breakpoint-sm': {
          id: 'breakpoint-sm',
          key: 'breakpoint-sm-key',
          name: 'sm',
          variableCollectionId: 'breakpoints',
          resolvedType: 'FLOAT',
          remote: false,
          valuesByMode: {
            base: 360,
          },
        },
      },
    };

    const result = transformFigmaVariables(payload);

    expect(result.themes).toEqual({
      light: {
        colors: {
          primary: '#0040ff',
          background: '#0040ff',
        },
        spacing: {
          md: 16,
        },
      },
      dark: {
        colors: {
          primary: '#cce6ff',
          background: '#000000',
        },
        spacing: {
          md: 16,
        },
      },
    });
    expect(result.breakpoints).toEqual({ sm: 360 });
    expect(result.diagnostics).toEqual([]);
  });

  it('adds a default breakpoint when no breakpoint collection exists', () => {
    const result = transformFigmaVariables({
      variables: {},
      variableCollections: {},
    });

    expect(result.breakpoints).toEqual({ xs: 0 });
    expect(result.diagnostics).toContain('No breakpoint variables were found; generated a default xs: 0 breakpoint.');
  });
});
