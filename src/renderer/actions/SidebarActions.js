"use babel";

var AppDispatcher = require('../dispatcher/AppDispatcher')
var SidebarConstants = require('../constants/SidebarConstants')

var SidebarActions = {
  toggle: function(){
    AppDispatcher.dispatch({
      actionType: SidebarConstants.TOGGLE
    })
  }
}

module.exports = SidebarActions;