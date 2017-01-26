'use babel';

import _, { } from 'lodash';
import path from 'path';
import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import cx from 'classnames';
import { DropTarget as dropTarget } from 'react-dnd';
import { NativeTypes } from 'react-dnd/modules/backends/HTML5';
import DragDropConstants from '../../constants/DragDropConstants';

const normaliseDroppedFolder = function normaliseDroppedFolder(files) {
  let folders = null;
  return _(files)
    .filter(f => !f.type).map(f => f.path)
    .tap((f) => { folders = f; })
    .sortBy(f => f.split(path.sep).length)
    .filter(f => folders.filter(
      _f => (_f.indexOf(f) === 0) && (f !== _f)).length === 0
    )
    .value();
};

const dropAreaTarget = {
  drop(props, monitor) {
    const sourceItem = monitor.getItem();
    if (sourceItem.files) {
      sourceItem.source = NativeTypes.FILE;
    }
    switch (sourceItem.source) {
      case DragDropConstants.FILEBROWSER_FOLDER:
        props.handleFolderDrop(sourceItem.node.path);
        break;
      case DragDropConstants.PLAYLIST_ALBUM: {
        const draggedId = monitor.getItem().id;
        props.moveAlbum(draggedId, null, 'after');
        break;
      }
      case NativeTypes.FILE: {
        const folder = normaliseDroppedFolder(sourceItem.files);
        if (folder) {
          props.handleFolderDrop(folder);
        }
        break;
      }
      default:
        break;
    }
    props.handleDragEnd();
  },
  hover(props, monitor, component) {
    ReactDOM.findDOMNode(component).classList.add('over');  // eslint-disable-line
  },
};

class DropArea extends Component {
  render() {
    const classes = cx({
      'drop-area': true,
    });
    const style = {
      height: this.props.height,
    };
    return this.props.connectDropTarget(
      <div className={classes} style={style}>
        <span className="text">Drop albums here!</span>
      </div>
    );
  }
}

DropArea.propTypes = {
  height: PropTypes.string,
  connectDropTarget: PropTypes.func,
};

module.exports = dropTarget([
  DragDropConstants.PLAYLIST_ALBUM,
  DragDropConstants.FILEBROWSER_FOLDER,
  NativeTypes.FILE,
], dropAreaTarget, connect => ({
  connectDropTarget: connect.dropTarget(),
}))(DropArea);
