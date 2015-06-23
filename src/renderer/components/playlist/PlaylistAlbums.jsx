"use babel"

var _ = require('lodash')
var React = require('react')
var ReactPropTypes = React.PropTypes
var PlaylistAlbumItem = require('./PlaylistAlbumItem.jsx')

var PlaylistActions = require('../../actions/PlaylistActions')
var PlayerActions = require('../../actions/PlayerActions')

var PlaylistAlbums = React.createClass({
  propTypes: {
    playlist: ReactPropTypes.object,
    currentItem: ReactPropTypes.object,
    handleClick: ReactPropTypes.func,
    handleDoubleClick: ReactPropTypes.func
  },
  render: function() {
    var albums = _(this.props.playlist.items).groupBy((item)=>{
      return item.metadata.album
    }).map((album, title)=>{
      var isPlaying = !!(album.filter((i)=>{ return i.id == this.props.currentItem.id }).length)
      return <PlaylistAlbumItem key={title} album={album} metadata={album[0].metadata} onDoubleClick={this.handleDoubleClick} isPlaying={isPlaying}/>
    }).value()
    
    return (
      <div className="albums">{albums}</div>
    )
  },
  handleClick: function(item){
    this.props.onClick(item)
  },
  handleDoubleClick: function(item){
    PlaylistActions.playFile(item.props.album[0].id, this.props.playlist)
    PlayerActions.play()
  }
})

module.exports = PlaylistAlbums