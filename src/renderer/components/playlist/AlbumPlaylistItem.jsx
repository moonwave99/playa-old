"use babel"

var _ = require('lodash')
var shell = require('shell')
var React = require('react')
var ReactPropTypes = React.PropTypes
var DragSource = require('react-dnd').DragSource
var DropTarget = require('react-dnd').DropTarget
var cx = require('classnames')
var key = require('keymaster')
var moment = require('moment')
require("moment-duration-format")

var DragDropConstants = require('../../constants/DragDropConstants')
var AlbumTracklistItem = require('./AlbumTracklistItem.jsx')
var ContextMenu = require('./ContextMenu.jsx')

const albumSource = {
  beginDrag(props) {
    return {
      id: props.itemKey,
      originalIndex: props.index,
      source: DragDropConstants.PLAYLIST_ALBUM
    }
  },
  endDrag(props, monitor) {
    const { id: droppedId, originalIndex } = monitor.getItem()
    const didDrop = monitor.didDrop()
    if (!didDrop) {
      props.handleDragEnd()
    }
  }
}

const albumTarget = {
  drop(props, monitor) {
    var sourceItem = monitor.getItem()
    switch(sourceItem.source){
      case DragDropConstants.FILEBROWSER_FOLDER:
        props.handleFolderDrop(sourceItem.node.path, props.itemKey)
        break
      case DragDropConstants.PLAYLIST_ALBUM:
        const draggedId = monitor.getItem().id
        if (draggedId !== props.id) {
          props.moveAlbum(draggedId, props.itemKey, props.index < monitor.getItem().originalIndex ? 'before' : 'after')
        }
        break
    }
    props.handleDragEnd()
  },
  hover(props, monitor, component) {
    props.handleDragEnd()
    React.findDOMNode(component).classList.add('drag-over', props.index < monitor.getItem().originalIndex ? 'drag-over-top' : 'drag-over-bottom')
  }
}

