/* eslint no-param-reassign: 0 */

import { app, BrowserWindow, ipcMain as ipc, Menu, dialog, globalShortcut } from 'electron';
import { EventEmitter } from 'events';
import path from 'path';
import config from '../config';
import AppMenu from './appmenu';
import AppWindow from './appwindow';
import AboutWindow from './aboutwindow';
import RemoteController from './remotecontroller';
import SettingsBag from '../renderer/util/SettingsBag';

const MEDIA_KEYS_SHORTCUTS = ['MediaPlayPause', 'MediaNextTrack', 'MediaPreviousTrack'];

export default class Application extends EventEmitter {
  constructor({ resourcePath, devMode }) {
    super();
    this.resourcePath = resourcePath;
    this.devMode = devMode;

    this.windows = [];
    this.configSettings = new SettingsBag({
      data: config(process.NODE_ENV),
      readOnly: true,
    });

    this.sessionSettings = new SettingsBag({
      path: path.join(app.getPath('userData'), 'session_settings.json'),
    }).load();

    this.registerGlobalShortcuts();

    app.on('window-all-closed', () => {
      if (['win32', 'linux'].indexOx(process.platform) > -1) {
        app.quit();
      }
    });

    app.on('will-quit', () => {
      console.log('Unregistering all global shortcuts...'); // eslint-disable-line
      globalShortcut.unregisterAll();
      if (this.remote.isActive()) {
        this.remote.stop();
      }
    });

    this.openWithOptions({
      resourcePath,
      devMode,
      sessionSettings: this.sessionSettings,
    });
  }
  openWithOptions(options) {
    const newWindow = this.openWindow(options);
    newWindow.show();
    this.windows.push(newWindow);
    this.initRemoteController(newWindow);
    newWindow.on('closed', () => {
      this.removeAppWindow(newWindow);
    });
  }
  openWindow(options) {
    const appWindow = new AppWindow(options);
    this.menu = new AppMenu();

    this.menu.attachToWindow(appWindow);

    this.menu.on('application:quit', () => app.quit());
    this.menu.on('application:about', () => this.openAboutWindow());
    this.menu.on('application:show-settings', () => appWindow.showSettings());
    this.menu.on('window:open', () => appWindow.openFolder());
    this.menu.on('window:prevTrack', () => appWindow.prevTrack());
    this.menu.on('window:nextTrack', () => appWindow.nextTrack());
    this.menu.on('window:togglePlayback', () => appWindow.togglePlayback());
    this.menu.on('window:createPlaylist', () => appWindow.createPlaylist());
    this.menu.on('window:savePlaylist', () => appWindow.savePlaylist());
    this.menu.on('window:reloadPlaylist', () => appWindow.reloadPlaylist());
    this.menu.on('window:closePlaylist', () => appWindow.closePlaylist());
    this.menu.on('window:toggleViewMode', () => appWindow.toggleViewMode());
    this.menu.on('window:showFileBrowser', () => appWindow.showFileBrowser());
    this.menu.on('window:showPlaylists', () => appWindow.showPlaylists());
    this.menu.on('window:toggleSidebar', () => appWindow.toggleSidebar());
    this.menu.on('window:togglePlaylistInfo', () => appWindow.togglePlaylistInfo());
    this.menu.on('window:reload', () => BrowserWindow.getFocusedWindow().reload());
    this.menu.on('window:toggle-full-screen', () => {
      const focusedWindow = BrowserWindow.getFocusedWindow();
      focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
    });
    this.menu.on('window:toggle-dev-tools', () => BrowserWindow.getFocusedWindow().toggleDevTools());
    this.menu.on('window:hide', () => Menu.sendActionToFirstResponder('hide:'));

    ipc.on('request:save:dialog', (event, params = {}) => {
      event.returnValue = dialog.showSaveDialog(params) || false;
    });

    ipc.on('request:open:dialog', (event, params = {}) => {
      event.returnValue = dialog.showOpenDialog(params) || false;
    });

    ipc.on('request:app:path', (event, params = {}) => {
      event.returnValue = app.getPath(params.key);
    });

    ipc.on('request:session:settings', (event) => {
      event.returnValue = this.sessionSettings;
    });

    ipc.on('session:save', (event, params = {}) => {
      this.sessionSettings.set(params.key, params.value);
      this.sessionSettings.save();
    });

    ipc.on('remote:start', (event) => {
      if (!this.remote.isActive()) {
        this.remote.start();
      }
      event.returnValue = true;
    });

    ipc.on('remote:stop', (event) => {
      if (this.remote.isActive()) {
        this.remote.stop();
      }
      event.returnValue = true;
    });

    ipc.on('remote:getAddress', (event) => {
      event.returnValue = this.remote.getAddress();
    });

    ipc.on('remote:isActive', (event) => {
      event.returnValue = this.remote.isActive();
    });

    ipc.on('remote:update', (event, params = {}) => {
      this.remote.update(params);
    });

    return appWindow;
  }
  removeAppWindow(appWindow) {
    this.windows.forEach((w, index) => {
      if (w === appWindow) {
        this.windows.splice(index, 1);
      }
    });
  }
  registerGlobalShortcuts() {
    MEDIA_KEYS_SHORTCUTS.forEach(shortcut =>
      globalShortcut.register(shortcut, () =>
        this.windows[0].sendMediaControl(shortcut),
      ),
    );
  }
  openAboutWindow() {
    this.aboutwindow = new AboutWindow();
    this.aboutwindow.show();
  }
  initRemoteController(appWindow) {
    const coverPath = path.join(
      app.getPath('userData'),
      this.configSettings.get('coverFolderName'),
    );
    this.remote = new RemoteController({
      window: appWindow,
      coverPath,
    });
  }
}
