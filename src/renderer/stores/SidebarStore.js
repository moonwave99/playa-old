"use babel";

var _ = require('lodash')
var ipc = require('electron').ipcRenderer
var assign = require('object-assign')

var AppDispatcher = require('../dispatcher/AppDispatcher')
var EventEmitter = require('events').EventEmitter
var SidebarConstants = require('../constants/SidebarConstants')

var CHANGE_EVENT = 'change'

var _isOpen = false
var _selectedTab = 0
var _tabs = ['playlists', 'files', 'settings']

var SidebarStore = assign({}, EventEmitter.prototype, {

  getInfo: function(){
    return {
      isOpen: _isOpen,
      selectedTab: _selectedTab,
      tabs: _tabs
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
      case SidebarConstants.SELECT_TAB:
        if(_isOpen && _selectedTab == action.tab){
          _isOpen = false
        }else{
          _isOpen = true
          _selectedTab = action.tab
        }
        SidebarStore.emitChange()
        break
      case SidebarConstants.TOGGLE:
        _isOpen = _.isBoolean(action.toggle) ? action.toggle : !_isOpen
        SidebarStore.emitChange()
        break
    }

    return true // No errors. Needed by promise in Dispatcher.
  })

})

module.exports = SidebarStore
