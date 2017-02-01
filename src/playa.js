import { omit, map } from 'lodash';
import fs from 'fs-extra';
import fsPlus from 'fs-plus';
import md5 from 'md5';
import { ipcRenderer as ipc } from 'electron';
import path from 'path';
import React from 'react';
import ReactDOM from 'react-dom';
import i18next from 'i18next';
import Promise from 'bluebird';
import ffmpeg from 'fluent-ffmpeg';
import Main from './renderer/components/Main.jsx';
import Player from './renderer/util/Player';
import AlbumPlaylist from './renderer/util/AlbumPlaylist';
import PlaylistLoader from './renderer/util/PlaylistLoader';
import MediaFileLoader from './renderer/util/MediaFileLoader';
import CoverLoader from './renderer/util/CoverLoader';
import WaveformLoader from './renderer/util/WaveformLoader';
import LastFMClient from './renderer/util/LastFMClient';
import { formatTimeShort as formatTime } from './renderer/util/helpers/formatters';
import AppDispatcher from './renderer/dispatcher/AppDispatcher';
import PlayerConstants from './renderer/constants/PlayerConstants';
import FileBrowserConstants from './renderer/constants/FileBrowserConstants';
import PlaylistBrowserConstants from './renderer/constants/PlaylistBrowserConstants';
import OpenPlaylistConstants from './renderer/constants/OpenPlaylistConstants';
import KeyboardFocusConstants from './renderer/constants/KeyboardFocusConstants';
import SidebarConstants from './renderer/constants/SidebarConstants';
import PlayerStore from './renderer/stores/PlayerStore';
import OpenPlaylistStore from './renderer/stores/OpenPlaylistStore';
import SidebarStore from './renderer/stores/SidebarStore';
import OpenPlaylistActions from './renderer/actions/OpenPlaylistActions';
import KeyboardNameSpaceConstants from './renderer/constants/KeyboardNameSpaceConstants';
import OpenPlaylistManager from './renderer/util/OpenPlaylistManager';
import FileTree from './renderer/util/FileTree';
import SettingsBag from './renderer/util/SettingsBag';

Promise.promisifyAll(fs);

const _tabScopeNames = [
  KeyboardNameSpaceConstants.PLAYLIST_BROWSER,
  KeyboardNameSpaceConstants.FILE_BROWSER,
  KeyboardNameSpaceConstants.SETTINGS,
];

const initI18n = function initI18n() {
  return fs.readJsonAsync(path.join(__dirname, '../locales/en.json'))
    .then(data => i18next.init({
      lng: 'en',
      resources: {
        en: {
          translation: data,
        },
      },
    }));
};

const saveSessionSetting = function saveSessionSetting(key, value) {
  ipc.send('session:save', { key, value });
};

const selectTab = function selectTab(tab, tabScopeName) {
  AppDispatcher.dispatch({
    actionType: SidebarConstants.SELECT_TAB,
    tab,
  });
  if (SidebarStore.getInfo().isOpen) {
    AppDispatcher.dispatch({
      actionType: KeyboardFocusConstants.REQUEST_FOCUS,
      scopeName: tabScopeName,
    });
  } else {
    AppDispatcher.dispatch({
      actionType: KeyboardFocusConstants.REQUEST_FOCUS,
      scopeName: KeyboardNameSpaceConstants.ALBUM_PLAYLIST,
    });
  }
};

const onPlayerChange = function onPlayerChange() {
  ipc.send('remote:update', {
    playbackInfo: PlayerStore.getPlaybackInfo({ remote: true }),
  });
};

