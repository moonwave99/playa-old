"use babel";

var assign = require('object-assign')
var ipc = require('ipc')

var AppDispatcher = require('../dispatcher/AppDispatcher')
var EventEmitter = require('events').EventEmitter
var ModalConstants = require('../constants/ModalConstants')

var CHANGE_EVENT = 'change'

var _isVisible = false
var _params = {}

var ModalStore = assign({}, EventEmitter.prototype, {
  getInfo: function() {
    return {
      isVisible: _isVisible,
      params: _params
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
    switch (action.actionType) {
      case ModalConstants.MODAL_SHOW:
        _params = action.params
        _isVisible = true
        ModalStore.emitChange()
        break
      case ModalConstants.MODAL_HIDE:
        _params = {}
        _isVisible = false
        ModalStore.emitChange()
        break
    }

    return true // No errors. Needed by promise in Dispatcher.
  })

})

module.exports = ModalStore
