'use babel';

import { EventEmitter } from 'events';
import AppDispatcher from '../dispatcher/AppDispatcher';
import OpenPlaylistConstants from '../constants/OpenPlaylistConstants';
import PlayerActions from '../actions/PlayerActions';

const logError = function logError(error) {
  console.error(error, error.stack); // eslint-disable-line
};

const CHANGE_EVENT = 'change';

const OpenPlaylistStore = Object.assign({}, EventEmitter.prototype, {
  getAll() {
    return playa.openPlaylistManager.getAll();
  },
  getAt(index) {
    return playa.openPlaylistManager.getAt(index);
  },
  getSelectedIndex() {
    return playa.openPlaylistManager.getSelectedIndex();
  },
  getSelectedPlaylist() {
    return playa.openPlaylistManager.getSelectedPlaylist();
  },
  emitChange() {
    this.emit(CHANGE_EVENT);
  },
  addChangeListener(callback) {
    this.on(CHANGE_EVENT, callback);
  },
  removeChangeListener(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  },
  dispatcherIndex: AppDispatcher.register((action) => {
    switch (action.actionType) {
      case OpenPlaylistConstants.LOAD_PLAYLIST:
        playa.openPlaylistManager.load(action.id)
          .then(OpenPlaylistStore.emitChange.bind(OpenPlaylistStore))
          .catch(logError);
        break;
      case OpenPlaylistConstants.UPDATE_PLAYLIST:
        if (playa.openPlaylistManager.update(action.id, action.values)) {
          OpenPlaylistStore.emitChange();
        }
        break;
      case OpenPlaylistConstants.RELOAD_PLAYLIST:
        playa.openPlaylistManager.reload()
          .then(OpenPlaylistStore.emitChange.bind(OpenPlaylistStore))
          .catch(logError);
        break;
      case OpenPlaylistConstants.SELECT_PLAYLIST:
        playa.openPlaylistManager.selectByIndex(action.selected);
        OpenPlaylistStore.emitChange();
        break;
      case OpenPlaylistConstants.SELECT_PLAYLIST_BY_ID: {
        let id = action.id;
        if (!id) {
          const firstPlaylist = playa.openPlaylistManager.getAt(0);
          id = firstPlaylist ? firstPlaylist.id : null;
        }
        if (id) {
          playa.openPlaylistManager.selectById(id);
          OpenPlaylistStore.emitChange();
        }
        break;
      }
      case OpenPlaylistConstants.ADD_PLAYLIST:
        playa.openPlaylistManager.add(action.playlists);
        if (!action.params || !action.params.silent) {
          OpenPlaylistStore.emitChange();
        }
        break;
      case OpenPlaylistConstants.SAVE_PLAYLIST:
        playa.openPlaylistManager.save()
          .then(() => OpenPlaylistStore.emitChange())
          .catch(logError);
        break;
      case OpenPlaylistConstants.ADD_FOLDER:
        playa.openPlaylistManager.addFolder(action.folder)
          .then(() => {
            if (playa.getSetting('user', 'autosave')) {
              playa.openPlaylistManager.save()
                .then(() => OpenPlaylistStore.emitChange());
            } else {
              OpenPlaylistStore.emitChange();
            }
          })
          .catch(logError);
        break;
      case OpenPlaylistConstants.ADD_FOLDER_AT_POSITION:
        playa.openPlaylistManager.addFolderAtPosition(action.folder, action.positionId)
          .then(() => {
            if (playa.getSetting('user', 'autosave')) {
              playa.openPlaylistManager.save().then(() => OpenPlaylistStore.emitChange());
            } else {
              OpenPlaylistStore.emitChange();
            }
          })
          .catch(logError);
        break;
      case OpenPlaylistConstants.SELECT_ALBUM:
        playa.player.currentPlaylist = action.playlist;
        playa.player.loadAlbum(action.album, action.trackId)
          .then(() => {
            if (action.trackId) {
              playa.player.gotoTrack(action.trackId);
            }
            if (action.play) {
              PlayerActions.play();
            }
          })
          .catch(logError);
        break;
      case OpenPlaylistConstants.REMOVE_FILES:
        playa.openPlaylistManager.removeFiles(action.ids);
        if (playa.getSetting('user', 'autosave')) {
          playa.openPlaylistManager.save();
        }
        break;
      case OpenPlaylistConstants.CLOSE_PLAYLIST:
        playa.openPlaylistManager.close();
        OpenPlaylistStore.emitChange();
        break;
      case OpenPlaylistConstants.REORDER_PLAYLIST:
        if (playa.openPlaylistManager.reorder(action.id, action.from, action.to, action.position)) {
          OpenPlaylistStore.emitChange();
        }
        if (playa.getSetting('user', 'autosave')) {
          playa.openPlaylistManager.save();
        }
        break;
      case OpenPlaylistConstants.LOCATE_FOLDER:
        playa.openPlaylistManager.locateFolder(action.id, action.albumId, action.newFolder)
          .then(() => {
            if (playa.getSetting('user', 'autosave')) {
              playa.openPlaylistManager.save();
            }
            OpenPlaylistStore.emitChange();
          });
        break;
      default:
        break;
    }
    return true;
  }),
});

export default OpenPlaylistStore;
