"use babel";

var assign = require('object-assign')
var ipc = require('ipc')

var AppDispatcher = require('../dispatcher/AppDispatcher')
var EventEmitter = require('events').EventEmitter
var PlayerConstants = require('../constants/PlayerConstants')

var Playa = require('../../playa')

var _player = Playa.player

var CHANGE_EVENT = 'change'

var PlayerStore = assign({}, EventEmitter.prototype, {
  
  getPlaybackInfo: function(){
    return _player.playbackInfo()
  },
  
  emitChange: function() {
    this.emit(CHANGE_EVENT)
  },

  /**
   * @param {function} callback
   */
  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback)
  },

  /**
   * @param {function} callback
   */
  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback)
  },
  
  dispatcherIndex: AppDispatcher.register(function(action) {    
    switch(action.actionType) {
      case PlayerConstants.PLAY:
        _player.play(action.playlist)
        PlayerStore.emitChange()
        break
      case PlayerConstants.PAUSE:
      case PlayerConstants.STOP:        
        _player.pause()
        PlayerStore.emitChange()
        break
      case PlayerConstants.NEXT:
        var next = _player.next()
        if(next){
          PlayerStore.emitChange()
        }
        break
      case PlayerConstants.PREV:
        var prev = _player.prev()
        if(prev){
          PlayerStore.emitChange()
        }        
        break        
      case PlayerConstants.SEEK:        
        _player.seek(action.to)
        PlayerStore.emitChange()
        break                
    }

    return true // No errors. Needed by promise in Dispatcher.
  })  
    
})

_player.on('nowplaying', function(){
  PlayerStore.emitChange()
})

_player.on('playerTick', function(){
  PlayerStore.emitChange()
})

ipc.on('playback:prev', function(){
  AppDispatcher.dispatch({
    actionType: PlayerConstants.PREV
  })
})

ipc.on('playback:next', function(){
  AppDispatcher.dispatch({
    actionType: PlayerConstants.NEXT
  })
})

ipc.on('playback:toggle', function(){
  AppDispatcher.dispatch({
    actionType: _player.playing() ? PlayerConstants.PAUSE : PlayerConstants.PLAY
  })
})

module.exports = PlayerStore