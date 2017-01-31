import { EventEmitter } from 'events';
import AppDispatcher from '../dispatcher/AppDispatcher';
import ContextMenuConstants from '../constants/ContextMenuConstants';
import KeyboardFocusActions from '../actions/KeyboardFocusActions';
import KeyboardNameSpaceConstants from '../constants/KeyboardNameSpaceConstants';

const CHANGE_EVENT = 'change';
let _actions = [];
let _position = {};
let _prevContext = null;
let _isVisible = false;

const ContextMenuStore = Object.assign({}, EventEmitter.prototype, {
  getInfo() {
    return {
      isVisible: _isVisible,
      actions: _actions,
      position: _position,
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
      case ContextMenuConstants.CONTEXT_MENU_SHOW:
        _actions = action.actions;
        _position = action.position;
        _prevContext = action.prevContext;
        _isVisible = true;
        KeyboardFocusActions.requestFocus(KeyboardNameSpaceConstants.CONTEXT_MENU);
        ContextMenuStore.emitChange();
        break;
      case ContextMenuConstants.CONTEXT_MENU_HIDE:
        _actions = [];
        _isVisible = false;
        if (_prevContext) {
          KeyboardFocusActions.requestFocus(_prevContext);
        }
        _prevContext = null;
        ContextMenuStore.emitChange();
        break;
      default:
        break;
    }
    return true;
  }),
});

export default ContextMenuStore;
