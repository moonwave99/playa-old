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
  componentDidMount: function(){
    var node = React.findDOMNode(this)
    node.addEventListener('scroll', _.throttle(this.handleScroll, 100))
    node.scrollTop = this.props.playlist.scrollBy
  },
  componentWillUnmount: function(){
    React.findDOMNode(this).removeEventListener('scroll')
  },
  render: function() {
    switch(this.props.playlist.getDisplayMode()){
      case 'albums':
        var PlaylistAlbumsOnSteroids = NavGenerator(
          PlaylistAlbums,
          'playlistAlbums',
          function(component){
            return component.props.playlist.getIds()
          },
          function(component){
            var album = component.props.playlist.getAlbumById(component.state.selection[0])
            return album ? album.tracks[0].id : null
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
        break
      default:
        var PlaylistTableOnSteroids = NavGenerator(
          PlaylistTable,
          'playlistTable',
          function(component){
            return component.props.playlist.items.map( i => i.id )
          },
          function(component){
            var track = _.findWhere(component.props.playlist.items, { id: component.state.selection[0] })
            return track ? track.id : null
          },
          function(component){
            return component.state.selection
          })          
        return (
          <div className="playlist">
            <PlaylistTableOnSteroids
              playlist={this.props.playlist}
              handleDoubleClick={this.handleDoubleClick}
              handleDelKeyPress={this.handleDelKeyPress}
              handleEnterKeyPress={this.handleEnterKeyPress}
              handleScrollToElement={this.handleScrollToElement}/>        
          </div>
        )
        break
    }
  },
  handleScroll: function(event){
    // console.log(event)
    // this.props.handleScroll(this, event)
  },
  handleAlbumDoubleClick: function(album, id){
    OpenPlaylistActions.playAlbum(album, id, this.props.playlist)
    PlayerActions.play()        
  },
  handleDoubleClick: function(id){
    OpenPlaylistActions.playFile(id, this.props.playlist)
    PlayerActions.play()    
  },
  handleDelKeyPress: function(event, item, tracksToRemove){
    OpenPlaylistActions.removeFiles(tracksToRemove, item.props.playlist)
  },
  handleEnterKeyPress: function(event, item){
    if(item.state.selection.length == 1){
      OpenPlaylistActions.playFile(item.getSelectedElement(), this.props.playlist)
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