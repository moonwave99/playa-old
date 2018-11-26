const settings = require('electron-settings');

window.onload = function() {
  try {
    const startTime = Date.now();
    const bootstrapScript = settings.get('loadSettings.bootstrapScript');
    require('vm-compatibility-layer');
    require(bootstrapScript);
    require('electron').ipcRenderer.send('window-command', 'window:loaded');
  }
  catch (error) {
    var currentWindow = require('electron').remote.getCurrentWindow();
    currentWindow.setSize(1024, 768);
    currentWindow.center();
    currentWindow.show();
    currentWindow.openDevTools();
    console.error(error.stack || error);
  }
};
