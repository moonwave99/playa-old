"use babel"

var _ = require('lodash')
var React = require('react')
var ReactPropTypes = React.PropTypes
var PlaylistTableItem = require('./PlaylistTableItem.jsx')

var PlaylistActions = require('../../actions/PlaylistActions')
var PlayerActions = require('../../actions/PlayerActions')

var PlaylistTable = React.createClass({
  propTypes: {
    playlist: ReactPropTypes.object,
    currentItem: ReactPropTypes.object,    
    handleClick: ReactPropTypes.func,
    handleDoubleClick: ReactPropTypes.func
  },
  render: function() {
    var items = _.map(this.props.playlist.items, (item, index)=>{
      return <PlaylistTableItem key={item.id} metadata={item.metadata} duration={item.duration} itemKey={item.id} onDoubleClick={this.handleDoubleClick} onClick={this.handleClick} isPlaying={item.id==this.props.currentItem.id}/>
    })
    return (      
      <table className="table">
        <colgroup>
          <col className="playlist-column-xs" />
          <col className="playlist-column-xs" />
          <col className="playlist-column-md" />
          <col className="playlist-column-md" />
          <col className="playlist-column-md" />
          <col className="playlist-column-sm" />
          <col className="playlist-column-sm" />
        </colgroup>
        <tbody>{items}</tbody>
      </table>
    )
  },
  handleClick: function(item){
    this.props.onClick(item)
  },
  handleDoubleClick: function(item){
    PlaylistActions.playFile(item.props.itemKey, this.props.playlist)
    PlayerActions.play()    
  }
})

module.exports = PlaylistTable