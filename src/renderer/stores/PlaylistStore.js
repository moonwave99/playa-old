"use babel"

var assign = require('object-assign')
var groove = require('groove')

var AppDispatcher = require('../dispatcher/AppDispatcher')
var EventEmitter = require('events').EventEmitter
var PlaylistConstants = require('../constants/PlaylistConstants')

var Playa = require('../../playa')

var _player = Playa.player
var _playlist = groove.createPlaylist()

var CHANGE_EVENT = 'change'

function add(files){
  files.forEach((file)=> {
    file && _playlist.insert(file)
  })  
}

var PlaylistStore = assign({}, EventEmitter.prototype, {
  getAll: function() {
    return _playlist.items()
  },
  
  getPlaylist: function(){
    return _playlist;
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
          _player.goto(action.id, _playlist)
          _player.play(_playlist)
        }
        break
      case PlaylistConstants.ADD_FILES:
        if (action.files) {
          add(action.files)
          PlaylistStore.emitChange()
        }
        break
    }

    return true // No errors. Needed by promise in Dispatcher.
  })  
    
})

module.exports = PlaylistStore