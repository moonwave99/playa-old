"use babel";

var AppDispatcher = require('../dispatcher/AppDispatcher')
var PlayerConstants = require('../constants/PlayerConstants')

var PlayerActions = {
  play: function(playlist){
    AppDispatcher.dispatch({
      actionType: PlayerConstants.PLAY,
      playlist: playlist
    })
  },
  pause: function(){
    AppDispatcher.dispatch({
      actionType: PlayerConstants.PAUSE
    })
  },
  stop: function(){
    AppDispatcher.dispatch({
      actionType: PlayerConstants.STOP
    })
  },    
  next: function(){
    AppDispatcher.dispatch({
      actionType: PlayerConstants.NEXT
    })
  },
  prev: function(){
    AppDispatcher.dispatch({
      actionType: PlayerConstants.PREV
    })
  },
  seek: function(to){
    AppDispatcher.dispatch({
      actionType: PlayerConstants.SEEK,
      to: to
    })    
  }
}

module.exports = PlayerActions;