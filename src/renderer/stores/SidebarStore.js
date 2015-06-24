"use babel";

var assign = require('object-assign')
var ipc = require('ipc')

var AppDispatcher = require('../dispatcher/AppDispatcher')
var EventEmitter = require('events').EventEmitter
var SidebarConstants = require('../constants/SidebarConstants')

var Playa = require('../../playa')

var CHANGE_EVENT = 'change'

var _showSidebar = false

var SidebarStore = assign({}, EventEmitter.prototype, {
  
  getSidebarInfo: function(){
    return {
      showSidebar: _showSidebar
    }
  },
  
  emitChange: function() {
    this.emit(CHANGE_EVENT)
  },

  /**
   * @param {function} callback
   */
  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback)
  },

  /**
   * @param {function} callback
   */
  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback)
  },
  
  dispatcherIndex: AppDispatcher.register(function(action) {    
    switch(action.actionType) {
      case SidebarConstants.TOGGLE:
        _showSidebar = !_showSidebar
        SidebarStore.emitChange()
        break
    }

    return true // No errors. Needed by promise in Dispatcher.
  })  
    
})

module.exports = SidebarStore