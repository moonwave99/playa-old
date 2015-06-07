"use babel";

var AppDispatcher = require('../dispatcher/AppDispatcher')
var PlaylistConstants = require('../constants/PlaylistConstants')

var PlaylistActions = {
  addFiles: function(files){
    AppDispatcher.dispatch({
      actionType: PlaylistConstants.ADD_FILES,
      files: files
    })
  }
}

module.exports = PlaylistActions;