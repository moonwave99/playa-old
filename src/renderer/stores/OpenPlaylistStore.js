"use babel"

var _ = require('lodash')
var assign = require('object-assign')
var groove = require('groove')
var uid = require('uid')

var AppDispatcher = require('../dispatcher/AppDispatcher')
var EventEmitter = require('events').EventEmitter
var OpenPlaylistConstants = require('../constants/OpenPlaylistConstants')

var Playlist = require('../util/Playlist')

var CHANGE_EVENT = 'change'

var _playlists = []
var _selectedIndex = -1
var _activeIndex = -1

var _selectPlaylist = function(playlist, index){
  _selectedIndex = index
  playa.playlistLoader.load(playlist).then((playlist)=>{
    console.info('Selected ' + playlist.id)
    OpenPlaylistStore.emitChange()  
  })  
}

var OpenPlaylistStore = assign({}, EventEmitter.prototype, {
  getAll: function(){
    return _playlists;
  },
  
  getAt: function(index){
    return _playlists[index];
  },
  
  getSelectedIndex: function(){
    return _selectedIndex;
  },
  
  getSelectedPlaylist: function(){
    return _playlists[_selectedIndex];
  },  
  
  getActiveIndex: function(){
    return _activeIndex;
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
      case OpenPlaylistConstants.SELECT_PLAYLIST:
        var index = action.selected
        var playlist
        if(playlist = _playlists[index]){
          _selectPlaylist(playlist, index)
        }
        break
      case OpenPlaylistConstants.SELECT_PLAYLIST_BY_ID:
        var index = _.findIndex(_playlists, { id: action.id })
        var playlist
        if(playlist = _playlists[index]){
          _selectPlaylist(playlist, index)
        }
        break        
      case OpenPlaylistConstants.LOAD_PLAYLIST:
        if(_playlists[action.index]){
          _playlists[action.index].load().then(()=>{
            OpenPlaylistStore.emitChange()
          })
        }
        break        
      case OpenPlaylistConstants.ADD_PLAYLIST:
        var newPlaylists = _.difference(action.playlists.map( i => i.id), _playlists.map(i => i.id))
        _playlists = _playlists.concat(action.playlists.filter((p)=>{
          return newPlaylists.indexOf(p.id) > -1
        }))
        OpenPlaylistStore.emitChange()
        break
      case OpenPlaylistConstants.SAVE_PLAYLIST:
        var playlist
        if(playlist = _playlists[_selectedIndex]){
          playa.playlistLoader.save(playlist).then(()=>{
            console.info('Saved ' + playlist.id)
            OpenPlaylistStore.emitChange()
          })
        }        
        break
      case OpenPlaylistConstants.ADD_FOLDER:
        if (action.folder && _playlists[_selectedIndex]) {
          _playlists[_selectedIndex].addFolder(action.folder).then(()=>{
            OpenPlaylistStore.emitChange()  
          }).catch((err)=>{
            console.error(err.stack)
          })  
        }        
        break
      case OpenPlaylistConstants.PLAY_FILE:
        if(action.playlist.id !== _activeIndex){
          playa.player.clearPlaylist()
          playa.player.append(action.playlist.items.map((item)=> { return item.grooveFile } ))
          playa.player.goto(action.id)
          _activeIndex = action.playlist.id          
        }else if (action.id) {
          _activeIndex = action.playlist.id
          playa.player.goto(action.id)
        }
        break
      case OpenPlaylistConstants.REMOVE_FILES:
        if(_playlists[_selectedIndex]){
          _playlists[_selectedIndex].removeFiles(action.ids).then(function(){
            OpenPlaylistStore.emitChange()  
          }).catch((err)=>{
            console.error(err.stack)
          })
        }
        break        
      case OpenPlaylistConstants.CLOSE_PLAYLIST:
        if(_playlists[_selectedIndex]){
          _playlists[_selectedIndex].clear().then(function(){
            _playlists = _playlists.filter((playlist)=>{
              return playlist !== _playlists[_selectedIndex]
            })
            OpenPlaylistStore.emitChange()  
          }).catch((err)=>{
            console.error(err.stack)
          })          
        }
        break
      case OpenPlaylistConstants.UPDATE_UI:
        var playlist = _.findWhere(_playlists, { id: action.id })
        if(playlist){
          _.forEach(action.ui, (value, key)=>{
            playlist[key] = value
          })
          OpenPlaylistStore.emitChange()
        }
        break
    }

    return true // No errors. Needed by promise in Dispatcher.
  })  
    
})

module.exports = OpenPlaylistStore