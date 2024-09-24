export async function exportVariables() {
  const variables = await figma.variables.getLocalVariablesAsync();
  const variablesData = variables.map(variable => ({
    id: variable.id,
    name: variable.name,
    key: variable.key,
    type: variable.resolvedType,
    valuesByMode: variable.valuesByMode
  }));
  
  const jsonData = JSON.stringify(variablesData, null, 2);
  figma.ui.postMessage({ type: 'export-json', data: jsonData });
  }