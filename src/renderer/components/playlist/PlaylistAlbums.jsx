"use babel"

var _ = require('lodash')
var uid = require('uid')
var key = require('keymaster')
var React = require('react')
var ReactPropTypes = React.PropTypes
var PlaylistAlbumItem = require('./PlaylistAlbumItem.jsx')

var OpenPlaylistActions = require('../../actions/OpenPlaylistActions')
var PlayerActions = require('../../actions/PlayerActions')
var PlayerStore = require('../../stores/PlayerStore')

var DragDropContext = require('react-dnd').DragDropContext
var HTML5Backend = require('react-dnd/modules/backends/HTML5')

function getPlayerState(){
  var playerState = PlayerStore.getPlaybackInfo()
  return {
    currentItem: playerState.item
  }  
}

var PlaylistAlbums = React.createClass({
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
    var albums = this.props.playlist.getItems().map((album, index)=>{
      return (
        <PlaylistAlbumItem
          key={album.id}
          index={index}
          itemKey={album.id}
          album={album}
          handleClick={this.handleClick}
          handleDoubleClick={this.handleDoubleClick}
          currentItem={this.state.currentItem}
          moveAlbum={this.moveAlbum}
          isOpened={this.props.openElements.indexOf(album.id) > -1}
          isSelected={this.props.selection.indexOf(album.id) > -1} />
      )
    })
    
    return (
      <div className="albums">{albums}</div>
    )
  },
  handleClick: function(event, item){
    this.props.handleClick(event, item)
  },  
  handleDoubleClick: function(album, trackId){
    this.props.handleDoubleClick(album, trackId)
  },
  _onPlayerChange: function(){
    this.setState(getPlayerState())
  },
  moveAlbum: function(id, afterId){
    OpenPlaylistActions.reorder(this.props.playlist.id, id, afterId)
  }  
})

module.exports = DragDropContext(HTML5Backend)(PlaylistAlbums)