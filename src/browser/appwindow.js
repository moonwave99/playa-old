import { BrowserWindow, dialog } from 'electron';
import { EventEmitter } from 'events';
import path from 'path';
import url from 'url';

const mediaControlMap = {
  MediaPlayPause: 'playback:toggle',
  MediaNextTrack: 'playback:next',
  MediaPreviousTrack: 'playback:prev',
};

export default class AppWindow extends EventEmitter {
  constructor(options) {
    super();
    this.loadSettings = {
      bootstrapScript: path.resolve(__dirname, './renderer.js'),
    };
    Object.assign(this.loadSettings, options);
    const lastWindowState = this.loadSettings.sessionSettings.get('lastWindowState') || {};
    const windowOpts = {
      width: lastWindowState.width || 1024,
      height: lastWindowState.height || 768,
      x: lastWindowState.x,
      y: lastWindowState.y,
      transparent: true,
      frame: false,
      title: options.title != null ? options.title : 'You Should Set options.title',
      'web-preferences': {
        'subpixel-font-scaling': true,
        'direct-write': true,
      },
    };
    Object.assign(windowOpts, this.loadSettings);
    this.window = new BrowserWindow(windowOpts);

    if (lastWindowState.maximized) {
      this.window.maximize();
    }

    this.window.on('close', () => {
      this.loadSettings.sessionSettings.set('lastWindowState', Object.assign({
        maximized: this.window.isMaximized(),
      }, this.window.getBounds()));
      this.loadSettings.sessionSettings.save();
    });

    this.window.on('closed', e => this.emit('closed', e));

    this.window.on('devtools-opened', () =>
      this.window.webContents.send('window:toggle-dev-tools', true)
    );

    this.window.on('devtools-closed', () =>
      this.window.webContents.send('window:toggle-dev-tools', false)
    );
  }

  show() {
    const targetPath = path.resolve(__dirname, '..', 'src', 'ui', 'index.html');
    const targetUrl = url.format({
      protocol: 'file',
      pathname: targetPath,
      slashes: true,
      query: {
        loadSettings: JSON.stringify(this.loadSettings),
      },
    });
    this.window.loadURL(targetUrl);
    this.window.show();
  }

  openFolder() {
    const folder = dialog.showOpenDialog({ properties: ['openDirectory'], title: 'Open folder' });
    if (folder) {
      this.window.webContents.send('open:folder', folder[0]);
    }
  }
  prevTrack() {
    this.window.webContents.send('playback:prev');
  }
  nextTrack() {
    this.window.webContents.send('playback:next');
  }
  togglePlayback() {
    this.window.webContents.send('playback:toggle');
  }
  createPlaylist() {
    this.window.webContents.send('playlist:create');
  }
  savePlaylist() {
    this.window.webContents.send('playlist:save');
  }
  reloadPlaylist() {
    this.window.webContents.send('playlist:reload');
  }
  closePlaylist() {
    this.window.webContents.send('playlist:close');
  }
  toggleViewMode() {
    this.window.webContents.send('playlist:toggleViewMode');
  }
  showSettings() {
    this.window.webContents.send('sidebar:show', 'settings');
  }
  showPlaylists() {
    this.window.webContents.send('sidebar:show', 'playlists');
  }
  showFileBrowser() {
    this.window.webContents.send('sidebar:show', 'files');
  }
  togglePlaylistInfo() {
    this.window.webContents.send('playlist:toggleInfo');
  }
  gotoAlbum(data) {
    this.window.webContents.send('playlist:gotoAlbum', data);
  }
  gotoTrack(data) {
    this.window.webContents.send('playlist:gotoTrack', data);
  }
  selectPlaylist(data) {
    this.window.webContents.send('playlist:select', data);
  }
  seekTo(data) {
    this.window.webContents.send('playback:seek', data);
  }
  toggleSidebar() {
    this.window.webContents.send('sidebar:toggle');
  }
  sendMediaControl(mediaControl) {
    this.window.webContents.send(mediaControlMap[mediaControl]);
  }
  reload() {
    this.window.webContents.reload();
  }
  toggleFullScreen() {
    this.window.setFullScreen(!this.window.isFullScreen());
  }
  toggleDevTools() {
    this.window.toggleDevTools();
  }
  close() {
    this.window.close();
    this.window = null;
  }
}
