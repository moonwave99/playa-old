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
      <li className={classes} onClick={this.handlePlaylistClick} onDoubleClick={this.handlePlaylistDoubleClick}>
        <i className="fa fa-fw fa-file-audio-o"></i>
        {this.props.playlist.title}
      </li>
    )
  },
  handlePlaylistClick: function(event){
    this.props.onClick(event, this)
  },
  handlePlaylistDoubleClick: function(event){
    this.props.onDoubleClick(event, this)
  }
})

module.exports = PlaylistBrowserEntry