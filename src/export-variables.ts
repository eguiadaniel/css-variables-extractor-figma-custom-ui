type ResolvedValue = {
  resolvedValue: VariableValue;
  alias: string | null;
  aliasName: string | null;
};

type ResolvedValuesByMode = {
  [modeId: string]: ResolvedValue;
};

function isVariableAlias(value: VariableValue): value is { type: 'VARIABLE_ALIAS', id: string } {
  return typeof value === 'object' && 'type' in value && value.type === 'VARIABLE_ALIAS';
}

function resolveVariableValue(value: VariableValue, modeId: string, variables: Variable[]): VariableValue {
  if (isVariableAlias(value)) {
    const referencedVariable = variables.find(v => v.id === value.id);
    return referencedVariable?.valuesByMode[modeId] ?? value;
  }
  return value;
}

function getAliasInfo(value: VariableValue, variables: Variable[]): { id: string | null, name: string | null } {
  if (isVariableAlias(value)) {
    const referencedVariable = variables.find(v => v.id === value.id);
    return {
      id: value.id,
      name: referencedVariable?.name ?? null
    };
  }
  return { id: null, name: null };
}

function calculateResolvedValuesByMode(variable: Variable, variables: Variable[]): ResolvedValuesByMode {
  const resolvedValuesByMode: ResolvedValuesByMode = {};

  for (const [modeId, value] of Object.entries(variable.valuesByMode)) {
    const resolvedValue = resolveVariableValue(value, modeId, variables);
    const { id: alias, name: aliasName } = getAliasInfo(value, variables);

    resolvedValuesByMode[modeId] = {
      resolvedValue,
      alias,
      aliasName
    };
  }

  return resolvedValuesByMode;
}

export async function exportVariables() {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const variables = await figma.variables.getLocalVariablesAsync();

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
        resolvedValuesByMode: calculateResolvedValuesByMode(variable, variables),
        scopes: variable.scopes,
        hiddenFromPublishing: variable.hiddenFromPublishing,
        codeSyntax: variable.codeSyntax || {}
      }))
    };
  });

  const jsonData = JSON.stringify(collectionsData, null, 2);
  figma.ui.postMessage({ type: 'export-json', data: jsonData });
}