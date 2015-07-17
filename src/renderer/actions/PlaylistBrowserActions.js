"use babel";

var AppDispatcher = require('../dispatcher/AppDispatcher')
var PlaylistBrowserConstants = require('../constants/PlaylistBrowserConstants')

var PlaylistBrowserActions = {
  loadRoot: function(){
    AppDispatcher.dispatch({
      actionType: PlaylistBrowserConstants.LOAD_PLAYLIST_ROOT
    })
  },
  expandNodes: function(nodes){
    AppDispatcher.dispatch({
      actionType: PlaylistBrowserConstants.EXPAND_PLAYLIST_NODES,
      nodes: nodes
    })
  },
  collapseNodes: function(nodes){
    AppDispatcher.dispatch({
      actionType: PlaylistBrowserConstants.COLLAPSE_PLAYLIST_NODES,
      nodes: nodes
    })
  },
  createPlaylist: function(parent){
    AppDispatcher.dispatch({
      actionType: PlaylistBrowserConstants.CREATE_PLAYLIST,
      parent: parent
    })
  },
  createFolder: function(parent){
    AppDispatcher.dispatch({
      actionType: PlaylistBrowserConstants.CREATE_FOLDER,
      parent: parent
    })
  }
}

module.exports = PlaylistBrowserActions
