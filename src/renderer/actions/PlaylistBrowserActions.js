'use babel';

import AppDispatcher from '../dispatcher/AppDispatcher';
import PlaylistBrowserConstants from '../constants/PlaylistBrowserConstants';

module.exports = {
  loadRoot() {
    AppDispatcher.dispatch({
      actionType: PlaylistBrowserConstants.LOAD_PLAYLIST_ROOT,
    });
  },
  expandNodes(nodes) {
    AppDispatcher.dispatch({
      actionType: PlaylistBrowserConstants.EXPAND_PLAYLIST_NODES,
      nodes,
    });
  },
  collapseNodes(nodes) {
    AppDispatcher.dispatch({
      actionType: PlaylistBrowserConstants.COLLAPSE_PLAYLIST_NODES,
      nodes,
    });
  },
  createPlaylist(parent) {
    AppDispatcher.dispatch({
      actionType: PlaylistBrowserConstants.CREATE_PLAYLIST,
      parent,
    });
  },
  deletePlaylist(node) {
    AppDispatcher.dispatch({
      actionType: PlaylistBrowserConstants.DELETE_PLAYLIST,
      node,
    });
  },
  createFolder(parent) {
    AppDispatcher.dispatch({
      actionType: PlaylistBrowserConstants.CREATE_FOLDER,
      parent,
    });
  },
};
