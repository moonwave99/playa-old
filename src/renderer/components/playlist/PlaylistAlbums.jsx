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
      selection: [],
      openAlbums: []
    }
  },    
  componentDidMount: function() {
    key('del', this.handleDelKeyPress)
    key('enter', this.handleEnterKeyPress)    
    key('command+a', this.handleSelectAllKeyPress)
    key('up, down, shift+up, shift+down, alt+up, alt+down, shift+alt+up, shift+alt+down', this.handleArrowKeyPress)
    key('left, right', this.handleLeftRightKeyPress)
  },
  componentWillUnmount: function() {
    key.unbind('del')
    key.unbind('enter')
    key.unbind('command+a')
    key.unbind('up')
    key.unbind('down')
    key.unbind('shift+up')
    key.unbind('shift+down')
    key.unbind('alt+up')
    key.unbind('alt+down')
    key.unbind('shift+alt+up')
    key.unbind('shift+alt+down')     
    key.unbind('left')
    key.unbind('right')
  },
  render: function() {
    var albums = this.props.albums.map((album, index)=>{
      var isPlaying = !!(album.tracks.filter((i)=>{ return i.id == this.props.currentItem.id }).length)
      var output = (
        <PlaylistAlbumItem
          key={album.title}
          itemKey={album.id}
          album={album}
          metadata={album.tracks[0].metadata}
          onClick={this.handleClick}
          onDoubleClick={this.handleDoubleClick}
          isPlaying={isPlaying}
          isOpened={this.state.openAlbums.indexOf(album.id) > -1}
          isSelected={this.state.selection.indexOf(album.id) > -1} />
      )
      return output
    })
    
    return (
      <div className="albums">{albums}</div>
    )
  },
  handleClick: function(event, item){
    var albumIDs = this.props.albums.map( i => i.id )
    var index = albumIDs.indexOf(item.props.itemKey)
    
    var [low, hi] = [
      albumIDs.indexOf(this.state.selection[0]),
      albumIDs.indexOf(this.state.selection[this.state.selection.length-1])
    ]
    if(event.metaKey){
      this.setState({
        selection: item.props.isSelected ? _.without(this.state.selection, item.props.itemKey) : this.state.selection.concat([item.props.itemKey])
      })
    }else if(event.shiftKey){
      this.setState({
        selection: albumIDs.slice(
          Math.min(low, index), Math.max(hi, index)+1
        )
      })
    }else{
      this.setState({
        selection: [item.props.itemKey]
      })
    }
  },
  handleDoubleClick: function(item){
    OpenPlaylistActions.playFile(item.props.album.tracks[0].id, this.props.playlist)
    PlayerActions.play()
  },
  handleDelKeyPress: function(event){
    var ids = _.reduce(this.state.selection, (memo, id)=>{
      memo = memo.concat(_.findWhere(this.props.albums, { id: id }).tracks.map( i => i.id ))
      return memo
    }, [])
    OpenPlaylistActions.removeFiles(ids, this.props.playlist)
    this.setState({
      selection: []
    })
  },
  handleArrowKeyPress: function(event){
    var items = this.props.albums.map( i => i.id )
    var [low, hi] = [
      items.indexOf(this.state.selection[0]),
      items.indexOf(this.state.selection[this.state.selection.length-1])
    ]
    var newLow = low
    var newHi = hi
    
    switch(event.which){
      case 38: // up
        if(event.shiftKey && event.altKey){
          newLow = 0
        }else if(event.shiftKey){
          newLow = Math.max(0, low-1)
        }else if(event.altKey){
          newLow = newHi = 0
        }else{
          newLow = Math.max(0, low-1)  
          newHi = newLow
        }
        break
      case 40: // down
        if(event.shiftKey && event.altKey){
          newHi = items.length-1
        }else if(event.shiftKey){
          newHi = Math.min(items.length-1, hi+1)
        }else if(event.altKey){
          newLow = newHi = items.length-1
        }else{
          newLow = Math.min(items.length-1, low+1)
          newHi = newLow
        }        
        break        
    }
    this.setState({
      selection: items.slice(newLow, newHi+1)
    })    
  },
  handleEnterKeyPress: function(event){
    if(this.state.selection.length == 1){
      var albumToPlay = _.findWhere(this.props.albums, { id: this.state.selection[0] })
      OpenPlaylistActions.playFile(albumToPlay.tracks[0].id, this.props.playlist)
      PlayerActions.play()
    }
  },
  handleSelectAllKeyPress: function(event){
    this.setState({
      selection: this.props.albums.map( i => i.id )
    })
  },
  handleLeftRightKeyPress: function(event){
    console.log(_.uniq(this.state.openAlbums.concat(this.state.selection)))
    switch(event.which){
      case 39: // right
        this.setState({
          openAlbums: _.uniq(this.state.openAlbums.concat(this.state.selection))
        })
        break
      case 37: // left
        this.setState({
          openAlbums: _.difference(this.state.openAlbums, this.state.selection)
        })
        break        
    }
  }
})

module.exports = PlaylistAlbums