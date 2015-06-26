"use babel"

var _ = require('lodash')
var key = require('keymaster')
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
      selectionStart: -1,
      selectionEnd: -1
    }
  },    
  componentDidMount: function() {
    key('del', this.handleDelKeyPress)
    key('enter', this.handleEnterKeyPress)    
    key('command+a', this.handleSelectAllKeyPress)
    key('up, down, shift+up, shift+down', this.handleArrowKeyPress)    
  },
  componentWillUnmount: function() {
    key.unbind('del')
    key.unbind('enter')
    key.unbind('command+a')
    key.unbind('up')
    key.unbind('down')    
    key.unbind('shift+up')
    key.unbind('shift+down')        
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
    this.setState({
      selectionStart: -1,
      selectionEnd: -1
    })
  },
  handleArrowKeyPress: function(event){
    var newStartIndex = this.state.selectionStart
    var newEndIndex = this.state.selectionEnd
    switch(event.which){
      case 38: // up
        if(event.shiftKey){
          newStartIndex = Math.max(0, this.state.selectionStart-1)
        }else{
          newStartIndex = Math.max(0, this.state.selectionStart-1)  
          newEndIndex = newStartIndex
        }
        break
      case 40: // down
        if(event.shiftKey){
          newEndIndex = Math.min(this.props.albums.length-1, this.state.selectionEnd+1)
        }else{
          newStartIndex = Math.min(this.props.albums.length-1, this.state.selectionStart+1)
          newEndIndex = newStartIndex
        }        
        break        
    }
    this.setState({
      selectionStart: newStartIndex,
      selectionEnd: newEndIndex
    })
  },
  handleEnterKeyPress: function(event){
    if((this.state.selectionEnd - this.state.selectionStart) == 0){
      OpenPlaylistActions.playFile(this.props.albums[this.state.selectionStart].tracks[0].id, this.props.playlist)
      PlayerActions.play()
    }
  },
  handleSelectAllKeyPress: function(event){
    this.setState({
      selectionStart: 0,
      selectionEnd: this.props.albums.length-1
    })
  }  
})

module.exports = PlaylistAlbums