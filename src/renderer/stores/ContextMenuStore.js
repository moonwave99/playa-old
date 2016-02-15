"use babel";

var assign = require('object-assign')
var ipc = require('electron').ipcRenderer

var AppDispatcher = require('../dispatcher/AppDispatcher')
var EventEmitter = require('events').EventEmitter
var ContextMenuConstants = require('../constants/ContextMenuConstants')

var KeyboardFocusActions = require('../actions/KeyboardFocusActions')
var KeyboardNameSpaceConstants = require('../constants/KeyboardNameSpaceConstants')

var CHANGE_EVENT = 'change'

var _isVisible = false
var _actions = []
var _position = {}
var _prevContext = null

var ContextMenuStore = assign({}, EventEmitter.prototype, {
  getInfo: function(){
    return {
      isVisible: _isVisible,
      actions: _actions,
      position: _position
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
      case ContextMenuConstants.CONTEXT_MENU_SHOW:
        _actions = action.actions
        _position = action.position
        _prevContext = action.prevContext
        _isVisible = true
        KeyboardFocusActions.requestFocus(KeyboardNameSpaceConstants.CONTEXT_MENU)
        ContextMenuStore.emitChange()
        break
      case ContextMenuConstants.CONTEXT_MENU_HIDE:
        _actions = []
        _isVisible = false
        _prevContext && KeyboardFocusActions.requestFocus(_prevContext)
        _prevContext = null
        ContextMenuStore.emitChange()
        break
    }

    return true // No errors. Needed by promise in Dispatcher.
  })

})

module.exports = ContextMenuStore
