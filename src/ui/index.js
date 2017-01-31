window.onload = function() {
  try {
    // Skip "?loadSettings=".
    var loadSettings = JSON.parse(decodeURIComponent(location.search.substr(14)));
    var startTime = Date.now();
    require('vm-compatibility-layer');
    window.loadSettings = loadSettings;
    require(loadSettings.bootstrapScript);
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