var AlbumPlaylistItem = React.createClass({
  getInitialState: function(){
    return {
      cover: null,
      selectedTrack: -1
    }
  },
  formatTime: function(time){
    return moment.duration(time, "seconds").format("mm:ss", { trim: false })
  },
  componentWillReceiveProps: function(nextProps){
    if(nextProps.isKeyFocused){
      !this.props.isKeyFocused && this.focus()
    }else{
      this.blur()
    }
  },
  componentWillMount: function(){
    playa.coverLoader.load(this.props.album)
      .then(this.updateCover)
      .catch((err)=>{})
  },
  renderTracklist: function(){
    var isMultiple = this.props.album.isMultiple()
    var renderedTracklist = []
    this.props.album.tracks.forEach((track, index)=>{
      if(isMultiple && track.metadata.track == 1){
        renderedTracklist.push((
          <li key={track.id + '_disc_' + track.metadata.disk.no } className="disc-number">Disc {track.metadata.disk.no}</li>
        ))
      }
      renderedTracklist.push(
        <AlbumTracklistItem
          key={track.id}
          album={this.props.album}
          track={track}
          index={index}
          selected={this.state.selectedTrack == index}
          isPlaying={track.id == this.props.currentItem.id}
          handleDoubleClick={this.handleTracklistDoubleClick}/>
      )
    })
    return (
      <ol className="list-unstyled tracklist">{ renderedTracklist }</ol>
    )
  },
  renderContextMenu: function(){
    var actions = [
      {
        'label': 'Reveal in Finder',
        'handler': function(event){
          event.stopPropagation()
          shell.openExternal('file://' + this.props.album.getFolder())
        }.bind(this)
      },
      {
        'label': 'Search on Discogs',
        'handler': function(event){
          event.stopPropagation()
          this.openLink('http://www.discogs.com/search?type=release&q=')
        }.bind(this)
      },
      {
        'label': 'Search on RYM',
        'handler': function(event){
          event.stopPropagation()
          this.openLink('https://rateyourmusic.com/search?searchtype=l&searchterm=')
        }.bind(this)
      },
      {
        'label': 'Search on Last.fm',
        'handler': function(event){
          event.stopPropagation()
          this.openLink('http://www.last.fm/search?type=album&q=')
        }.bind(this)
      }
    ]
    return (
      <ContextMenu actions={actions}/>
    )
  },
  render: function() {
    var isPlaying = this.props.album.contains(this.props.currentItem.id)
    var classes = cx({
      'album'     : true,
      'playing'   : isPlaying,
      'selected'  : this.props.isSelected,
      'open'      : this.props.isOpened
    })
    var opacity = this.props.isDragging ? 0 : 1
    var coverStyle = this.state.cover ? { backgroundImage: 'url(' + encodeURI(this.state.cover) + ')'} : {}
    var coverClasses = cx({
      'cover'       : true,
      'loaded'      : !!this.state.cover,
      'menuOpened'  : !!this.props.isMenuOpened
    })
    return this.props.connectDragSource(this.props.connectDropTarget(
      <li className={classes} onClick={this.handleClick} onDoubleClick={this.handleDoubleClick} data-id={this.props.album.id} style={{opacity}}>
        <header>
          <div className={coverClasses} style={coverStyle}></div>
          <span className="artist">{this.props.album.getArtist()}</span><br/>
          <span className="title">{this.props.album.getTitle()} { (isPlaying && !this.props.isOpened) ? <i className="fa fa-fw fa-volume-up"></i> : null }</span>
          <a href="#" className="menu-link" onClick={this.handleMenuLinkClick}><i className="fa fa-fw fa-ellipsis-h"></i></a>
          <span className="year">{this.props.album.getYear()}</span>
          { this.props.isMenuOpened ? this.renderContextMenu() : null }
        </header>
        { this.props.isOpened ? this.renderTracklist() : null }
      </li>
    ))
  },
  handleMenuLinkClick: function(event){
    event.stopPropagation()
    this.props.handleMenuLinkClick(event, this)
  },
  handleTracklistDoubleClick: function(event, item){
    event.stopPropagation()
    this.props.playTrack(this.props.album, item.props.track.id)
  },
  handleDoubleClick: function(event){
    event.stopPropagation()
    this.props.playTrack(this.props.album, this.props.album.tracks[0].id)
  },
  handleClick: function(event){
    this.props.handleClick(event, this)
  },
  handleArrowKeyPress: function(event){
    switch(event.which){
      case 37: // left
        this.props.closeElements([this.props.album.id])
        this.props.focusParent()
        break
      case 38: // up
        this.setState({
          selectedTrack: this.state.selectedTrack-1
        })
        if(this.state.selectedTrack < -1){
          this.props.focusParent({
            id: this.props.album.id,
            direction: 'up'
          })
        }
        break
      case 40: // down
        this.setState({
          selectedTrack: this.state.selectedTrack+1
        })
        if(this.state.selectedTrack > this.props.album.tracks.length -1){
          this.props.focusParent({
            id: this.props.album.id,
            direction: 'down'
          })
        }
        break
    }
  },
  handleEnterKeyPress: function(event){
    if(this.state.selectedTrack > -1){
      this.props.playTrack(this.props.album, this.props.album.tracks[this.state.selectedTrack].id)
    }
  },
  focus: function(){
    var scope = 'album_tracklist_' + this.props.album.id
    if(scope !== key.getScope()){
      key('up, down, left', scope, this.handleArrowKeyPress)
      key('enter', scope, this.handleEnterKeyPress)
      key.setScope(scope)
    }
    this.setState({
      selectedTrack: this.props.direction == -1 ? this.props.album.tracks.length-1 : -1
    })
  },
  blur: function(){
    var scope = 'album_tracklist_' + this.props.album.id
    key.unbind('up', scope)
    key.unbind('down', scope)
    key.unbind('left', scope)
    key.unbind('enter', scope)
  },
  openLink: function(base){
    shell.openExternal(base + encodeURIComponent(this.props.album.getArtist() + ' ' + this.props.album.getTitle()))
  },
  updateCover: function(cover){
    this.setState({ cover: cover })
  }
})

AlbumPlaylistItem = DropTarget([
    DragDropConstants.PLAYLIST_ALBUM,
    DragDropConstants.FILEBROWSER_FOLDER
  ], albumTarget, connect => ({
  connectDropTarget: connect.dropTarget(),
}))(AlbumPlaylistItem)

AlbumPlaylistItem = DragSource(DragDropConstants.PLAYLIST_ALBUM, albumSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
}))(AlbumPlaylistItem)

module.exports = AlbumPlaylistItem
