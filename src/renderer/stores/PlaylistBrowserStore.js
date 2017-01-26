'use babel';

import { EventEmitter } from 'events';
import AppDispatcher from '../dispatcher/AppDispatcher';
import PlaylistBrowserConstants from '../constants/PlaylistBrowserConstants';

const CHANGE_EVENT = 'change';

const PlaylistBrowserStore = Object.assign({}, EventEmitter.prototype, {
  getPlaylistTree() {
    return playa.playlistTree.flatten();
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
      case PlaylistBrowserConstants.LOAD_PLAYLIST_ROOT:
        playa.playlistTree.loadRoot()
          .then(() => PlaylistBrowserStore.emitChange());
        break;
      case PlaylistBrowserConstants.EXPAND_PLAYLIST_NODES:
        playa.playlistTree.expand(action.nodes)
          .then(() => PlaylistBrowserStore.emitChange());
        break;
      case PlaylistBrowserConstants.COLLAPSE_PLAYLIST_NODES:
        playa.playlistTree.collapse(action.nodes);
        PlaylistBrowserStore.emitChange();
        break;
      case PlaylistBrowserConstants.DELETE_PLAYLIST:
        action.node.delete()
          .then(() => playa.playlistTree.loadRoot())
          .then(() => PlaylistBrowserStore.emitChange())
          .catch(error => console.error(error, error.stack));  // eslint-disable-line
        break;
      default:
        break;
    }

    return true;
  }),
});

module.exports = PlaylistBrowserStore;
