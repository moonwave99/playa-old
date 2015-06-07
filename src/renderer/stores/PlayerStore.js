"use babel";

var assign = require('object-assign')
var ipc = require('ipc')

var AppDispatcher = require('../dispatcher/AppDispatcher')
var EventEmitter = require('events').EventEmitter
var PlayerConstants = require('../constants/PlayerConstants')

var Player = require('../util/Player')

var _player = new Player()

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
    }

    return true // No errors. Needed by promise in Dispatcher.
  })  
    
})

ipc.on('playback:toggle', function(){
  console.log(arguments, 'space')
  AppDispatcher.dispatch({
    actionType: _player.playing() ? PlayerConstants.PAUSE : PlayerConstants.PLAY
  })
})

module.exports = PlayerStore