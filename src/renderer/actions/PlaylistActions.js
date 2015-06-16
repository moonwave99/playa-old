"use babel";

var AppDispatcher = require('../dispatcher/AppDispatcher')
var PlaylistConstants = require('../constants/PlaylistConstants')

var PlaylistActions = {
  create: function(){
    AppDispatcher.dispatch({
      actionType: PlaylistConstants.CREATE
    })    
  },
  clearPlaylist: function(){
    AppDispatcher.dispatch({
      actionType: PlaylistConstants.CLEAR_PLAYLIST,
    })
  },
  closePlaylist: function(){
    AppDispatcher.dispatch({
      actionType: PlaylistConstants.CLOSE_PLAYLIST,
    })
  },  
  addFolder: function(folder){
    AppDispatcher.dispatch({
      actionType: PlaylistConstants.ADD_FOLDER,
      folder: folder
    })
  },  
  playFile: function(id, playlist){
    AppDispatcher.dispatch({
      actionType: PlaylistConstants.PLAY_FILE,
      id: id,
      playlist: playlist
    })    
  },
  select: function(index){
    AppDispatcher.dispatch({
      actionType: PlaylistConstants.SELECT_PLAYLIST,
      selected: index
    })    
  },
  activate: function(index){
    AppDispatcher.dispatch({
      actionType: PlaylistConstants.ACTIVATE_PLAYLIST,
      selected: index
    })
  }
}

module.exports = PlaylistActions;