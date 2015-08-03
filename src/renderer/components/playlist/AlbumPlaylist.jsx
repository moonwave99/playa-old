"use babel"

var _ = require('lodash')
var uid = require('uid')
var React = require('react')
var ReactPropTypes = React.PropTypes
var AlbumPlaylistItem = require('./AlbumPlaylistItem.jsx')

var OpenPlaylistActions = require('../../actions/OpenPlaylistActions')
var PlayerActions = require('../../actions/PlayerActions')
var PlayerStore = require('../../stores/PlayerStore')

var DropArea = require('./DropArea.jsx')

function getPlayerState(){
  var playerState = PlayerStore.getPlaybackInfo()
  return {
    currentTrack: playerState.currentTrack
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
      return (
        <AlbumPlaylistItem
          key={album.id}
          index={index}
          itemKey={album.id}
          album={album}
          closeElements={this.props.closeElements}
          handleClick={this.handleClick}
          handleFolderDrop={this.handleFolderDrop}
          handleDragEnd={this.handleDragEnd}
          playTrack={this.playTrack}
          currentTrack={this.state.currentTrack || {}}
          moveAlbum={this.moveAlbum}
          direction={this.props.direction}
          selection={this.props.selection}
          isOpened={isOpened}/>
      )
    })

    return (
      <div onClick={this.handleGlobalClick}>
        <ol className="albums list-unstyled">{albums}</ol>
        <DropArea
          height={this.calculateDropAreaHeight()}
          moveAlbum={this.moveAlbum}
          handleFolderDrop={this.handleFolderDrop}
          handleDragEnd={this.handleDragEnd}/>
      </div>
    )
  },
  handleGlobalClick: function(event){
    this.setState({ openMenu: null })
  },
  handleClick: function(event, item){
    this.props.handleClick(event, item)
  },
  handleFolderDrop: function(folder, afterId){
    if(!afterId){
      OpenPlaylistActions.addFolder(folder)
    }else{
      OpenPlaylistActions.addFolderAtPosition(folder, afterId)
    }
  },
  handleDragEnd: function(){
    var node = React.findDOMNode(this)
    _.forEach(node.querySelectorAll('.drag-over'), (e)=> e.classList.remove('drag-over', 'drag-over-bottom', 'drag-over-top') )
    node.querySelector('.drop-area').classList.remove('over')
  },
  moveAlbum: function(id, afterId, position){
    if(!afterId){
      afterId = this.props.playlist.getLast().id
    }
    if(id != afterId){
      OpenPlaylistActions.reorder(this.props.playlist.id, id, afterId, position)
    }
  },
  playTrack: function(album, trackId){
    OpenPlaylistActions.selectAlbum(album, trackId, this.props.playlist, true)
  },
  calculateDropAreaHeight: function(){
    return 'calc(100vh - 9rem - ' + (4 * this.props.playlist.getLength() ) + 'rem)'
  },
  _onPlayerChange: function(){
    this.setState(getPlayerState())
  }
})

module.exports = AlbumPlaylist
