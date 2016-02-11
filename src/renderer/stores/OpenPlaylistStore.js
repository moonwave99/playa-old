"use babel"

var _ = require('lodash')
var md5 = require('md5')
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
    return playa.openPlaylistManager.getAll()
  },

  getAt: function(index){
    return playa.openPlaylistManager.getAt(index)
  },

  getSelectedIndex: function(){
    return playa.openPlaylistManager.getSelectedIndex()
  },

  getSelectedPlaylist: function(){
    return playa.openPlaylistManager.getSelectedPlaylist()
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
      case OpenPlaylistConstants.LOAD_PLAYLIST:
        playa.openPlaylistManager.load(action.id)
          .then(OpenPlaylistStore.emitChange.bind(OpenPlaylistStore))
          .catch((error)=>{
            console.error(error, error.stack)
          })
        break
      case OpenPlaylistConstants.UPDATE_PLAYLIST:
        playa.openPlaylistManager.update(action.id, action.values) && OpenPlaylistStore.emitChange()
        break
        case OpenPlaylistConstants.RELOAD_PLAYLIST:
          playa.openPlaylistManager.reload()
            .then(OpenPlaylistStore.emitChange.bind(OpenPlaylistStore))
            .catch((error)=>{
              console.error(error, error.stack)
            })
          break
      case OpenPlaylistConstants.SELECT_PLAYLIST:
        playa.openPlaylistManager.selectByIndex(action.selected)
        OpenPlaylistStore.emitChange()
        break
      case OpenPlaylistConstants.SELECT_PLAYLIST_BY_ID:
        var id = action.id
        if(!id){
          var firstPlaylist = playa.openPlaylistManager.getAt(0)
          id = firstPlaylist ? firstPlaylist.id : null
        }
        if(id){
          playa.openPlaylistManager.selectById(id)
          OpenPlaylistStore.emitChange()
        }
        break
      case OpenPlaylistConstants.ADD_PLAYLIST:
        playa.openPlaylistManager.add(action.playlists)
        if(!action.params || !action.params.silent){
          OpenPlaylistStore.emitChange()
        }
        break
      case OpenPlaylistConstants.SAVE_PLAYLIST:
        playa.openPlaylistManager.save()
          .then((playlist)=>{
            OpenPlaylistStore.emitChange()
          })
          .catch((error)=>{
            console.error(error, error.stack)
          })
        break
      case OpenPlaylistConstants.ADD_FOLDER:
        playa.openPlaylistManager.addFolder(action.folder)
          .then(()=>{
            if(playa.getSetting('user', 'autosave')){
              playa.openPlaylistManager.save().then((playlist)=>{
                OpenPlaylistStore.emitChange()
              })
            }else{
              OpenPlaylistStore.emitChange()
            }
          })
          .catch((error)=>{
            console.error(error, error.stack)
          })
        break
      case OpenPlaylistConstants.ADD_FOLDER_AT_POSITION:
        playa.openPlaylistManager.addFolderAtPosition(action.folder, action.positionId)
          .then(()=>{
            if(playa.getSetting('user', 'autosave')){
              playa.openPlaylistManager.save().then((playlist)=>{
                OpenPlaylistStore.emitChange()
              })
            }else{
              OpenPlaylistStore.emitChange()
            }
          })
          .catch((error)=>{
            console.error(error, error.stack)
          })
        break
      case OpenPlaylistConstants.SELECT_ALBUM:
        playa.player.currentPlaylist = action.playlist
        playa.player.loadAlbum(action.album, action.trackId)
          .then((album)=>{
            action.trackId && playa.player.gotoTrack(action.trackId)
            action.play && PlayerActions.play()
          })
          .catch((error)=>{
            console.error(error, error.stack)
          })
        break
      case OpenPlaylistConstants.REMOVE_FILES:
        playa.openPlaylistManager.removeFiles(action.ids)
        if(playa.getSetting('user', 'autosave')){
          playa.openPlaylistManager.save()
        }
        break
      case OpenPlaylistConstants.CLOSE_PLAYLIST:
        playa.openPlaylistManager.close()
        OpenPlaylistStore.emitChange()
        break
      case OpenPlaylistConstants.REORDER_PLAYLIST:
        playa.openPlaylistManager.reorder(action.id, action.from, action.to, action.position) && OpenPlaylistStore.emitChange()
        if(playa.getSetting('user', 'autosave')){
          playa.openPlaylistManager.save()
        }
        break
      case OpenPlaylistConstants.LOCATE_FOLDER:
        playa.openPlaylistManager.locateFolder(action.id, action.albumId, action.newFolder).then((playlist)=>{
          if(playa.getSetting('user', 'autosave')){
            playa.openPlaylistManager.save()
          }
          OpenPlaylistStore.emitChange()
        })
        break
    }

    return true // No errors. Needed by promise in Dispatcher.
  })

})

module.exports = OpenPlaylistStore
