"use babel"

var _ = require('lodash')
var React = require('react')
var ReactPropTypes = React.PropTypes
var DragSource = require('react-dnd').DragSource
var DropTarget = require('react-dnd').DropTarget
var cx = require('classnames')
var key = require('keymaster')
var moment = require('moment')
require("moment-duration-format")

var ContextMenu = require('./ContextMenu.jsx')

const albumSource = {
  beginDrag(props) {
    return {
      id: props.itemKey,
      originalIndex: props.index
    }
  },
  endDrag(props, monitor) {
    const { id: droppedId, originalIndex } = monitor.getItem()
    const didDrop = monitor.didDrop()
    if (!didDrop) {
      props.moveAlbum(droppedId, originalIndex)
    }
  }
}

const albumTarget = {
  drop(props, monitor) {
    const draggedId = monitor.getItem().id
    if (draggedId !== props.id) {
      props.moveAlbum(draggedId, props.itemKey)
    }
  },
  hover(props, monitor, component) {
    _.forEach(document.querySelectorAll('.drag-over'), e => e.classList.remove('drag-over') )
    React.findDOMNode(component).classList.add('drag-over')
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
      this.focus()
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
      renderedTracklist.push(this.renderTrack(track, index))
    })
    return (
      <ul className="list-unstyled tracklist">{ renderedTracklist }</ul>
    )
  },
  renderTrackTitle: function(track){
    if(this.props.album.getArtistCount() > 1){
      return (
        <span className="track-title">
          <span className="track-artist">{track.metadata.artist}</span>
          <span className="separator"></span>
          <span>{track.metadata.title}</span>
        </span>
      )
    }else{
      return <span className="track-title">{track.metadata.title}</span>
    }
  },
  renderTrack: function(track, index){
    var isPlaying = track.id == this.props.currentItem.id
    var classes = cx({
      'track'     : true,
      'playing'   : isPlaying,
      'selected'  : this.state.selectedTrack == index
    })
    return (
      <li className={classes} key={track.id} onDoubleClick={this.handleTracklistDoubleClick} data-id={track.id}>
        <span className="track-playing-indicator">{ isPlaying ? <i className="fa fa-fw fa-volume-up"></i> : null }</span>
        <span className="track-number">{ track.metadata.track }.</span>
        { this.renderTrackTitle(track) }
        <span className="track-duration">{ this.formatTime(track.duration) }</span>
      </li>
    )
  },
  render: function() {
    var isPlaying = this.props.album.contains(this.props.currentItem.id)
    var classes = cx({
      'album' : true,
      'playing' : isPlaying,
      'selected' : this.props.isSelected,
      'open': this.props.isOpened
    })
    var opacity = this.props.isDragging ? 0 : 1
    var coverStyle = this.state.cover ? { backgroundImage: 'url(' + encodeURI(this.state.cover) + ')'} : {}
    var coverClasses = cx({
      'cover' : true,
      'loaded': !!this.state.cover,
      'menuOpened' : !!this.props.isMenuOpened
    })
    return this.props.connectDragSource(this.props.connectDropTarget(
      <div className={classes} onClick={this.handleClick} onDoubleClick={this.handleDoubleClick} data-id={this.props.album.id} style={{opacity}}>
        <header>
          <div className={coverClasses} style={coverStyle}></div>
          <span className="artist">{this.props.album.getArtist()}</span><br/>
          <span className="title">{this.props.album.getTitle()} { (isPlaying && !this.props.isOpened) ? <i className="fa fa-fw fa-volume-up"></i> : null }</span>
          <a href="#" className="menu-link" onClick={this.handleMenuLinkClick}><i className="fa fa-fw fa-ellipsis-h"></i></a>
          <span className="year">{this.props.album.getYear()}</span>
          { this.props.isMenuOpened ? <ContextMenu album={this.props.album}/> : null }
        </header>
        { this.props.isOpened ? this.renderTracklist() : null }
      </div>
    ))
  },
  handleMenuLinkClick: function(event){
    event.stopPropagation()
    this.props.handleMenuLinkClick(event, this)
  },
  handleTracklistDoubleClick: function(event){
    event.stopPropagation()
    this.props.playTrack(this.props.album, event.target.dataset.id)
  },
  handleDoubleClick: function(event){
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
  updateCover: function(cover){
    this.setState({ cover: cover })
  },
})

AlbumPlaylistItem = DropTarget('ALBUM', albumTarget, connect => ({
  connectDropTarget: connect.dropTarget(),
}))(AlbumPlaylistItem)

AlbumPlaylistItem = DragSource('ALBUM', albumSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
}))(AlbumPlaylistItem)

module.exports = AlbumPlaylistItem
