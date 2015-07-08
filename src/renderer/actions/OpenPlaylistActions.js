"use babel";

var AppDispatcher = require('../dispatcher/AppDispatcher')
var OpenPlaylistConstants = require('../constants/OpenPlaylistConstants')

module.exports = {
  add: function(playlists){
    AppDispatcher.dispatch({
      actionType: OpenPlaylistConstants.ADD_PLAYLIST,
      playlists: playlists
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
  playFile: function(id, playlist){
    AppDispatcher.dispatch({
      actionType: OpenPlaylistConstants.PLAY_FILE,
      id: id,
      playlist: playlist
    })    
  },
  playAlbum: function(album, trackId, playlist){
    AppDispatcher.dispatch({
      actionType: OpenPlaylistConstants.PLAY_ALBUM,
      album: album,
      trackId: trackId,
      playlist: playlist
    })    
  },  
  select: function(index){
    AppDispatcher.dispatch({
      actionType: OpenPlaylistConstants.SELECT_PLAYLIST,
      selected: index
    })    
  },
  selectById: function(id){
    AppDispatcher.dispatch({
      actionType: OpenPlaylistConstants.SELECT_PLAYLIST_BY_ID,
      id: id
    })        
  },  
  updateUI: function(id, ui){
    AppDispatcher.dispatch({
      actionType: OpenPlaylistConstants.UPDATE_UI,
      id: id,
      ui: ui
    })    
  },
  reorder: function(id, from, to, at){
    AppDispatcher.dispatch({
      actionType: OpenPlaylistConstants.REORDER_PLAYLIST,
      id: id,
      from: from,
      to: to,
      at: at
    })        
  }
}