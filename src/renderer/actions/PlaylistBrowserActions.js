"use babel";

var AppDispatcher = require('../dispatcher/AppDispatcher')
var PlaylistBrowserConstants = require('../constants/PlaylistBrowserConstants')

var PlaylistBrowserActions = {
  loadTree: function(tree){
    AppDispatcher.dispatch({
      actionType: PlaylistBrowserConstants.LOAD_TREE,
      tree: tree
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