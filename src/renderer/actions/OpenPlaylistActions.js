import AppDispatcher from '../dispatcher/AppDispatcher';
import OpenPlaylistConstants from '../constants/OpenPlaylistConstants';

export default {
  add(playlists, params) {
    AppDispatcher.dispatch({
      actionType: OpenPlaylistConstants.ADD_PLAYLIST,
      playlists,
      params,
    });
  },
  savePlaylist() {
    AppDispatcher.dispatch({
      actionType: OpenPlaylistConstants.SAVE_PLAYLIST,
    });
  },
  removeFiles(ids, playlist) {
    AppDispatcher.dispatch({
      actionType: OpenPlaylistConstants.REMOVE_FILES,
      ids,
      playlist,
    });
  },
  closePlaylist() {
    AppDispatcher.dispatch({
      actionType: OpenPlaylistConstants.CLOSE_PLAYLIST,
    });
  },
  addFolder(folder) {
    AppDispatcher.dispatch({
      actionType: OpenPlaylistConstants.ADD_FOLDER,
      folder,
    });
  },
  addFolderAtPosition(folder, positionId) {
    AppDispatcher.dispatch({
      actionType: OpenPlaylistConstants.ADD_FOLDER_AT_POSITION,
      folder,
      positionId,
    });
  },
  selectAlbum(album, trackId, playlist, play) {
    AppDispatcher.dispatch({
      actionType: OpenPlaylistConstants.SELECT_ALBUM,
      album,
      trackId,
      playlist,
      play,
    });
  },
  select(index) {
    AppDispatcher.dispatch({
      actionType: OpenPlaylistConstants.SELECT_PLAYLIST,
      selected: index,
    });
  },
  load(id) {
    AppDispatcher.dispatch({
      actionType: OpenPlaylistConstants.LOAD_PLAYLIST,
      id,
    });
  },
  selectById(id) {
    AppDispatcher.dispatch({
      actionType: OpenPlaylistConstants.SELECT_PLAYLIST_BY_ID,
      id,
    });
  },
  reload() {
    AppDispatcher.dispatch({
      actionType: OpenPlaylistConstants.RELOAD_PLAYLIST,
    });
  },
  update(id, values) {
    AppDispatcher.dispatch({
      actionType: OpenPlaylistConstants.UPDATE_PLAYLIST,
      id,
      values,
    });
  },
  reorder(id, from, to, position) {
    AppDispatcher.dispatch({
      actionType: OpenPlaylistConstants.REORDER_PLAYLIST,
      id,
      from,
      to,
      position,
    });
  },
  locateFolder(id, albumId, newFolder) {
    AppDispatcher.dispatch({
      actionType: OpenPlaylistConstants.LOCATE_FOLDER,
      id,
      albumId,
      newFolder,
    });
  },
};
