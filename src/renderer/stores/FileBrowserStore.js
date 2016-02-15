"use babel";

var assign = require('object-assign')
var path = require('path')
var ipc = require('electron').ipcRenderer

var FileTree = require('../util/FileTree')
var AppDispatcher = require('../dispatcher/AppDispatcher')
var EventEmitter = require('events').EventEmitter
var FileBrowserConstants = require('../constants/FileBrowserConstants')

var CHANGE_EVENT = 'change'

var FileBrowserStore = assign({}, EventEmitter.prototype, {

  getFileTree: function(){
    return playa.fileTree.flatten()
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
      case FileBrowserConstants.LOAD_FILEBROWSER_ROOT:
        playa.fileTree.loadRoot().then(()=>{
          FileBrowserStore.emitChange()
        })
        break
      case FileBrowserConstants.EXPAND_FILEBROWSER_NODES:
        playa.fileTree.expand(action.nodes).then(()=>{
          FileBrowserStore.emitChange()
        })
        break
      case FileBrowserConstants.COLLAPSE_FILEBROWSER_NODES:
        playa.fileTree.collapse(action.nodes)
        FileBrowserStore.emitChange()
        break
    }

    return true // No errors. Needed by promise in Dispatcher.
  })

})

module.exports = FileBrowserStore
