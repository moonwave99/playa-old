"use babel"

var _ = require('lodash')
var React = require('react')
var ReactPropTypes = React.PropTypes
var AlbumPlaylist = require('./AlbumPlaylist.jsx')

var OpenPlaylistActions = require('../../actions/OpenPlaylistActions')
var PlayerActions = require('../../actions/PlayerActions')
var NavGenerator = require('../../generators/Navigable.jsx')

var AlbumPlaylistOnSteroids = NavGenerator(AlbumPlaylist, 'albumPlaylist',
  function(component){
    return component.props.playlist.getIds()
  },
  function(component){
    return component.props.playlist.getAlbumById(component.state.selection[0])
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
    return (
      <div className="playlist">
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
  handleDelKeyPress: function(event, item, tracksToRemove){
    OpenPlaylistActions.removeFiles(tracksToRemove, item.props.playlist)
  },
  handleEnterKeyPress: function(event, item){
    if(item.state.selection.length == 1){
      var album = item.getSelectedElement()
      OpenPlaylistActions.playAlbum(album, album.tracks[0].id, this.props.playlist)
      PlayerActions.play()
    }
  },
  handleScrollToElement: function(state, list){
    var wrapper = React.findDOMNode(this)
    var targetElement = wrapper.querySelector('[data-id="' + state.selection[0] + '"]')
    if(!targetElement){
      return
    }

    // save position of last selected album
    this.props.playlist.lastScrolledAlbum = state.selection[0]

    var {direction, parentBounds, elBounds} = _overflows(wrapper, targetElement)
    if(direction < 0){
      wrapper.scrollTop = targetElement.offsetTop
    }else if(direction > 0){
      var maxEls = Math.floor(parentBounds.height / elBounds.height)
      wrapper.scrollTop = (list.indexOf(state.selection[0]) - maxEls +1) * elBounds.height
    }
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
