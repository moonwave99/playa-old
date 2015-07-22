"use babel";

var AppDispatcher = require('../dispatcher/AppDispatcher')
var ModalConstants = require('../constants/ModalConstants')

var ModalActions = {
  show: function(params){
    AppDispatcher.dispatch({
      actionType: ModalConstants.MODAL_SHOW,
      params: params
    })
  },
  hide: function(){
    AppDispatcher.dispatch({
      actionType: ModalConstants.MODAL_HIDE
    })
  }
}

module.exports = ModalActions
