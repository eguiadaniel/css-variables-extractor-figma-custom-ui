import { exportVariables } from "./export-variables"

figma.showUI(__html__);

figma.ui.onmessage = async (msg: { type: string }) => {
  if (msg.type === 'export') {
    await exportVariables();
  } else if (msg.type === 'close') {
    figma.closePlugin();
  }
};