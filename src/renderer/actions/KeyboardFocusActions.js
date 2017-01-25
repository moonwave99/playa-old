'use babel';

import AppDispatcher from '../dispatcher/AppDispatcher';
import KeyboardFocusConstants from '../constants/KeyboardFocusConstants';

module.exports = {
  requestFocus(scopeName) {
    AppDispatcher.dispatch({
      actionType: KeyboardFocusConstants.REQUEST_FOCUS,
      scopeName,
    });
  },
  setFocus(handlers, scopeName) {
    AppDispatcher.dispatch({
      actionType: KeyboardFocusConstants.SET_FOCUS,
      handlers,
      scopeName,
    });
  },
};
