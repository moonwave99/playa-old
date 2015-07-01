"use babel"

var _ = require('lodash')
var React = require('react')
var ReactPropTypes = React.PropTypes
var PlaylistTable = require('./PlaylistTable.jsx')
var PlaylistAlbums = require('./PlaylistAlbums.jsx')

var OpenPlaylistActions = require('../../actions/OpenPlaylistActions')
var PlayerActions = require('../../actions/PlayerActions')
var NavGenerator = require('../../generators/Navigable.jsx')

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
    switch(this.props.playlist.displayMode){
      case 'albums':
        var PlaylistAlbumsOnSteroids = NavGenerator(
          PlaylistAlbums,
          'playlistAlbums',
          function(component){
            return component.props.albums.map( i => i.id )
          },
          function(component){
            var album = _.findWhere(component.props.albums, { id: component.state.selection[0] })
            return album ? album.tracks[0].id : null
          })
        return (
          <div className="playlist">
            <PlaylistAlbumsOnSteroids
              albums={this.props.playlist.groupByAlbum()}
              handleDoubleClick={this.handleDoubleClick}
              handleDelKeyPress={this.handleDelKeyPress}
              handleEnterKeyPress={this.handleEnterKeyPress}/>        
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
          })
        return (
          <div className="playlist">
            <PlaylistTableOnSteroids
              playlist={this.props.playlist}
              handleDoubleClick={this.handleDoubleClick}
              handleDelKeyPress={this.handleDelKeyPress}
              handleEnterKeyPress={this.handleEnterKeyPress}/>        
          </div>
        )
        break
    }
  },
  handleScroll: function(event){
    this.props.handleScroll(this, event)
  },
  handleDoubleClick: function(id){
    OpenPlaylistActions.playFile(id, this.props.playlist)
    PlayerActions.play()    
  },
  handleDelKeyPress: function(event, item){
    OpenPlaylistActions.removeFiles(item.state.selection, item.props.playlist)    
  },
  handleEnterKeyPress: function(event, item){
    if(item.state.selection.length == 1){
      OpenPlaylistActions.playFile(item.getSelectedElement(), this.props.playlist)
      PlayerActions.play()
    }          
  }  
})

module.exports = Playlist