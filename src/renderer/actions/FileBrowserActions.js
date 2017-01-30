'use babel';

import AppDispatcher from '../dispatcher/AppDispatcher';
import FileBrowserConstants from '../constants/FileBrowserConstants';

export default {
  loadRoot() {
    AppDispatcher.dispatch({
      actionType: FileBrowserConstants.LOAD_FILEBROWSER_ROOT,
    });
  },
  expandNodes(nodes) {
    AppDispatcher.dispatch({
      actionType: FileBrowserConstants.EXPAND_FILEBROWSER_NODES,
      nodes,
    });
  },
  collapseNodes(nodes) {
    AppDispatcher.dispatch({
      actionType: FileBrowserConstants.COLLAPSE_FILEBROWSER_NODES,
      nodes,
    });
  },
};
