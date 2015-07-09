"use babel";

var AppDispatcher = require('../dispatcher/AppDispatcher')
var PlayerConstants = require('../constants/PlayerConstants')

var PlayerActions = {
  play: function(){
    AppDispatcher.dispatch({
      actionType: PlayerConstants.PLAY
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
  nextTrack: function(){
    AppDispatcher.dispatch({
      actionType: PlayerConstants.NEXT_TRACK
    })
  },
  prevTrack: function(){
    AppDispatcher.dispatch({
      actionType: PlayerConstants.PREV_TRACK
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