"use babel"

var _ = require('lodash')
var uid = require('uid')
var React = require('react')
var ReactPropTypes = React.PropTypes
var AlbumPlaylistItem = require('./AlbumPlaylistItem.jsx')

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

var AlbumPlaylist = React.createClass({
  propTypes: {
    playlist: ReactPropTypes.object,
    handleClick: ReactPropTypes.func,
    handleDoubleClick: ReactPropTypes.func,
    selection: ReactPropTypes.array
  },
  getInitialState: function(){
    return _.extend({
      openMenu: null
    }, getPlayerState())
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
        <AlbumPlaylistItem
          key={album.id}
          index={index}
          itemKey={album.id}
          album={album}
          handleClick={this.handleClick}
          handleDoubleClick={this.handleDoubleClick}
          handleMenuLinkClick={this.handleMenuLinkClick}
          currentItem={this.state.currentItem}
          moveAlbum={this.moveAlbum}
          isOpened={this.props.openElements.indexOf(album.id) > -1}
          isSelected={this.props.selection.indexOf(album.id) > -1}
          isMenuOpened={this.state.openMenu == album.id}/>
      )
    })

    return (
      <div className="albums" onClick={this.handleGlobalClick}>{albums}</div>
    )
  },
  handleGlobalClick: function(event){
    this.setState({ openMenu: null })
  },
  handleClick: function(event, item){
    this.props.handleClick(event, item)
  },
  handleDoubleClick: function(album, trackId){
    OpenPlaylistActions.playAlbum(album, trackId, this.props.playlist)
    PlayerActions.play()
  },
  handleMenuLinkClick: function(event, item){
    this.setState({
      openMenu: item.props.itemKey
    })
  },
  _onPlayerChange: function(){
    this.setState(getPlayerState())
  },
  moveAlbum: function(id, afterId){
    OpenPlaylistActions.reorder(this.props.playlist.id, id, afterId)
  }
})

module.exports = DragDropContext(HTML5Backend)(AlbumPlaylist)
