"use babel";

var AppDispatcher = require('../dispatcher/AppDispatcher')
var SettingsConstants = require('../constants/SettingsConstants')

var SettingsActions = {
  set: function(domain, key, value){
    AppDispatcher.dispatch({
      actionType: SettingsConstants.SET_VALUE,
      domain: domain,
      key: key,
      value: value
    })
  }
}

module.exports = SettingsActions;
