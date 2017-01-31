import { isBoolean } from 'lodash';
import { EventEmitter } from 'events';
import AppDispatcher from '../dispatcher/AppDispatcher';
import SidebarConstants from '../constants/SidebarConstants';

const CHANGE_EVENT = 'change';

let _isOpen = false;
let _selectedTab = 0;
const _tabs = ['playlists', 'files', 'settings'];

const SidebarStore = Object.assign({}, EventEmitter.prototype, {
  getInfo() {
    return {
      isOpen: _isOpen,
      selectedTab: _selectedTab,
      tabs: _tabs,
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
      case SidebarConstants.SELECT_TAB:
        if (_isOpen && _selectedTab === action.tab) {
          _isOpen = false;
        } else {
          _isOpen = true;
          _selectedTab = action.tab;
        }
        SidebarStore.emitChange();
        break;
      case SidebarConstants.TOGGLE:
        _isOpen = isBoolean(action.toggle) ? action.toggle : !_isOpen;
        SidebarStore.emitChange();
        break;
      default:
        break;
    }
    return true;
  }),
});

export default SidebarStore;
