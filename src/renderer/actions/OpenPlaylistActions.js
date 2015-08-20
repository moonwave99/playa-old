"use babel";

var AppDispatcher = require('../dispatcher/AppDispatcher')
var OpenPlaylistConstants = require('../constants/OpenPlaylistConstants')

module.exports = {
  add: function(playlists, params){
    AppDispatcher.dispatch({
      actionType: OpenPlaylistConstants.ADD_PLAYLIST,
      playlists: playlists,
      params: params
    })
  },
  savePlaylist: function(index){
    AppDispatcher.dispatch({
      actionType: OpenPlaylistConstants.SAVE_PLAYLIST
    })
  },
  removeFiles: function(ids, playlist){
    AppDispatcher.dispatch({
      actionType: OpenPlaylistConstants.REMOVE_FILES,
      ids: ids,
      playlist: playlist
    })
  },
  closePlaylist: function(){
    AppDispatcher.dispatch({
      actionType: OpenPlaylistConstants.CLOSE_PLAYLIST
    })
  },
  addFolder: function(folder){
    AppDispatcher.dispatch({
      actionType: OpenPlaylistConstants.ADD_FOLDER,
      folder: folder
    })
  },
  addFolderAtPosition: function(folder, positionId){
    AppDispatcher.dispatch({
      actionType: OpenPlaylistConstants.ADD_FOLDER_AT_POSITION,
      folder: folder,
      positionId: positionId
    })
  },
  selectAlbum: function(album, trackId, playlist, play){
    AppDispatcher.dispatch({
      actionType: OpenPlaylistConstants.SELECT_ALBUM,
      album: album,
      trackId: trackId,
      playlist: playlist,
      play: play
    })
  },
  select: function(index){
    AppDispatcher.dispatch({
      actionType: OpenPlaylistConstants.SELECT_PLAYLIST,
      selected: index
    })
  },
  load: function(id){
    AppDispatcher.dispatch({
      actionType: OpenPlaylistConstants.LOAD_PLAYLIST,
      id: id
    })
  },
  selectById: function(id){
    AppDispatcher.dispatch({
      actionType: OpenPlaylistConstants.SELECT_PLAYLIST_BY_ID,
      id: id
    })
  },
  reload: function(){
    AppDispatcher.dispatch({
      actionType: OpenPlaylistConstants.RELOAD_PLAYLIST
    })
  },
  update: function(id, values){
    AppDispatcher.dispatch({
      actionType: OpenPlaylistConstants.UPDATE_PLAYLIST,
      id: id,
      values: values
    })
  },
  reorder: function(id, from, to, position){
    AppDispatcher.dispatch({
      actionType: OpenPlaylistConstants.REORDER_PLAYLIST,
      id: id,
      from: from,
      to: to,
      position: position
    })
  },
  locateFolder: function(id, files, newFolder){
    AppDispatcher.dispatch({
      actionType: OpenPlaylistConstants.LOCATE_FOLDER,
      id: id,
      files: files,
      newFolder: newFolder
    })
  }
}
