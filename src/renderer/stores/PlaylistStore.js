"use babel"

var assign = require('object-assign')
var groove = require('groove')
var uid = require('uid')

var AppDispatcher = require('../dispatcher/AppDispatcher')
var EventEmitter = require('events').EventEmitter
var PlaylistConstants = require('../constants/PlaylistConstants')

var Playlist = require('../util/Playlist')
var Playa = require('../../playa')
var _player = Playa.player

var CHANGE_EVENT = 'change'

var _playlists = []
var _selectedIndex = -1

var PlaylistStore = assign({}, EventEmitter.prototype, {
  getAll: function() {
    return _playlists;
  },
  
  getAt: function(index){
    return _playlists[index];
  },
  
  getSelectedIndex: function(){
    return _selectedIndex;
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
      case PlaylistConstants.ACTIVATE_PLAYLIST:
        if(_playlists[action.selected]){
          _player.playlist = _playlists[_selectedIndex].groovePlaylist
          PlaylistStore.emitChange()
        }        
        break
      case PlaylistConstants.SELECT_PLAYLIST:
        if(_playlists[action.selected]){
          _selectedIndex = action.selected
          PlaylistStore.emitChange()
        }
        break
      case PlaylistConstants.CREATE:
        _playlists.push( new Playlist({ title: uid() }) )
        PlaylistStore.emitChange()
        break
      case PlaylistConstants.ADD_FILES:
        if (action.files && _playlists[_selectedIndex]) {
          _playlists[_selectedIndex].add(action.files)
          if(_playlists[_selectedIndex] !== _player.playlist){
            // _playlists[_selectedIndex].groovePlaylist.pause()
          }
          PlaylistStore.emitChange()
        }
        break
      case PlaylistConstants.PLAY_FILE:
        if(action.playlist.groovePlaylist !== _player.playlist){
          _player.detach().then(()=>{
            _player.playlist = action.playlist.groovePlaylist
            _player.goto(action.id)
          }).catch((error)=>{
            console.error(error.stack)
          })
        }else if (action.id) {
          _player.goto(action.id)
        }
        break
      case PlaylistConstants.CLEAR_PLAYLIST:
        if(_playlists[_selectedIndex]){
          _playlists[_selectedIndex].clear().then(function(){
            PlaylistStore.emitChange()  
          }).catch((err)=>{

          })          
        }
        break        
    }

    return true // No errors. Needed by promise in Dispatcher.
  })  
    
})

module.exports = PlaylistStore