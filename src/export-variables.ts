export async function exportVariables() {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const variables = await figma.variables.getLocalVariablesAsync();

  type ResolvedValue = {
    resolvedValue: VariableValue;
    alias: string | null;
    aliasName: string | null;
  };

  type ResolvedValuesByMode = {
    [modeId: string]: ResolvedValue;
  };

  const collectionsData = collections.map(collection => {
    const collectionVariables = variables.filter(v => v.variableCollectionId === collection.id);
    
    return {
      id: collection.id,
      name: collection.name,
      modes: collection.modes,
      variableIds: collectionVariables.map(v => v.id),
      variables: collectionVariables.map(variable => ({
        id: variable.id,
        name: variable.name,
        description: variable.description,
        type: variable.resolvedType,
        valuesByMode: variable.valuesByMode,
        resolvedValuesByMode: Object.entries(variable.valuesByMode).reduce<ResolvedValuesByMode>((acc, [modeId, value]) => {
          acc[modeId] = {
            resolvedValue: typeof value === 'object' && 'type' in value && value.type === 'VARIABLE_ALIAS'
              ? variables.find(v => v.id === value.id)?.valuesByMode[modeId] ?? value
              : value,
            alias: typeof value === 'object' && 'type' in value && value.type === 'VARIABLE_ALIAS'
              ? value.id
              : null,
            aliasName: typeof value === 'object' && 'type' in value && value.type === 'VARIABLE_ALIAS'
              ? variables.find(v => v.id === value.id)?.name ?? null
              : null
          };
          return acc;
        }, {}),
        scopes: variable.scopes,
        hiddenFromPublishing: variable.hiddenFromPublishing,
        codeSyntax: variable.codeSyntax || {}
      }))
    };
  });

  const jsonData = JSON.stringify(collectionsData, null, 2);
  figma.ui.postMessage({ type: 'export-json', data: jsonData });
}