"use babel"

var _ = require('lodash')
var React = require('react')
var ReactPropTypes = React.PropTypes
var cx = require('classnames')

var FileBrowserTreeNode = require('./FileBrowserTreeNode.jsx')

var FileBrowser = React.createClass({
  propTypes: {
    tree: ReactPropTypes.array.isRequired,
    handleClick: ReactPropTypes.func,
    handleDoubleClick: ReactPropTypes.func,
    handleArrowClick: ReactPropTypes.func,
    selection: ReactPropTypes.array
  },
  renderNode: function(node, index){
    return (
      <FileBrowserTreeNode
        key={node.id}
        itemKey={node.id}
        node={node}
        index={index}
        handleClick={this.handleClick}
        handleDoubleClick={this.handleDoubleClick}
        handleArrowClick={this.handleArrowClick}
        isSelected={this.props.selection.indexOf(node.id) > -1}
        collapsed={node.isLeaf()}/>
    )
  },
  render: function() {
    var classes = cx({
      'browser'       : true,
      'list-unstyled' : true
    })
    return (
      <ol className={classes}>
        { this.props.tree.map( (i, index) => this.renderNode(i, index) ) }
      </ol>
    )
  },
  handleArrowClick: function(event, item){
    this.props.handleArrowClick(event, item)
  },
  handleClick: function(event, item){
    this.props.handleClick(event, item)
  },
  handleDoubleClick: function(event, item){
    this.props.handleDoubleClick && this.props.handleDoubleClick(event, item)
  }
})

module.exports = FileBrowser
