"use babel";

var AppDispatcher = require('../dispatcher/AppDispatcher')
var KeyboardFocusConstants = require('../constants/KeyboardFocusConstants')

var KeyboardFocusActions = {
  requestFocus: function(scopeName){
    AppDispatcher.dispatch({
      actionType: KeyboardFocusConstants.REQUEST_FOCUS,
      scopeName: scopeName
    })
  },
  setFocus: function(handlers, scopeName){
    AppDispatcher.dispatch({
      actionType: KeyboardFocusConstants.SET_FOCUS,
      handlers: handlers,
      scopeName: scopeName
    })
  }
}

module.exports = KeyboardFocusActions
