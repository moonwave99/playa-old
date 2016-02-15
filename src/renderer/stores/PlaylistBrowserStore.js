"use babel";

var assign = require('object-assign')
var ipc = require('electron').ipcRenderer

var AppDispatcher = require('../dispatcher/AppDispatcher')
var EventEmitter = require('events').EventEmitter
var PlaylistBrowserConstants = require('../constants/PlaylistBrowserConstants')

var CHANGE_EVENT = 'change'

var PlaylistBrowserStore = assign({}, EventEmitter.prototype, {

  getPlaylistTree: function(){
    return playa.playlistTree.flatten()
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
      case PlaylistBrowserConstants.LOAD_PLAYLIST_ROOT:
        playa.playlistTree.loadRoot().then(()=>{
          PlaylistBrowserStore.emitChange()
        })
        break
      case PlaylistBrowserConstants.EXPAND_PLAYLIST_NODES:
        playa.playlistTree.expand(action.nodes).then(()=>{
          PlaylistBrowserStore.emitChange()
        })
        break
      case PlaylistBrowserConstants.COLLAPSE_PLAYLIST_NODES:
        playa.playlistTree.collapse(action.nodes)
        PlaylistBrowserStore.emitChange()
        break
      case PlaylistBrowserConstants.DELETE_PLAYLIST:
        action.node.delete()
          .then(()=>{
            return playa.playlistTree.loadRoot()
          })
          .then(()=>{
            PlaylistBrowserStore.emitChange()
          }).catch((error)=>{
            console.error(error, error.stack)
          })
        break
    }

    return true // No errors. Needed by promise in Dispatcher.
  })

})

module.exports = PlaylistBrowserStore
