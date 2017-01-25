'use babel';

import AppDispatcher from '../dispatcher/AppDispatcher';
import SettingsConstants from '../constants/SettingsConstants';

module.exports = {
  set(domain, key, value) {
    AppDispatcher.dispatch({
      actionType: SettingsConstants.SET_VALUE,
      domain,
      key,
      value,
    });
  },
};
