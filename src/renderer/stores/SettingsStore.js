"use babel";

var _ = require('lodash')
var ipc = require('electron').ipcRenderer
var assign = require('object-assign')

var AppDispatcher = require('../dispatcher/AppDispatcher')
var EventEmitter = require('events').EventEmitter
var SettingsConstants = require('../constants/SettingsConstants')

var CHANGE_EVENT = 'change'

var SettingsStore = assign({}, EventEmitter.prototype, {

  getSettings: function(){
    return {
      user: playa.settings.user.all(),
      session: playa.settings.session.all()
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
      case SettingsConstants.SET_VALUE:
        playa.saveSetting(action.domain, action.key, action.value)
        SettingsStore.emitChange()
        break
    }

    return true // No errors. Needed by promise in Dispatcher.
  })

})

module.exports = SettingsStore
