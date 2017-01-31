import AppDispatcher from '../dispatcher/AppDispatcher';
import KeyboardFocusConstants from '../constants/KeyboardFocusConstants';

export default {
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
