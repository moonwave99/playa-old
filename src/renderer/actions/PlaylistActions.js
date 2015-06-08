"use babel";

var AppDispatcher = require('../dispatcher/AppDispatcher')
var PlaylistConstants = require('../constants/PlaylistConstants')

var PlaylistActions = {
  addFiles: function(files){
    AppDispatcher.dispatch({
      actionType: PlaylistConstants.ADD_FILES,
      files: files
    })
  },
  playFile: function(id){
    AppDispatcher.dispatch({
      actionType: PlaylistConstants.PLAY_FILE,
      id: id
    })    
  }
}

module.exports = PlaylistActions;