"use babel"

var _ = require('lodash')
var cx = require('classnames')
var React = require('react')
var ReactPropTypes = React.PropTypes
var AlbumPlaylist = require('./AlbumPlaylist.jsx')

var OpenPlaylistActions = require('../../actions/OpenPlaylistActions')
var PlayerActions = require('../../actions/PlayerActions')
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
  }
)

var _overflows = function(parent, element){
  var parentBounds = parent.getBoundingClientRect()
  var elBounds = element.getBoundingClientRect()
  var direction = 0
  if((elBounds.top + elBounds.height) > (parentBounds.top + parentBounds.height)){
    direction = 1
  }else if(elBounds.top < parentBounds.top){
    direction = -1
  }
  return {
    direction: direction,
    parentBounds: parentBounds,
    elBounds: elBounds
  }
}

var Playlist = React.createClass({
  componentDidMount: function(){
    this.scrollToAlbum(this.props.playlist.lastScrolledAlbum)
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
          playlist={this.props.playlist}
          initSelection={[this.props.playlist.lastScrolledAlbum]}
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
  handleScrollToElement: function(state, list){

  },
  scrollToAlbum: function(albumId){
    var wrapper = React.findDOMNode(this)
    var targetElement = wrapper.querySelector('[data-id="' + albumId + '"]')
    if(!targetElement){
      return
    }
    wrapper.scrollTop = targetElement.offsetTop
  }
})

module.exports = Playlist
