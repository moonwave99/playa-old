'use babel';

import { EventEmitter } from 'events';
import AppDispatcher from '../dispatcher/AppDispatcher';
import PlayerConstants from '../constants/PlayerConstants';
import { formatTimeShort } from '../util/helpers/formatters';

const CHANGE_EVENT = 'change';

const formatInfo = function formatRemoteInfo(info, totalTime, currentTime) {
  return {
    totalTime,
    currentTime,
    remainingTime: totalTime - currentTime,
    playing: !!info.playing,
    hideInfo: !info.currentTrack,
    currentTrack: info.currentTrack,
    currentAlbum: info.currentAlbum,
  };
};

const formatRemoteInfo = function formatRemoteInfo(info, totalTime, currentTime) {
  return {
    totalTime,
    currentTime,
    remainingTime: totalTime - currentTime,
    formattedCurrentTime: formatTimeShort(currentTime),
    formattedRemainingTime: formatTimeShort(totalTime - currentTime),
    playing: !!info.playing,
    hideInfo: !info.currentTrack,
    currentTrackID: info.currentTrack && info.currentTrack.id,
    currentAlbumID: info.currentAlbum && info.currentAlbum.id,
    formattedTitle: info.currentTrack && info.currentTrack.formattedTitle(),
  };
};

const PlayerStore = Object.assign({}, EventEmitter.prototype, {
  getPlaybackInfo(options = {}) {
    const info = playa.player.playbackInfo();
    const totalTime = info.currentTrack ? info.currentTrack.duration : 0;
    const currentTime = info.position || 0;
    if (options.remote) {
      return formatRemoteInfo(info, totalTime, currentTime);
    }
    return formatInfo(info, totalTime, currentTime);
  },
  emitChange() {
    this.emit(CHANGE_EVENT);
  },
  addChangeListener(callback) {
    this.on(CHANGE_EVENT, callback);
  },
  removeChangeListener(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  },
  dispatcherIndex: AppDispatcher.register((action) => {
    switch (action.actionType) {
      case PlayerConstants.TOGGLE_PLAYBACK:
        if (playa.player.playing) {
          playa.player.pause();
        } else {
          playa.player.play();
        }
        PlayerStore.emitChange();
        break;
      case PlayerConstants.PLAY:
        playa.player.play();
        PlayerStore.emitChange();
        break;
      case PlayerConstants.PAUSE:
      case PlayerConstants.STOP:
        playa.player.pause();
        PlayerStore.emitChange();
        break;
      case PlayerConstants.NEXT_TRACK:
        if (playa.player.nextTrack()) {
          PlayerStore.emitChange();
        }
        break;
      case PlayerConstants.PREV_TRACK:
        if (playa.player.prevTrack()) {
          PlayerStore.emitChange();
        }
        break;
      case PlayerConstants.SEEK:
        playa.player.seek(action.to);
        PlayerStore.emitChange();
        break;
      default:
        break;
    }

    return true;
  }),
});

export default PlayerStore;
