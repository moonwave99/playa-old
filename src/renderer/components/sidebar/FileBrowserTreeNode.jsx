"use babel"

var _ = require('lodash')
var cx = require('classnames')
var React = require('react')
var ReactPropTypes = React.PropTypes
var TreeView = require('react-treeview')

var FileBrowserTreeNode = React.createClass({
  renderNodeArrow: function(){
    var classes = cx({
      'node-arrow'  : true
    })
    return (
      <span onClick={this.handleArrowClick} className={classes}></span>
    )
  },
  renderNodeLabel: function(){
    var classes = cx({
      'node-label': true
    })
    var iconClasses = cx({
      'fa' : true,
      'fa-fw' : true,
      'fa-folder': this.props.node.isDirectory(),
      'fa-file-audio-o' : this.props.node.extension == '.m3u'
    })
    return (
      <span className={classes}>
        <i className={iconClasses}></i> {this.props.node.name}
      </span>
    )
  },
  render: function(){
    var node = this.props.node
    var classes = cx({
      'browser-node'  : true,
      'selected'      : this.props.isSelected,
      'collapsed'     : this.props.collapsed,
      'has-arrow'     : node.isDirectory()
    })
    var style = {
      paddingLeft: ( node.depth * 1 + 1 + ( node.isDirectory() ? 0 : 1.25) )+ 'rem'
    }
    return (
      <li
        style={style}
        className={classes}
        onClick={this.handleClick}
        onDoubleClick={this.handleDoubleClick}>
        { node.isDirectory() ? this.renderNodeArrow() : null }
        { this.renderNodeLabel() }
      </li>
    )
  },
  handleClick: function(event){
    this.props.handleClick && this.props.handleClick(event, this)
  },
  handleDoubleClick(event){
    this.props.handleDoubleClick && this.props.handleDoubleClick(event, this)
  },
  handleArrowClick(event){
    event.stopPropagation()
    this.props.handleArrowClick(event, this)
  }
})

module.exports = FileBrowserTreeNode