export default class Playa {
  constructor(options) {
    this.settings = {};
    this.settings.config = new SettingsBag({
      readOnly: true,
      data: options.config,
    });
    this.settings.common = new SettingsBag({
      readOnly: true,
      data: {
        userDataFolder: options.userDataFolder,
        playlistRoot: path.join(options.userDataFolder, this.getSetting('config', 'playlistFolderName')),
        fileExtensions: this.getSetting('config', 'fileExtensions'),
        playlistExtension: this.getSetting('config', 'playlistExtension'),
        useragent: `playa/v${this.getSetting('config', 'version')}`,
        scrobbleThreshold: this.getSetting('config', 'lastFM').scrobbleThreshold,
        storeFolders: {
          covers: this.getSetting('config', 'coverFolderName'),
          waveforms: this.getSetting('config', 'waveformFolderName'),
          playlists: this.getSetting('config', 'playlistFolderName'),
        },
      },
    });

    this.settings.session = new SettingsBag({
      data: options.sessionInfo.data,
      path: options.sessionInfo.path,
    });

    this.settings.ui = new SettingsBag({
      readOnly: true,
      data: {
        breakpoints: {
          widescreen: '1500px',
          widefont: '1700px',
        },
        baseFontSize: {
          normal: 14,
          wide: 16,
        },
      },
    });

    this.settings.user = new SettingsBag({
      path: path.join(options.userDataFolder, 'user_settings.json'),
    });
    this.settings.user.load();

    if (!this.settings.user.get('fileBrowserRoot')) {
      this.settings.user.set('fileBrowserRoot', path.join(process.env.HOME, 'Downloads'));
    }

    ['discogs', 'lastfm'].forEach((x) => {
      this.settings[x] = new SettingsBag({
        readOnly: true,
        path: path.join(__dirname, '..', 'settings', `${x}.json`),
      });
      this.settings[x].load();
    });

    this.fileTree = new FileTree({
      rootFolder: this.getSetting('user', 'fileBrowserRoot'),
      rootName: path.basename(this.getSetting('user', 'fileBrowserRoot')),
      filter: 'directory',
    });

    this.playlistTree = new FileTree({
      fileBrowser: this.fileBrowser,
      rootFolder: this.getSetting('common', 'playlistRoot'),
      rootName: this.getSetting('common', 'storeFolders').playlists,
      filter: this.getSetting('common', 'playlistExtension'),
    });

    this.playlistLoader = new PlaylistLoader({
      root: this.getSetting('common', 'playlistRoot'),
      playlistExtension: this.getSetting('common', 'playlistExtension'),
    });

    this.mediaFileLoader = new MediaFileLoader({
      fileExtensions: this.getSetting('common', 'fileExtensions'),
    });

    const discogsSettings = this.getSetting('config', 'discogs');
    this.coverLoader = new CoverLoader({
      root: path.join(options.userDataFolder, this.getSetting('common', 'storeFolders').covers),
      enableLog: this.getSetting('config', 'coverLoaderLog'),
      discogs: Object.assign(discogsSettings, {
        key: this.getSetting('discogs', 'DISCOGS_KEY'),
        secret: this.getSetting('discogs', 'DISCOGS_SECRET'),
      }),
    });

    const waveformSettings = this.getSetting('config', 'waveformLoader');
    this.waveformLoader = new WaveformLoader({
      root: path.join(options.userDataFolder, this.getSetting('common', 'storeFolders').waveforms),
      enableLog: waveformSettings.log,
      config: omit(waveformSettings, 'log'),
    });

    this.openPlaylistManager = new OpenPlaylistManager({
      loader: this.playlistLoader,
      mediaFileLoader: this.mediaFileLoader,
    });

    this.lastFMClient = new LastFMClient({
      scrobbleEnabled: this.getSetting('user', 'scrobbleEnabled'),
      key: this.getSetting('lastfm', 'LASTFM_KEY'),
      secret: this.getSetting('lastfm', 'LASTFM_SECRET'),
      useragent: this.getSetting('common', 'useragent'),
      sessionInfo: this.getSetting('session', 'lastFMSession'),
      authURL: this.getSetting('config', 'lastFM').authURL,
    });

    this.player = new Player({
      mediaFileLoader: this.mediaFileLoader,
      resolution: 1000,
      scrobbleThreshold: this.getSetting('common', 'scrobbleThreshold'),
    });

    ffmpeg.setFfprobePath(this.getSetting('config', 'ffprobePath'));

    this._onOpenPlaylistChange = this._onOpenPlaylistChange.bind(this);
    this.saveSetting = this.saveSetting.bind(this);
  }
  init() {
    this.firstPlaylistLoad = false;
    this.ensureFolders(map(this.getSetting('common', 'storeFolders'), value => value));

    this.lastFMClient.on('signout', () => {
      console.info('LastFM signout'); // eslint-disable-line
      this.saveSetting('session', 'lastFMSession', null);
    });

    this.lastFMClient.on('authorised', () => {
      console.info('LastFM authorisation succesful', this.lastFMClient.session);  // eslint-disable-line
      this.saveSetting('session', 'lastFMSession', {
        key: this.lastFMClient.session.key,
        user: this.lastFMClient.session.user,
      });
    });

    this.lastFMClient.on('scrobbledTrack', track => console.info('LastFM scrobbled:', track));  // eslint-disable-line

    this.player.on('trackChange', () => PlayerStore.emitChange());

    this.player.on('nowplaying', () => {
      const playbackInfo = PlayerStore.getPlaybackInfo();
      const selectedPlaylist = OpenPlaylistStore.getSelectedPlaylist();

      if (
        (selectedPlaylist.lastPlayedAlbumId !== playbackInfo.currentAlbum.id)
        || (selectedPlaylist.lastPlayedTrackId !== playbackInfo.currentTrack.id)
      ) {
        selectedPlaylist.lastPlayedAlbumId = playbackInfo.currentAlbum.id;
        selectedPlaylist.lastPlayedTrackId = playbackInfo.currentTrack.id;
        OpenPlaylistActions.savePlaylist();
      }
      PlayerStore.emitChange();
    });

    this.player.on('playerTick', () => PlayerStore.emitChange());

    this.player.on('scrobbleTrack', (track, after) => {
      if (this.getSetting('user', 'scrobbleEnabled')) {
        this.lastFMClient.scrobble(track, after);
      }
    });

    OpenPlaylistStore.addChangeListener(this._onOpenPlaylistChange);
    PlayerStore.addChangeListener(onPlayerChange);

    initI18n();
    this.initIPC();
    this.initRemote();
    this.loadPlaylists();
  }
  loadPlaylists() {
    let playlists = [];
    if (this.getSetting('session', 'openPlaylists')) {
      playlists = this.getSetting('session', 'openPlaylists')
        .filter(file => fsPlus.existsSync(file)).map(file =>
          new AlbumPlaylist({
            id: md5(file),
            path: file,
          }),
      );
    }

    if (playlists.length === 0) {
      playlists.push(new AlbumPlaylist({
        title: 'Untitled',
        id: md5(`Untitled${this.getSetting('common', 'playlistExtension')}`),
      }));
    }

    AppDispatcher.dispatch({
      actionType: OpenPlaylistConstants.ADD_PLAYLIST,
      playlists,
      params: {
        silent: true,
      },
    });

    AppDispatcher.dispatch({
      actionType: OpenPlaylistConstants.SELECT_PLAYLIST_BY_ID,
      id: this.getSetting('session', 'selectedPlaylist'),
    });
  }
  loadSidebarPlaylists() {
    AppDispatcher.dispatch({
      actionType: PlaylistBrowserConstants.LOAD_PLAYLIST_ROOT,
      folder: this.getSetting('session', 'playlistRoot'),
    });
  }
  loadSidebarFileBrowser() {
    AppDispatcher.dispatch({
      actionType: FileBrowserConstants.LOAD_FILEBROWSER_ROOT,
      folder: this.getSetting('user', 'fileBrowserRoot'),
    });
  }
  toggleSidebar(toggle) {
    AppDispatcher.dispatch({
      actionType: SidebarConstants.TOGGLE,
      toggle,
    });
    const SidebarStatus = SidebarStore.getInfo();
    if (SidebarStatus.isOpen) {
      switch (SidebarStatus.selectedTab) {
        case 0:
          this.loadSidebarPlaylists();
          break;
        case 1:
          this.loadSidebarFileBrowser();
          break;
        default:
          break;
      }
    }
  }
  initRemote() {
    if (this.getSetting('user', 'allowRemote')) {
      ipc.send('remote:start');
    }
  }
  initIPC() {
    ipc.on('sidebar:show', (event, tabName) => {
      let tab;
      switch (tabName) {
        case 'playlists':
          this.loadSidebarPlaylists();
          tab = 0;
          break;
        case 'files':
          this.loadSidebarFileBrowser();
          tab = 1;
          break;
        case 'settings':
          tab = 2;
          break;
        default:
          break;
      }
      selectTab(tab, _tabScopeNames[tab]);
    });

    ipc.on('playback:prev', () =>
      AppDispatcher.dispatch({
        actionType: PlayerConstants.PREV_TRACK,
      }),
    );

    ipc.on('playback:next', () =>
      AppDispatcher.dispatch({
        actionType: PlayerConstants.NEXT_TRACK,
      }),
    );

    ipc.on('playback:toggle', () =>
      AppDispatcher.dispatch({
        actionType: this.player.playing ? PlayerConstants.PAUSE : PlayerConstants.PLAY,
      }),
    );

    ipc.on('playback:seek', (event, params) =>
      AppDispatcher.dispatch({
        actionType: PlayerConstants.SEEK,
        to: params.seekTo,
      }),
    );

    ipc.on('sidebar:toggle', () => this.toggleSidebar());

    ipc.on('playlist:create', () => {
      const playlistExtension = this.getSetting('common', 'playlistExtension');
      const playlist = new AlbumPlaylist({
        title: 'Untitled',
        id: md5(`Untitled${playlistExtension}`),
      });
      AppDispatcher.dispatch({
        actionType: OpenPlaylistConstants.ADD_PLAYLIST,
        playlists: [playlist],
        silent: true,
      });
      AppDispatcher.dispatch({
        actionType: OpenPlaylistConstants.SELECT_PLAYLIST_BY_ID,
        playlists: [playlist],
        id: playlist.id,
      });
    });

    ipc.on('playlist:save', () =>
      AppDispatcher.dispatch({
        actionType: OpenPlaylistConstants.SAVE_PLAYLIST,
      }),
    );

    ipc.on('playlist:reload', () =>
      AppDispatcher.dispatch({
        actionType: OpenPlaylistConstants.RELOAD_PLAYLIST,
      }),
    );

    ipc.on('playlist:close', () =>
      AppDispatcher.dispatch({
        actionType: OpenPlaylistConstants.CLOSE_PLAYLIST,
      }),
    );

    ipc.on('playlist:select', (event, params) =>
      AppDispatcher.dispatch({
        actionType: OpenPlaylistConstants.SELECT_PLAYLIST_BY_ID,
        id: params.playlistId,
      }),
    );

    ipc.on('playlist:gotoAlbum', (event, message) => {
      const selectedPlaylist = this.openPlaylistManager.getSelectedPlaylist();
      if (!selectedPlaylist) {
        return;
      }
      const selectedAlbum = selectedPlaylist.getAlbumById(message.albumId);
      if (selectedAlbum) {
        AppDispatcher.dispatch({
          actionType: OpenPlaylistConstants.SELECT_ALBUM,
          playlist: selectedPlaylist,
          album: selectedAlbum,
          trackId: selectedAlbum.tracks[0].id,
          play: true,
        });
      }
    });

    ipc.on('playlist:gotoTrack', (event, message) => {
      const selectedPlaylist = this.openPlaylistManager.getSelectedPlaylist();
      if (!selectedPlaylist) {
        return;
      }
      const selectedAlbum = selectedPlaylist.getAlbumById(message.albumId);
      if (selectedAlbum) {
        AppDispatcher.dispatch({
          actionType: OpenPlaylistConstants.SELECT_ALBUM,
          playlist: selectedPlaylist,
          album: selectedAlbum,
          trackId: message.trackId,
          play: true,
        });
      }
    });

    ipc.on('open:folder', (event, folder) =>
      AppDispatcher.dispatch({
        actionType: OpenPlaylistConstants.ADD_FOLDER,
        folder,
      }),
    );
  }
  render() {
    ReactDOM.render(
      React.createElement(Main, this.settings.ui.all()),
      document.getElementById('main'),
    );
    this.postRender();
  }
  postRender() {
    console.info(`Welcome to Playa v${this.getSetting('config', 'version')}`);  // eslint-disable-line
    AppDispatcher.dispatch({
      actionType: KeyboardFocusConstants.REQUEST_FOCUS,
      scopeName: KeyboardNameSpaceConstants.ALBUM_PLAYLIST,
    });
  }
  saveSetting(domain, key, value) {
    if (domain === 'session') {
      saveSessionSetting(key, value);
    }
    const target = this.settings[domain];
    if (!target) {
      return;
    }
    target.set(key, value).save();
  }
  getSetting(domain, key) {
    const target = this.settings[domain];
    return target ? target.get(key) : null;
  }
  ensureFolders(folders = []) {
    folders.forEach(
      folder => fs.ensureDirSync(
        path.join(this.getSetting('common', 'userDataFolder'), folder),
      ),
    );
  }
  _onOpenPlaylistChange() {
    const playlists = this.openPlaylistManager.getAll();
    const playlistPaths = playlists.filter(i => !i.isNew()).map(i => i.path);
    const selectedPlaylist = this.openPlaylistManager.getSelectedPlaylist();

    if (selectedPlaylist) {
      this.saveSetting('session', 'selectedPlaylist', selectedPlaylist.id);
      AppDispatcher.dispatch({
        actionType: KeyboardFocusConstants.REQUEST_FOCUS,
        scopeName: KeyboardNameSpaceConstants.ALBUM_PLAYLIST,
      });
    }

    if (playlistPaths.length) {
      this.saveSetting('session', 'openPlaylists', playlistPaths);
      if (this.getSetting('user', 'allowRemote')) {
        ipc.send('remote:update', {
          playlists: playlists.map(({ id, title }) => ({ id, title })),
        });
      }
    }

    if (selectedPlaylist && this.getSetting('user', 'allowRemote')) {
      const serialisedPlaylist = selectedPlaylist.serializeForRemote();
      const items = selectedPlaylist.getItems({ disabled: false });
      Promise.settle(items.map((album, index) => {
        if (album.disabled) {
          return Promise.reject('Album disabled');
        }
        const _album = serialisedPlaylist.albums[index];
        return this.coverLoader.load(album).then((cover) => {
          _album.cover = path.basename(cover);
          return _album;
        }).catch(() => {
          _album.cover = null;
          return _album;
        }).finally(() => {
          _album.tracks = _album.tracks.map((track) => {
            track.formattedDuration = formatTime(track.duration);  // eslint-disable-line
            return track;
          });
          return _album;
        });
      })).then((albums) => {
        const _albums = albums.filter(x => x.isFulfilled()).map(x => x.value());
        serialisedPlaylist.albums = _albums;
        ipc.send('remote:update', { selectedPlaylist: serialisedPlaylist });
      });
    }

    if (!this.firstPlaylistLoad && (playlists.length > 0) && selectedPlaylist) {
      this.firstPlaylistLoad = true;
      const selectedAlbum = selectedPlaylist.getLastPlayedAlbum();
      if (selectedAlbum) {
        AppDispatcher.dispatch({
          actionType: OpenPlaylistConstants.SELECT_ALBUM,
          playlist: selectedPlaylist,
          album: selectedAlbum,
          trackId: selectedPlaylist.lastPlayedTrackId,
          play: false,
        });
      }
    }
  }
}
