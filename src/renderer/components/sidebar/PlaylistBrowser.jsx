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
      'playlist-browser'  : true
    })
    return (
      <div className={classes}>
        <TreeView key="root" nodeLabel="Playlists" defaultCollapsed={false}>
          <ul className="list-unstyled">
            {
              this.props.tree.map((playlist)=>{
                return (
                  <li key={playlist.id} onDoubleClick={this.handlePlaylistDoubleClick} data-playlist={playlist.id}>
                    <i className="fa fa-fw fa-file-audio-o"></i>
                    {playlist.title}
                  </li>            
                )
              })
            }
            </ul>
        </TreeView>
      </div>
    )
  },
  handlePlaylistDoubleClick: function(event){
    var id = React.findDOMNode(event.target).dataset.playlist;
    OpenPlaylistActions.add([_.findWhere(this.props.tree, { id: id })])
    OpenPlaylistActions.selectById(id)
  }
})

module.exports = PlaylistBrowser