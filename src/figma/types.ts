export type FigmaVariableResolvedType = 'BOOLEAN' | 'FLOAT' | 'STRING' | 'COLOR';

export interface FigmaColorValue {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface FigmaVariableAlias {
  type: 'VARIABLE_ALIAS';
  id: string;
}

export type FigmaVariableValue = boolean | number | string | FigmaColorValue | FigmaVariableAlias | null;

export interface FigmaVariable {
  id: string;
  name: string;
  key: string;
  variableCollectionId: string;
  resolvedType: FigmaVariableResolvedType;
  valuesByMode: Record<string, FigmaVariableValue>;
  remote: boolean;
  description?: string;
  hiddenFromPublishing?: boolean;
  scopes?: string[];
  codeSyntax?: Record<string, string>;
}

export interface FigmaVariableMode {
  modeId: string;
  name: string;
  parentModeId?: string;
}

export interface FigmaVariableCollection {
  id: string;
  name: string;
  key: string;
  modes: FigmaVariableMode[];
  defaultModeId: string;
  variableIds: string[];
  remote: boolean;
  hiddenFromPublishing?: boolean;
  isExtension?: boolean;
  parentVariableCollectionId?: string;
  rootVariableCollectionId?: string;
}

export interface FigmaVariablesPayload {
  variables: Record<string, FigmaVariable>;
  variableCollections: Record<string, FigmaVariableCollection>;
}

export interface FigmaVariablesResponse {
  status: number;
  error: boolean;
  meta: FigmaVariablesPayload;
}

export const isFigmaVariableAlias = (value: FigmaVariableValue): value is FigmaVariableAlias =>
  typeof value === 'object' && value !== null && 'type' in value && value.type === 'VARIABLE_ALIAS';

export const isFigmaColorValue = (value: FigmaVariableValue): value is FigmaColorValue =>
  typeof value === 'object' &&
  value !== null &&
  'r' in value &&
  'g' in value &&
  'b' in value &&
  'a' in value;
