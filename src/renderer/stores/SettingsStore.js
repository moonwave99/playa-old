'use babel';

import { EventEmitter } from 'events';
import AppDispatcher from '../dispatcher/AppDispatcher';
import SettingsConstants from '../constants/SettingsConstants';

const CHANGE_EVENT = 'change';

const SettingsStore = Object.assign({}, EventEmitter.prototype, {
  getSettings() {
    return {
      user: playa.settings.user.all(),
      session: playa.settings.session.all(),
    };
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
      case SettingsConstants.SET_VALUE:
        playa.saveSetting(action.domain, action.key, action.value);
        SettingsStore.emitChange();
        break;
      default:
        break;
    }
    return true;
  }),
});

module.exports = SettingsStore;
