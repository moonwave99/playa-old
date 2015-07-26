"use babel"

var _ = require('lodash')
var md5 = require('MD5')
var assign = require('object-assign')
var groove = require('groove')
var uid = require('uid')

var AppDispatcher = require('../dispatcher/AppDispatcher')
var EventEmitter = require('events').EventEmitter
var OpenPlaylistConstants = require('../constants/OpenPlaylistConstants')
var PlayerActions = require('../actions/PlayerActions')
var PlayerStore = require('../stores/PlayerStore')

var OpenPlaylistManager = require('../util/OpenPlaylistManager')
var AlbumPlaylist = require('../util/AlbumPlaylist')

var CHANGE_EVENT = 'change'

var OpenPlaylistStore = assign({}, EventEmitter.prototype, {
  getAll: function(){
    return playa.openPlaylistManager.playlists
  },

  getAt: function(index){
    return playa.openPlaylistManager.getAt(index)
  },

  getSelectedIndex: function(){
    return playa.openPlaylistManager.selectedIndex
  },

  getSelectedPlaylist: function(){
    return playa.openPlaylistManager.getSelectedPlaylist()
  },

  getActiveIndex: function(){
    return playa.openPlaylistManager.activeIndex
  },

  emitChange: function(){
    this.emit(CHANGE_EVENT)
  },

  /**
   * @param {function} callback
   */
  addChangeListener: function(callback){
    this.on(CHANGE_EVENT, callback)
  },

  /**
   * @param {function} callback
   */
  removeChangeListener: function(callback){
    this.removeListener(CHANGE_EVENT, callback)
  },

  dispatcherIndex: AppDispatcher.register(function(action) {
    switch(action.actionType) {
      case OpenPlaylistConstants.UPDATE_PLAYLIST:
        playa.openPlaylistManager.update(action.id, action.values) && OpenPlaylistStore.emitChange()
        break
      case OpenPlaylistConstants.SELECT_PLAYLIST:
        playa.openPlaylistManager.selectByIndex(action.selected).then(OpenPlaylistStore.emitChange.bind(OpenPlaylistStore))
        break
      case OpenPlaylistConstants.SELECT_PLAYLIST_BY_ID:
        playa.openPlaylistManager.selectById(action.id).then(OpenPlaylistStore.emitChange.bind(OpenPlaylistStore))
        break
      case OpenPlaylistConstants.ADD_PLAYLIST:
        playa.openPlaylistManager.add(action.playlists)
        OpenPlaylistStore.emitChange()
        break
      case OpenPlaylistConstants.SAVE_PLAYLIST:
        playa.openPlaylistManager.save().then(OpenPlaylistStore.emitChange.bind(OpenPlaylistStore))
        break
      case OpenPlaylistConstants.ADD_FOLDER:
        playa.openPlaylistManager.addFolder(action.folder).then(OpenPlaylistStore.emitChange.bind(OpenPlaylistStore))
        break
      case OpenPlaylistConstants.ADD_FOLDER_AT_POSITION:
        playa.openPlaylistManager.addFolderAtPosition(action.folder, action.positionId).then(OpenPlaylistStore.emitChange.bind(OpenPlaylistStore))
        break
      case OpenPlaylistConstants.SELECT_ALBUM:
        playa.player.currentPlaylist = action.playlist
        playa.player.loadAlbum(action.album, action.trackId).then((album)=>{
          action.trackId && playa.player.gotoTrack(action.trackId)
          action.play && PlayerActions.play()
        })
        break
      case OpenPlaylistConstants.REMOVE_FILES:
        playa.openPlaylistManager.removeFiles(action.ids)
        break
      case OpenPlaylistConstants.CLOSE_PLAYLIST:
        playa.openPlaylistManager.close().then(OpenPlaylistStore.emitChange.bind(OpenPlaylistStore))
        break
      case OpenPlaylistConstants.REORDER_PLAYLIST:
        playa.openPlaylistManager.reorder(action.id, action.from, action.to, action.position) && OpenPlaylistStore.emitChange()
        break
    }

    return true // No errors. Needed by promise in Dispatcher.
  })

})

module.exports = OpenPlaylistStore
