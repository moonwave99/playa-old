"use babel";

var assign = require('object-assign')
var ipc = require('electron').ipcRenderer

var AppDispatcher = require('../dispatcher/AppDispatcher')
var EventEmitter = require('events').EventEmitter
var PlayerConstants = require('../constants/PlayerConstants')
var PlaylistItem = require('../util/PlaylistItem')

var CHANGE_EVENT = 'change'

var PlayerStore = assign({}, EventEmitter.prototype, {

  getPlaybackInfo: function(options={}){
    var info = playa.player.playbackInfo()
    var totalTime = info.currentTrack ? info.currentTrack.duration : 0
    var currentTime = info.position || 0
    if(options.remote){
      return{
        totalTime: totalTime,
        currentTime: currentTime,
        remainingTime: totalTime - currentTime,
        playing: !!info.playing,
        hideInfo: !info.currentTrack,
        currentTrackID: info.currentTrack && info.currentTrack.id,
        currentAlbumID: info.currentAlbum && info.currentAlbum.id
      }

    }else{
      return{
        totalTime: totalTime,
        currentTime: currentTime,
        remainingTime: totalTime - currentTime,
        playing: !!info.playing,
        hideInfo: !info.currentTrack,
        currentTrack: info.currentTrack,
        currentAlbum: info.currentAlbum
      }

    }
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
      case PlayerConstants.TOGGLE_PLAYBACK:
        playa.player.playing ? playa.player.pause() : playa.player.play()
        PlayerStore.emitChange()
        break
      case PlayerConstants.PLAY:
        playa.player.play()
        PlayerStore.emitChange()
        break
      case PlayerConstants.PAUSE:
      case PlayerConstants.STOP:
        playa.player.pause()
        PlayerStore.emitChange()
        break
      case PlayerConstants.NEXT_TRACK:
        var next = playa.player.nextTrack()
        if(next){
          PlayerStore.emitChange()
        }
        break
      case PlayerConstants.PREV_TRACK:
        var prev = playa.player.prevTrack()
        if(prev){
          PlayerStore.emitChange()
        }
        break
      case PlayerConstants.SEEK:
        playa.player.seek(action.to)
        PlayerStore.emitChange()
        break
    }

    return true // No errors. Needed by promise in Dispatcher.
  })

})

module.exports = PlayerStore
