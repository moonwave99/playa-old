"use babel"

var _ = require('lodash')
var uid = require('uid')
var React = require('react')
var ReactPropTypes = React.PropTypes
var AlbumPlaylistItem = require('./AlbumPlaylistItem.jsx')

var OpenPlaylistActions = require('../../actions/OpenPlaylistActions')
var PlayerActions = require('../../actions/PlayerActions')
var PlayerStore = require('../../stores/PlayerStore')

function getPlayerState(){
  var playerState = PlayerStore.getPlaybackInfo()
  return {
    currentItem: playerState.item
  }
}

var AlbumPlaylist = React.createClass({
  propTypes: {
    playlist: ReactPropTypes.object,
    focusParent: ReactPropTypes.func,
    closeElements: ReactPropTypes.func,
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
    var albums = this.props.playlist.getItems().map( (album, index)=> {
      var isOpened = this.props.openElements.indexOf(album.id) > -1
      var isSelected = this.props.selection.indexOf(album.id) > -1

      return (
        <AlbumPlaylistItem
          key={album.id}
          index={index}
          itemKey={album.id}
          album={album}
          closeElements={this.props.closeElements}
          focusParent={this.props.focusParent}
          handleClick={this.handleClick}
          handleMenuLinkClick={this.handleMenuLinkClick}
          handleFolderDrop={this.handleFolderDrop}
          playTrack={this.playTrack}
          currentItem={this.state.currentItem}
          moveAlbum={this.moveAlbum}
          direction={this.props.direction}
          isOpened={isOpened}
          isSelected={isSelected}
          isKeyFocused={isOpened && isSelected && (this.props.selection.length == 1)}
          isMenuOpened={this.state.openMenu == album.id}/>
      )
    })

    return (
      <ol className="albums list-unstyled" onClick={this.handleGlobalClick}>{albums}</ol>
    )
  },
  handleGlobalClick: function(event){
    this.setState({ openMenu: null })
  },
  handleClick: function(event, item){
    this.props.handleClick(event, item)
  },
  handleMenuLinkClick: function(event, item){
    this.setState({
      openMenu: item.props.itemKey
    })
  },
  handleFolderDrop: function(folder, afterId){
    OpenPlaylistActions.addFolderAtPosition(folder, afterId)
  },
  moveAlbum: function(id, afterId, position){
    if(id != afterId){
      OpenPlaylistActions.reorder(this.props.playlist.id, id, afterId, position)
    }
  },
  playTrack: function(album, trackId){
    OpenPlaylistActions.playAlbum(album, trackId, this.props.playlist)
    PlayerActions.play()
  },
  _onPlayerChange: function(){
    this.setState(getPlayerState())
  },
})

module.exports = AlbumPlaylist
