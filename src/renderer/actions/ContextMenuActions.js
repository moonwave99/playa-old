"use babel";

var AppDispatcher = require('../dispatcher/AppDispatcher')
var ContextMenuConstants = require('../constants/ContextMenuConstants')

var ContextMenuActions = {
  show: function(actions, position, event, prevContext){
    AppDispatcher.dispatch({
      actionType: ContextMenuConstants.CONTEXT_MENU_SHOW,
      actions: actions,
      position: position,
      event: event,
      prevContext: prevContext
    })
  },
  hide: function(){
    AppDispatcher.dispatch({
      actionType: ContextMenuConstants.CONTEXT_MENU_HIDE
    })
  }
}

module.exports = ContextMenuActions
