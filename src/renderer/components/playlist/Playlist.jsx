"use babel"

var _ = require('lodash')
var React = require('react')
var ReactPropTypes = React.PropTypes
var PlaylistTable = require('./PlaylistTable.jsx')
var PlaylistAlbums = require('./PlaylistAlbums.jsx')

var OpenPlaylistActions = require('../../actions/OpenPlaylistActions')
var PlayerActions = require('../../actions/PlayerActions')
var NavGenerator = require('../../generators/Navigable.jsx')

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
  propTypes: {
    playlist: ReactPropTypes.object,
    handleScroll: ReactPropTypes.func    
  },
  render: function() {
    var PlaylistAlbumsOnSteroids = NavGenerator(
      PlaylistAlbums,
      'playlistAlbums',
      function(component){
        return component.props.playlist.getIds()
      },
      function(component){
        return component.props.playlist.getAlbumById(component.state.selection[0])
      },
      function(component){
        return component.state.selection
      })
    return (
      <div className="playlist">
        <PlaylistAlbumsOnSteroids
          playlist={this.props.playlist}
          handleDoubleClick={this.handleAlbumDoubleClick}
          handleDelKeyPress={this.handleDelKeyPress}
          handleEnterKeyPress={this.handleEnterKeyPress}
          handleScrollToElement={this.handleScrollToElement}/>        
      </div>
    )
  },
  handleAlbumDoubleClick: function(album, trackId){
    OpenPlaylistActions.playAlbum(album, trackId, this.props.playlist)
    PlayerActions.play()        
  },
  handleDoubleClick: function(trackId){
    OpenPlaylistActions.playFile(trackId, this.props.playlist)
    PlayerActions.play()    
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
    var targetElement = document.querySelector('[data-id="' + state.selection[0] + '"]')
    if(!targetElement)
      return
    var node = React.findDOMNode(this)
    var {direction, parentBounds, elBounds} = _overflows(node, targetElement)
    if(direction < 0){
      node.scrollTop = targetElement.offsetTop
    }else if(direction > 0){
      var maxEls = Math.floor(parentBounds.height / elBounds.height)
      node.scrollTop = (list.indexOf(state.selection[0]) - maxEls +1) * elBounds.height
    }
  }  
})

module.exports = Playlist