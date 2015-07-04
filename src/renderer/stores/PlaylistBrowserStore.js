"use babel";

var assign = require('object-assign')
var ipc = require('ipc')

var AppDispatcher = require('../dispatcher/AppDispatcher')
var EventEmitter = require('events').EventEmitter
var PlaylistBrowserConstants = require('../constants/PlaylistBrowserConstants')

var CHANGE_EVENT = 'change'

var _playlistTree = []

var PlaylistBrowserStore = assign({}, EventEmitter.prototype, {
  
  getPlaylistTree: function(){
    return _playlistTree
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
      case PlaylistBrowserConstants.LOAD_TREE:
        _playlistTree = action.tree
        PlaylistBrowserStore.emitChange()
        break
    }

    return true // No errors. Needed by promise in Dispatcher.
  })  
    
})

module.exports = PlaylistBrowserStore