// modules/ui.js - module entrypoint for LocalMemo
// Bootstrap the app with storage and UI managers from the modules layer.

import { DataManager } from './storage.js';
import { UIManager } from './ui-manager.js';

document.addEventListener('DOMContentLoaded', () => {
  const dataManager = new DataManager();
  const uiManager = new UIManager(dataManager);

  window.LocalMemoApp = {
    dataManager,
    uiManager,
  };

  console.log('LocalMemo initialized via modules/ui.js');
});

export { DataManager, UIManager };
