import cx from 'classnames';
import React, { PropTypes, Component } from 'react';
import { DragSource as dragSource } from 'react-dnd';
import DragDropConstants from '../../constants/DragDropConstants';

const fileBrowserTreeNodeSource = {
  beginDrag(props) {
    return {
      id: props.itemKey,
      originalIndex: props.index,
      node: props.node,
      source: DragDropConstants.FILEBROWSER_FOLDER,
    };
  },
  endDrag() {},
};

const getNodePadding = function getNodePadding(node) {
  const padding = ((node.depth * 1) + (node.isDirectory() ? 0 : 1.25) + 0.5);
  return `${padding}rem`;
};

class FileBrowserTreeNode extends Component {
  constructor(props) {
    super(props);
    this.playlistExtension = playa.getSetting('common', 'playlistExtension');
    this.handleClick = this.handleClick.bind(this);
    this.handleDoubleClick = this.handleDoubleClick.bind(this);
    this.handleArrowClick = this.handleArrowClick.bind(this);
    this.handleContextMenu = this.handleContextMenu.bind(this);
  }
  handleClick(event) {
    if (this.props.handleClick) {
      this.props.handleClick(event, this);
    }
  }
  handleDoubleClick(event) {
    if (this.props.handleDoubleClick) {
      this.props.handleDoubleClick(event, this);
    }
  }
  handleContextMenu(event) {
    if (this.props.handleContextMenu) {
      this.props.handleContextMenu(event, this);
    }
  }
  handleArrowClick(event) {
    event.stopPropagation();
    this.props.handleArrowClick(event, this);
  }
  renderNodeArrow() {
    const classes = cx({
      'node-arrow': true,
    });
    return <span onClick={this.handleArrowClick} className={classes} />;
  }
  renderNodeLabel() {
    const classes = cx({
      'node-label': true,
    });
    const iconClasses = cx({
      fa: true,
      'fa-fw': true,
      'fa-folder': this.props.node.isDirectory(),
      'fa-file-audio-o': this.props.node.extension === this.playlistExtension,
    });
    return (
      <span className={classes}>
        <i className={iconClasses} />
        {this.props.node.name}
      </span>
    );
  }
  render() {
    const node = this.props.node;
    const classes = cx({
      'browser-node': true,
      selected: this.props.isSelected,
      collapsed: this.props.collapsed,
      'has-arrow': node.isDirectory(),
    });
    const style = {
      paddingLeft: getNodePadding(node),
    };
    return this.props.connectDragSource(
      <li
        data-id={node.id}
        style={style}
        className={classes}
        onClick={this.handleClick}
        onDoubleClick={this.handleDoubleClick}
        onContextMenu={this.handleContextMenu}
      >
        { node.isDirectory() ? this.renderNodeArrow() : null }
        { this.renderNodeLabel() }
      </li>
    );
  }
}

FileBrowserTreeNode.propTypes = {
  collapsed: PropTypes.bool,
  isSelected: PropTypes.bool,
  connectDragSource: PropTypes.func,
  handleClick: PropTypes.func,
  handleDoubleClick: PropTypes.func,
  handleArrowClick: PropTypes.func,
  handleContextMenu: PropTypes.func,
  node: PropTypes.shape({
    extension: PropTypes.string,
    name: PropTypes.string,
    isDirectory: PropTypes.func,
  }),
};

const DraggedFileBrowserTreeNode = dragSource(
  DragDropConstants.FILEBROWSER_FOLDER,
  fileBrowserTreeNodeSource,
  (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
  }),
)(FileBrowserTreeNode);

export default DraggedFileBrowserTreeNode;
