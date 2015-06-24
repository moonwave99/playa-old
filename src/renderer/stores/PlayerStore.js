"use babel";

var assign = require('object-assign')
var ipc = require('ipc')

var AppDispatcher = require('../dispatcher/AppDispatcher')
var EventEmitter = require('events').EventEmitter
var PlayerConstants = require('../constants/PlayerConstants')

var CHANGE_EVENT = 'change'

var PlayerStore = assign({}, EventEmitter.prototype, {
  
  getPlaybackInfo: function(){
    return playa.player.playbackInfo()
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
        playa.player.play()
        PlayerStore.emitChange()
        break
      case PlayerConstants.PAUSE:
      case PlayerConstants.STOP:        
        playa.player.pause()
        PlayerStore.emitChange()
        break
      case PlayerConstants.NEXT:
        var next = playa.player.next()
        if(next){
          PlayerStore.emitChange()
        }
        break
      case PlayerConstants.PREV:
        var prev = playa.player.prev()
        if(prev){
          PlayerStore.emitChange()
        }        
        break        
      case PlayerConstants.SEEK:        
        playa.player.seek(action.to)
        PlayerStore.emitChange()
        break                
    }

    return true // No errors. Needed by promise in Dispatcher.
  })  
    
})

module.exports = PlayerStore