"use babel"

var _ = require('lodash')
var key = require('keymaster')
var React = require('react')
var ReactPropTypes = React.PropTypes
var PlaylistTableItem = require('./PlaylistTableItem.jsx')

var OpenPlaylistActions = require('../../actions/OpenPlaylistActions')
var PlayerActions = require('../../actions/PlayerActions')
var PlayerStore = require('../../stores/PlayerStore')

function getPlayerState(){
  var playerState = PlayerStore.getPlaybackInfo()
  return {
    currentItem: playerState.item
  }  
}

var PlaylistTable = React.createClass({
  propTypes: {
    playlist: ReactPropTypes.object,
    handleClick: ReactPropTypes.func,
    handleDoubleClick: ReactPropTypes.func
  },
  getInitialState: function(){
    return getPlayerState()
  },
  componentDidMount: function(){
    PlayerStore.addChangeListener(this._onPlayerChange)
  },
  componentWillUnmount: function(){
    PlayerStore.removeChangeListener(this._onPlayerChange)
  },  
  render: function() {
    var items = _.map(this.props.playlist.items, (item, index)=>{
      return (
        <PlaylistTableItem
          key={item.id}
          itemKey={item.id}
          metadata={item.metadata}
          duration={item.duration}
          handleDoubleClick={this.handleDoubleClick}
          handleClick={this.handleClick}
          isPlaying={item.id==this.state.currentItem.id}
          isSelected={this.props.selection.indexOf(item.id) > -1} />
      )
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
  handleClick: function(event, item){
    this.props.handleClick(event, item)
  },
  handleDoubleClick: function(item){
    this.props.handleDoubleClick(item.props.itemKey);
  },
  _onPlayerChange: function(){
    this.setState(getPlayerState())
  }  
})

module.exports = PlaylistTable