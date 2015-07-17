"use babel";

var AppDispatcher = require('../dispatcher/AppDispatcher')
var FileBrowserConstants = require('../constants/FileBrowserConstants')

var FileBrowserActions = {
  loadRoot: function(){
    AppDispatcher.dispatch({
      actionType: FileBrowserConstants.LOAD_FILEBROWSER_ROOT
    })
  },
  expandNodes: function(nodes){
    AppDispatcher.dispatch({
      actionType: FileBrowserConstants.EXPAND_FILEBROWSER_NODES,
      nodes: nodes
    })
  },
  collapseNodes: function(nodes){
    AppDispatcher.dispatch({
      actionType: FileBrowserConstants.COLLAPSE_FILEBROWSER_NODES,
      nodes: nodes
    })
  }
}

module.exports = FileBrowserActions
