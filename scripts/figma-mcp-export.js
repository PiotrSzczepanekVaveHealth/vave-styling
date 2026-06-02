// Run this code with the Figma MCP `use_figma` tool.
// It returns a compact snapshot compatible with `tokens/figma.variables.json`.
// Use fileKey `kxh6WdJoOH391Llbs8MvEv` when invoking the MCP tool.
//
// If the response is too large for one MCP call, set `collectionNames` to export
// one collection at a time and merge the returned `variables` and
// `variableCollections` objects into the snapshot.

const figmaFileKey = 'kxh6WdJoOH391Llbs8MvEv';
const collectionNames = null;
const collections = await figma.variables.getLocalVariableCollectionsAsync();
const selectedCollections = collectionNames
  ? collections.filter((collection) => collectionNames.includes(collection.name))
  : collections;
const variables = {};
const variableCollections = {};

for (const collection of selectedCollections) {
  variableCollections[collection.id] = {
    id: collection.id,
    key: collection.id,
    name: collection.name,
    defaultModeId: collection.defaultModeId,
    modes: collection.modes.map((mode) => ({ modeId: mode.modeId, name: mode.name })),
    variableIds: [],
    remote: false,
  };

  for (const variableId of collection.variableIds) {
    const variable = await figma.variables.getVariableByIdAsync(variableId);

    if (!variable) {
      continue;
    }

    variables[variable.id] = {
      id: variable.id,
      key: variable.id,
      name: variable.name,
      variableCollectionId: variable.variableCollectionId,
      resolvedType: variable.resolvedType,
      valuesByMode: variable.valuesByMode,
      remote: false,
    };
  }
}

return { fileKey: figmaFileKey, variables, variableCollections };
