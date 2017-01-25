'use babel';

import AppDispatcher from '../dispatcher/AppDispatcher';
import ModalConstants from '../constants/ModalConstants';

module.exports = {
  show(params) {
    AppDispatcher.dispatch({
      actionType: ModalConstants.MODAL_SHOW,
      params,
    });
  },
  hide() {
    AppDispatcher.dispatch({
      actionType: ModalConstants.MODAL_HIDE,
    });
  },
};
