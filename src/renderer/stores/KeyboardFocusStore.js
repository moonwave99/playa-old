"use babel";

var _ = require('lodash')
var assign = require('object-assign')
var ipc = require('ipc')
var key = require('keymaster')

var AppDispatcher = require('../dispatcher/AppDispatcher')
var EventEmitter = require('events').EventEmitter
var KeyboardFocusConstants = require('../constants/KeyboardFocusConstants')

var CHANGE_EVENT = 'change'

var _scopeName = ''
var _handlers = {}

var _bind = function(handlers, scopeName){
  _.map(handlers, (handler, keyMap)=>{
    if(keyMap == '*'){
      document.addEventListener('keydown', handler)
    }else{
      key(keyMap, scopeName, handler)
    }
  })
}

var _unbind = function(handlers, scopeName){
  _.map(handlers, (handler, keyMap)=>{
    if(keyMap == '*'){
      document.removeEventListener('keydown', handler)
    }else{
      keyMap.split(',').forEach( k => key.unbind(k.trim(), scopeName) )
    }
  })
}

var KeyboardFocusStore = assign({}, EventEmitter.prototype, {
  getCurrentScopeName: function(){
    return _scopeName
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
      case KeyboardFocusConstants.REQUEST_FOCUS:
        _scopeName = action.scopeName
        KeyboardFocusStore.emitChange()
        break
      case KeyboardFocusConstants.SET_FOCUS:
        _unbind(_handlers, _scopeName)
        _scopeName = action.scopeName
        _handlers = action.handlers
        _bind(_handlers, _scopeName)
        key.setScope(_scopeName)
        break
    }

    return true // No errors. Needed by promise in Dispatcher.
  })

})

module.exports = KeyboardFocusStore
