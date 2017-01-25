'use babel';

import AppDispatcher from '../dispatcher/AppDispatcher';
import SidebarConstants from '../constants/SidebarConstants';

module.exports = {
  toggle(toggle) {
    AppDispatcher.dispatch({
      actionType: SidebarConstants.TOGGLE,
      toggle,
    });
  },
  select(tab) {
    AppDispatcher.dispatch({
      actionType: SidebarConstants.SELECT_TAB,
      tab,
    });
  },
};
