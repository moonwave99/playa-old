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
var _activeIndex = -1

var PlaylistStore = assign({}, EventEmitter.prototype, {
  getAll: function(){
    return _playlists;
  },
  
  getAt: function(index){
    return _playlists[index];
  },
  
  getSelectedIndex: function(){
    return _selectedIndex;
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
      case PlaylistConstants.SELECT_PLAYLIST:
        if(_playlists[action.selected]){
          _selectedIndex = action.selected
          PlaylistStore.emitChange()
        }
        break
      case PlaylistConstants.CREATE:
        _playlists.push( new Playlist({ title: uid(), id: uid() }) )
        PlaylistStore.emitChange()
        break
      case PlaylistConstants.ADD_FOLDER:
        if (action.folder && _playlists[_selectedIndex]) {
          _playlists[_selectedIndex].add(action.folder).then(()=>{
            PlaylistStore.emitChange()  
          }).catch((err)=>{
            console.error(err.stack)
          })  
        }        
        break
      case PlaylistConstants.PLAY_FILE:
        if(action.playlist.id !== _activeIndex){
          _player.clearPlaylist()
          _player.append(action.playlist.items.map((item)=> { return item.grooveFile } ))
          _player.goto(action.id)
          _activeIndex = action.playlist.id          
        }else if (action.id) {
          _activeIndex = action.playlist.id
          _player.goto(action.id)
        }
        break
      case PlaylistConstants.CLEAR_PLAYLIST:
        if(_playlists[_selectedIndex]){
          _playlists[_selectedIndex].clear().then(function(){
            PlaylistStore.emitChange()  
          }).catch((err)=>{
            console.error(err.stack)
          })          
        }
        break
      case PlaylistConstants.CLOSE_PLAYLIST:
        if(_playlists[_selectedIndex]){
          _playlists[_selectedIndex].clear().then(function(){
            _playlists = _playlists.filter((playlist)=>{
              return playlist !== _playlists[_selectedIndex]
            })
            PlaylistStore.emitChange()  
          }).catch((err)=>{
            console.error(err.stack)
          })          
        }
        break        
    }

    return true // No errors. Needed by promise in Dispatcher.
  })  
    
})

module.exports = PlaylistStore