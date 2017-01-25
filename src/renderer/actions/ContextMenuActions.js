'use babel';

import AppDispatcher from '../dispatcher/AppDispatcher';
import ContextMenuConstants from '../constants/ContextMenuConstants';

module.exports = {
  show(actions, position, event, prevContext) {
    AppDispatcher.dispatch({
      actionType: ContextMenuConstants.CONTEXT_MENU_SHOW,
      actions,
      position,
      event,
      prevContext,
    });
  },
  hide() {
    AppDispatcher.dispatch({
      actionType: ContextMenuConstants.CONTEXT_MENU_HIDE,
    });
  },
};
