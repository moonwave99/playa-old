import { EventEmitter } from 'events';
import AppDispatcher from '../dispatcher/AppDispatcher';
import FileBrowserConstants from '../constants/FileBrowserConstants';

const CHANGE_EVENT = 'change';

const FileBrowserStore = Object.assign({}, EventEmitter.prototype, {
  getFileTree() {
    return playa.fileTree.flatten();
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
      case FileBrowserConstants.LOAD_FILEBROWSER_ROOT:
        playa.fileTree.loadRoot()
          .then(() => FileBrowserStore.emitChange());
        break;
      case FileBrowserConstants.EXPAND_FILEBROWSER_NODES:
        playa.fileTree.expand(action.nodes)
        .then(() => FileBrowserStore.emitChange());
        break;
      case FileBrowserConstants.COLLAPSE_FILEBROWSER_NODES:
        playa.fileTree.collapse(action.nodes);
        FileBrowserStore.emitChange();
        break;
      default:
        break;
    }
    return true;
  }),
});

export default FileBrowserStore;
