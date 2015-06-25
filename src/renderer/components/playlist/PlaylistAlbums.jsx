"use babel"

var _ = require('lodash')
var keymaster = require('keymaster')
var React = require('react')
var ReactPropTypes = React.PropTypes
var PlaylistAlbumItem = require('./PlaylistAlbumItem.jsx')

var OpenPlaylistActions = require('../../actions/OpenPlaylistActions')
var PlayerActions = require('../../actions/PlayerActions')

var PlaylistAlbums = React.createClass({
  propTypes: {
    playlist: ReactPropTypes.object,
    currentItem: ReactPropTypes.object,
    handleDoubleClick: ReactPropTypes.func
  },
  getInitialState: function(){
    return {
      selectionStart: 0,
      selectionEnd: 0
    }
  },    
  componentDidMount: function() {
    keymaster('del', this.handleDelKeyPress)
  },
  componentWillUnmount: function() {
    keymaster.unbind('del')
  },
  render: function() {
    var albums = this.props.albums.map((album, index)=>{
      var isPlaying = !!(album.tracks.filter((i)=>{ return i.id == this.props.currentItem.id }).length)
      var output = (
        <PlaylistAlbumItem
          key={album.title}
          itemKey={album.title}
          album={album}
          metadata={album.tracks[0].metadata}
          onClick={this.handleClick}
          onDoubleClick={this.handleDoubleClick}
          isPlaying={isPlaying}
          isSelected={index >= this.state.selectionStart && index <= this.state.selectionEnd} />
      )
      return output
    })
    
    return (
      <div className="albums">{albums}</div>
    )
  },
  handleClick: function(event, item){
    index = _.findIndex(this.props.albums, (album)=>{
      return album.title == item.props.itemKey
    })
    if(event.shiftKey){
      this.setState({
        selectionStart: Math.min(this.state.selectionStart, index),
        selectionEnd: Math.max(this.state.selectionStart, index)
      })      
    }else{
      this.setState({
        selectionStart: index,
        selectionEnd: index
      })      
    }
  },
  handleDoubleClick: function(item){
    OpenPlaylistActions.playFile(item.props.album.tracks[0].id, this.props.playlist)
    PlayerActions.play()
  },
  handleDelKeyPress: function(event){
    var from = _.findIndex(this.props.playlist.items, (item)=>{
      return item.id == this.props.albums[this.state.selectionStart].tracks[0].id
    })
    var to = _.findIndex(this.props.playlist.items, (item)=>{
      return item.id == this.props.albums[this.state.selectionEnd].tracks[this.props.albums[this.state.selectionEnd].tracks.length-1].id
    })    
    OpenPlaylistActions.removeFiles(from, to, this.props.playlist)
  }  
})

module.exports = PlaylistAlbums