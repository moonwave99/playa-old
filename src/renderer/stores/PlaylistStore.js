"use babel"

var ipc = require('ipc')
var assign = require('object-assign')

var AppDispatcher = require('../dispatcher/AppDispatcher')
var EventEmitter = require('events').EventEmitter
var PlaylistConstants = require('../constants/PlaylistConstants')

var Playa = require('../../playa')

var _player = Playa.player

var CHANGE_EVENT = 'change'

function add(files){
  files.forEach((file)=> {
    file && _player.insert(file)
  })  
}

function clearPlaylist() {
  return _player.clearPlaylist()
}

var PlaylistStore = assign({}, EventEmitter.prototype, {
  getAll: function() {
    return _player.getAll()
  },
  
  getPlaylist: function(){
    return _player.playlist;
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
      case PlaylistConstants.PLAY_FILE:
        if (action.id) {
          _player.goto(action.id)
        }
        break
      case PlaylistConstants.ADD_FILES:
        if (action.files) {
          add(action.files)
          PlaylistStore.emitChange()
        }
        break
      case PlaylistConstants.CLEAR_PLAYLIST:
        clearPlaylist().then(function(){
          PlaylistStore.emitChange()  
        }).catch((err)=>{

        })
        break
    }

    return true // No errors. Needed by promise in Dispatcher.
  })  
    
})

ipc.on('playlist:clear', function(){
  AppDispatcher.dispatch({
    actionType: PlaylistConstants.CLEAR_PLAYLIST
  })  
})

module.exports = PlaylistStore