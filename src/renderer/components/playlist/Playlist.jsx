"use babel"

var _ = require('lodash')
var React = require('react')
var ReactPropTypes = React.PropTypes
var PlaylistItem = require('./PlaylistItem.jsx')

var PlaylistActions = require('../../actions/PlaylistActions')
var PlayerActions = require('../../actions/PlayerActions')

var Playlist = React.createClass({
  propTypes: {
    playlist: ReactPropTypes.object
  },
  render: function() {
    var items = _.map(this.props.playlist.items, (item, index)=>{
      return <PlaylistItem key={item.id} metadata={item.metadata} duration={item.duration} itemKey={item.id} onDoubleClick={this.handleDoubleClick} onClick={this.handleClick}/>
    })
    return (
      <div className="playlist">
        <table className="table">
          <colgroup>
            <col className="playlist-column-xs" />
            <col className="playlist-column-md" />
            <col className="playlist-column-md" />
            <col className="playlist-column-md" />
            <col className="playlist-column-sm" />
            <col className="playlist-column-sm" />
          </colgroup>
          <tbody>{items}</tbody>
        </table>
      </div>
    )
  },
  handleClick: function(item){
    
  },
  handleDoubleClick: function(item){
    PlaylistActions.playFile(item.props.itemKey, this.props.playlist)
    PlayerActions.play()    
  }
})

module.exports = Playlist