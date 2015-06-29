"use babel"

var _ = require('lodash')
var React = require('react')
var ReactPropTypes = React.PropTypes
var TreeView = require('react-treeview')
var cx = require('classnames')

var OpenPlaylistActions = require('../../actions/OpenPlaylistActions')

var PlaylistBrowser = React.createClass({
  render: function() {
    var classes = cx({
      'playlist-browser'  : true,
      'list-unstyled'     : true
    })
    return (
      <ul className={classes}>{
        this.props.tree.map((playlist)=>{
          return (
            <li key={playlist.id} onDoubleClick={this.handlePlaylistDoubleClick} data-playlist={playlist.id}>
              <i className="fa fa-fw fa-file-audio-o"></i>
              {playlist.title}
            </li>            
          )
        })
      }</ul>
    )
  },
  handlePlaylistDoubleClick: function(event){
    var id = React.findDOMNode(event.target).dataset.playlist;
    OpenPlaylistActions.add([_.findWhere(this.props.tree, { id: id })])
    OpenPlaylistActions.selectById(id)
  }
})

module.exports = PlaylistBrowser