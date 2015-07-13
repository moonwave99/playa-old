"use babel"

var _ = require('lodash')
var React = require('react')
var ReactPropTypes = React.PropTypes
var TreeView = require('react-treeview')
var cx = require('classnames')

var OpenPlaylistActions = require('../../actions/OpenPlaylistActions')
var PlaylistBrowserEntry = require('./PlaylistBrowserEntry.jsx')

var PlaylistBrowser = React.createClass({
  propTypes: {
    playlist: ReactPropTypes.object,
    handleClick: ReactPropTypes.func,
    handleDoubleClick: ReactPropTypes.func,
    selection: ReactPropTypes.array
  },
  render: function() {
    var classes = cx({
      'playlist-browser'  : true
    })
    return (
      <div className={classes}>
        <TreeView key="root" nodeLabel="/" defaultCollapsed={false}>
          <ul className="list-unstyled">
            {
              this.props.tree.map((playlist)=>{
                return <PlaylistBrowserEntry
                  playlist={playlist}
                  key={playlist.id}
                  itemKey={playlist.id}
                  handleClick={this.handleClick}
                  handleDoubleClick={this.handleDoubleClick}
                  isSelected={this.props.selection.indexOf(playlist.id) > -1}/>
              })
            }
            </ul>
        </TreeView>
      </div>
    )
  },
  handleClick: function(event, item){
    this.props.handleClick(event, item)
  },
  handleDoubleClick: function(event, item){
    OpenPlaylistActions.add([item.props.playlist])
    OpenPlaylistActions.selectById(item.props.playlist.id)
  }
})

module.exports = PlaylistBrowser
