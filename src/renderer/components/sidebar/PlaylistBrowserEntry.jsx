"use babel"

var _ = require('lodash')
var React = require('react')
var ReactPropTypes = React.PropTypes
var TreeView = require('react-treeview')
var cx = require('classnames')

var PlaylistBrowserEntry = React.createClass({
  render: function() {
    var classes = cx({
      selected: this.props.isSelected
    })
    return (
      <li className={classes} onClick={this.handleClick} onDoubleClick={this.handleDoubleClick}>
        <i className="fa fa-fw fa-file-audio-o"></i>
        {this.props.playlist.title}
      </li>
    )
  },
  handleClick: function(event){
    this.props.handleClick(event, this)
  },
  handleDoubleClick: function(event){
    this.props.handleDoubleClick(event, this)
  }
})

module.exports = PlaylistBrowserEntry