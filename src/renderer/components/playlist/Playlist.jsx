"use babel"

var _ = require('lodash')
var cx = require('classnames')
var React = require('react')
var ReactPropTypes = React.PropTypes
var AlbumPlaylist = require('./AlbumPlaylist.jsx')

var OpenPlaylistActions = require('../../actions/OpenPlaylistActions')
var PlayerActions = require('../../actions/PlayerActions')
var PlayerStore = require('../../stores/PlayerStore')
var NavGenerator = require('../../generators/Navigable.jsx')

var KeyboardFocusActions = require('../../actions/KeyboardFocusActions')
var KeyboardFocusConstants = require('../../constants/KeyboardFocusConstants')
var KeyboardNameSpaceConstants = require('../../constants/KeyboardNameSpaceConstants')

var AlbumPlaylistOnSteroids = NavGenerator(AlbumPlaylist, KeyboardNameSpaceConstants.ALBUM_PLAYLIST,
  function(component){
    var ids = _.reduce(component.props.playlist.getItems(), (memo, album)=>{
      memo.push(album.id)
      if(_.contains(component.state.openElements, album.id)){
        memo = memo.concat(album.tracks.map( t => t.id ))
      }
      return memo;
    }, []);
    return ids
  },
  function(component){
    if(component.state.selection[0].startsWith('a_')){
      var album = component.props.playlist.getAlbumById(component.state.selection[0])
      return {
        album: album,
        trackId: album.tracks[0].id
      }
    }else{
      return {
        album: component.props.playlist.getAlbumByTrackId(component.state.selection[0]),
        trackId: component.state.selection[0]
      }
    }
  },
  null,
  function(component, buffer){
    let result = component.props.playlist.find(buffer) || {}
    return result.id
  }
)

function getPlayerState(){
  var playerState = PlayerStore.getPlaybackInfo()
  return {
    currentTrack: playerState.currentTrack || {}
  }
}

var Playlist = React.createClass({
  getInitialState: function(){
    return {
      currentTrack: {}
    }
  },
  componentDidMount: function(){
    PlayerStore.addChangeListener(this._onPlayerChange)
    if(!this.props.playlist.loaded){
      OpenPlaylistActions.load(this.props.playlist.id)
    }
  },
  componentWillUnmount: function(){
    PlayerStore.removeChangeListener(this._onPlayerChange)
  },
  render: function() {
    var classes = cx({
      'playlist'      : true,
      'sidebar-open'  : !!this.props.isSidebarOpen
    })
    return (
      <div className={classes} onClick={this.handleGlobalClick}>
        <AlbumPlaylistOnSteroids
          allowMultipleSelection={true}
          currentTrack={this.state.currentTrack}
          playlist={this.props.playlist}
          baseFontSize={this.props.baseFontSize}
          initSelection={[this.props.playlist.lastScrolledAlbumId]}
          initOpenElements={this.props.playlist.openAlbums}
          handleDelKeyPress={this.handleDelKeyPress}
          handleEnterKeyPress={this.handleEnterKeyPress}
          handleScrollToElement={this.handleScrollToElement}/>
      </div>
    )
  },
  handleGlobalClick: function(event){
    KeyboardFocusActions.requestFocus(KeyboardNameSpaceConstants.ALBUM_PLAYLIST)
  },
  handleDelKeyPress: function(event, item, tracksToRemove){
    OpenPlaylistActions.removeFiles(tracksToRemove, item.props.playlist)
  },
  handleEnterKeyPress: function(event, item){
    if(item.state.selection.length == 1){
      var whatToPlay = item.getSelectedElement()
      OpenPlaylistActions.selectAlbum(whatToPlay.album, whatToPlay.trackId, this.props.playlist, true)
    }
  },
  handleScrollToElement: function(state, list, component){
    state.selection[0] && component.scrollAround(state.selection[0])
  },
  _onPlayerChange: function(){
    var playerState = getPlayerState()
    if(playerState.currentTrack.id != this.state.currentTrack.id){
      this.setState(playerState)
    }
  }
})

module.exports = Playlist
