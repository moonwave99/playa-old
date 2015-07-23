"use babel";

var AppDispatcher = require('../dispatcher/AppDispatcher')
var SidebarConstants = require('../constants/SidebarConstants')

var SidebarActions = {
  toggle: function(toggle){
    AppDispatcher.dispatch({
      actionType: SidebarConstants.TOGGLE,
      toggle: toggle
    })
  },
  select: function(tab){
    AppDispatcher.dispatch({
      actionType: SidebarConstants.SELECT_TAB,
      tab: tab
    })
  }
}

module.exports = SidebarActions;
