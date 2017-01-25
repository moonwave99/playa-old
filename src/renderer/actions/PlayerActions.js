'use babel';

import AppDispatcher from '../dispatcher/AppDispatcher';
import PlayerConstants from '../constants/PlayerConstants';

module.exports = {
  toggle() {
    AppDispatcher.dispatch({
      actionType: PlayerConstants.TOGGLE_PLAYBACK,
    });
  },
  play() {
    AppDispatcher.dispatch({
      actionType: PlayerConstants.PLAY,
    });
  },
  pause() {
    AppDispatcher.dispatch({
      actionType: PlayerConstants.PAUSE,
    });
  },
  stop() {
    AppDispatcher.dispatch({
      actionType: PlayerConstants.STOP,
    });
  },
  nextTrack() {
    AppDispatcher.dispatch({
      actionType: PlayerConstants.NEXT_TRACK,
    });
  },
  prevTrack() {
    AppDispatcher.dispatch({
      actionType: PlayerConstants.PREV_TRACK,
    });
  },
  seek(to) {
    AppDispatcher.dispatch({
      actionType: PlayerConstants.SEEK,
      to,
    });
  },
};
