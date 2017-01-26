'use babel';

import { map } from 'lodash';
import { EventEmitter } from 'events';
import key from 'keymaster';
import AppDispatcher from '../dispatcher/AppDispatcher';
import KeyboardFocusConstants from '../constants/KeyboardFocusConstants';

const CHANGE_EVENT = 'change';
let _scopeName = '';
let _handlers = {};

const _bind = function _bind(handlers, scopeName) {
  map(handlers, (handler, keyMap) => {
    if (keyMap === '*') {
      document.addEventListener('keydown', handler);
    } else {
      key(keyMap, scopeName, handler);
    }
  });
};

const _unbind = function _unbind(handlers, scopeName) {
  map(handlers, (handler, keyMap) => {
    if (keyMap === '*') {
      document.removeEventListener('keydown', handler);
    } else {
      keyMap.split(',').forEach(k => key.unbind(k.trim(), scopeName));
    }
  });
};

const KeyboardFocusStore = Object.assign({}, EventEmitter.prototype, {
  getCurrentScopeName() {
    return _scopeName;
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
      case KeyboardFocusConstants.REQUEST_FOCUS:
        _scopeName = action.scopeName;
        KeyboardFocusStore.emitChange();
        break;
      case KeyboardFocusConstants.SET_FOCUS:
        _unbind(_handlers, _scopeName);
        _scopeName = action.scopeName;
        _handlers = action.handlers;
        _bind(_handlers, _scopeName);
        key.setScope(_scopeName);
        break;
      default:
        break;
    }

    return true;
  }),
});

module.exports = KeyboardFocusStore;
