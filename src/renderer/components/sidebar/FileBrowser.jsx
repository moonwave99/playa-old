'use babel';

import React, { PropTypes, Component } from 'react';
import cx from 'classnames';
import FileBrowserTreeNode from './FileBrowserTreeNode.jsx';

class FileBrowser extends Component {
  constructor(props) {
    super(props);
    this.handleArrowClick = this.handleArrowClick.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleDoubleClick = this.handleDoubleClick.bind(this);
    this.handleContextMenu = this.handleContextMenu.bind(this);
    this.renderNode = this.renderNode.bind(this);
  }
  handleArrowClick(event, item) {
    this.props.handleArrowClick(event, item);
  }
  handleClick(event, item) {
    this.props.handleClick(event, item);
  }
  handleDoubleClick(event, item) {
    if (this.props.handleDoubleClick) {
      this.props.handleDoubleClick(event, item);
    }
  }
  handleContextMenu(event, item) {
    if (this.props.handleContextMenu) {
      this.props.handleContextMenu(event, item);
    }
  }
  renderNode(node, index) {
    return (
      <FileBrowserTreeNode
        key={node.id}
        itemKey={node.id}
        node={node}
        index={index}
        handleClick={this.handleClick}
        handleDoubleClick={this.handleDoubleClick}
        handleArrowClick={this.handleArrowClick}
        handleContextMenu={this.handleContextMenu}
        isSelected={this.props.selection.indexOf(node.id) > -1}
        collapsed={node.isLeaf()}
      />
    );
  }
  render() {
    const classes = cx({
      browser: true,
      'list-unstyled': true,
    });
    return (
      <ol className={classes}>
        { this.props.tree.map(this.renderNode) }
      </ol>
    );
  }
}

FileBrowser.propTypes = {
  tree: PropTypes.arrayOf(
    PropTypes.shape({}),
  ).isRequired,
  handleClick: PropTypes.func,
  handleDoubleClick: PropTypes.func,
  handleArrowClick: PropTypes.func,
  handleContextMenu: PropTypes.func,
  selection: PropTypes.arrayOf(PropTypes.string),
};

export default FileBrowser;
