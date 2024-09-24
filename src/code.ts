import { exportVariables } from "./export-variables"

figma.showUI(__html__);



figma.ui.onmessage = async (msg: { type: string, count: number }) => {
  if (msg.type === 'export') {
    exportVariables();
    
  } else if (msg.type === 'close') {
    figma.closePlugin();
  }
};
