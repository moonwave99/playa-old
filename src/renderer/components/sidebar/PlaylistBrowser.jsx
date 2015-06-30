"use babel"

var _ = require('lodash')
var React = require('react')
var ReactPropTypes = React.PropTypes
var TreeView = require('react-treeview')
var cx = require('classnames')

var OpenPlaylistActions = require('../../actions/OpenPlaylistActions')
var PlaylistBrowserEntry = require('./PlaylistBrowserEntry.jsx')

var PlaylistBrowser = React.createClass({
  getInitialState: function(){
    return {
      selection: null
    }
  },
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
                return <PlaylistBrowserEntry playlist={playlist} key={playlist.id} onClick={this.handlePlaylistClick} onDoubleClick={this.handlePlaylistDoubleClick} isSelected={this.state.selection == playlist.id}/>
              })
            }
            </ul>
        </TreeView>
      </div>
    )
  },
  handlePlaylistClick: function(event, item){
    this.setState({
      selection: item.props.playlist.id
    })
  },
  handlePlaylistDoubleClick: function(event, item){
    var id = item.props.playlist.id;
    OpenPlaylistActions.add([_.findWhere(this.props.tree, { id: id })])
    OpenPlaylistActions.selectById(id)
  }
})

module.exports = PlaylistBrowser