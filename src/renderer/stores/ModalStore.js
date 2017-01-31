import { EventEmitter } from 'events';
import AppDispatcher from '../dispatcher/AppDispatcher';
import ModalConstants from '../constants/ModalConstants';

const CHANGE_EVENT = 'change';

let _isVisible = false;
let _isDismissable = false;
let _params = {};

const ModalStore = Object.assign({}, EventEmitter.prototype, {
  getInfo() {
    return {
      isVisible: _isVisible,
      isDismissable: _isDismissable,
      params: _params,
    };
  },
  emitChange() {
    this.emit(CHANGE_EVENT);
  },
  addChangeListener(callback) {
    this.on(CHANGE_EVENT, callback);
  },
  removeChangeListener(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  },
  dispatcherIndex: AppDispatcher.register((action) => {
    switch (action.actionType) {
      case ModalConstants.MODAL_SHOW:
        _params = action.params;
        _isVisible = true;
        _isDismissable = !!action.params.isDismissable;
        ModalStore.emitChange();
        break;
      case ModalConstants.MODAL_HIDE:
        _params = {};
        _isVisible = false;
        _isDismissable = false;
        ModalStore.emitChange();
        break;
      default:
        break;
    }

    return true;
  }),
});

export default ModalStore;
