"use babel"

var _ = require('lodash')
var ipc = require('electron').ipcRenderer
var shell = require('shell')
var React = require('react')
var ReactDOM = require('react-dom')
var ReactPropTypes = React.PropTypes
var DragSource = require('react-dnd').DragSource
var DropTarget = require('react-dnd').DropTarget
var cx = require('classnames')
var key = require('keymaster')

var DragDropConstants = require('../../constants/DragDropConstants')
var KeyboardFocusActions = require('../../actions/KeyboardFocusActions')
var ContextMenuActions = require('../../actions/ContextMenuActions')
var KeyboardNameSpaceConstants = require('../../constants/KeyboardNameSpaceConstants')
var OpenPlaylistActions = require('../../actions/OpenPlaylistActions')

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
    ReactDOM.findDOMNode(component).classList.add('drag-over', props.index < monitor.getItem().originalIndex ? 'drag-over-top' : 'drag-over-bottom')
  }
}

var AlbumPlaylistItem = React.createClass({
  getInitialState: function(){
    return {
      cover: null
    }
  },
  componentWillMount: function(){
    if(this.props.album.disabled){
      return
    }
    playa.coverLoader.load(this.props.album)
      .then(this.updateCover)
      .catch((err)=>{})
  },
  render: function() {
    var isPlaying = this.props.album.contains(this.props.currentTrack.id)
    var classes = cx({
      'album'     : true,
      'playing'   : isPlaying,
      'selected'  : this.props.isSelected,
      'open'      : this.props.isOpened,
      'disabled'  : this.props.album.disabled
    })
    var opacity = this.props.isDragging ? 0.4 : 1
    var coverStyle = this.state.cover ? { backgroundImage: 'url(' + encodeURI(this.state.cover) + ')'} : {}
    var coverClasses = cx({
      'cover'       : true,
      'loaded'      : !!this.state.cover,
      'menuOpened'  : !!this.props.isMenuOpened
    })

    var output = null

    if(this.props.album.disabled){
      output = (
        <li className={classes} onClick={this.handleClick} onDoubleClick={this.handleDoubleClick} onContextMenu={this.handleMenuLinkClick} style={{opacity}} data-id={this.props.album.id}>
          <div className={coverClasses} style={coverStyle}></div>
          <span className="folder">{this.props.album.getFolder()}</span>
          <a href="#" className="menu-link sidebar-offset" onClick={this.handleMenuLinkClick}><i className="fa fa-fw fa-ellipsis-h"></i></a>
          <a href="#" className="album-status album-error sidebar-offset"><i className="fa fa-fw fa-exclamation-circle"></i></a>
        </li>
      )
    }else{
      var status = this.props.album.missingTracksCount() > 0 ? <a href="#" className="album-status album-warning sidebar-offset"><i className="fa fa-fw fa-exclamation-triangle"></i></a> : null
      output = (
        <li className={classes} onClick={this.handleClick} onDoubleClick={this.handleDoubleClick} onContextMenu={this.handleMenuLinkClick} style={{opacity}} data-id={this.props.album.id}>
          <div className={coverClasses} style={coverStyle}></div>
          <span className="artist">{this.props.album.getArtist()}</span><br/>
          <span className="title">{this.props.album.getTitle()} { (isPlaying && !this.props.isOpened) ? <i className="fa fa-fw fa-volume-up"></i> : null }</span>
          {status}
          <a href="#" className="menu-link sidebar-offset" onClick={this.handleMenuLinkClick}><i className="fa fa-fw fa-ellipsis-h"></i></a>
          <span className="year sidebar-offset">{this.props.album.getYear()}</span>
        </li>
      )
    }

    return this.props.connectDragSource(this.props.connectDropTarget(output))
  },
  handleMenuLinkClick: function(event){
    event.stopPropagation()
    ContextMenuActions.show(
      this.props.album.disabled ? this.getDisabledContextMenuActions() : this.getContextMenuActions(),
      { top: event.clientY, left: event.clientX - 10 * this.props.baseFontSize },
      event,
      KeyboardNameSpaceConstants.ALBUM_PLAYLIST
    )
  },
  handleDoubleClick: function(event){
    event.stopPropagation()
    !this.props.album.disabled && this.props.playTrack(this.props.album, this.props.album.tracks[0].id)
  },
  handleClick: function(event){
    this.props.handleClick(event, this)
  },
  updateCover: function(cover){
    if(this.isMounted()){
      this.setState({ cover: cover })
    }
  },
  getDisabledContextMenuActions: function(){
    return [
      {
        'label': 'Locate Folder',
        'handler': function(){
          var folder = this.props.album.getFolder()
          var remoteFolder = ipc.sendSync('request:open:dialog', {
            title: 'Locate folder for ' + folder,
            properties: ['openDirectory']
          })
          remoteFolder[0] && OpenPlaylistActions.locateFolder(this.props.playlist.id, this.props.album.id, remoteFolder[0])
        }.bind(this)
      },
    ]
  },
  getContextMenuActions: function(){
    return [
      {
        'label': 'Reveal in Finder',
        'handler': function(){
          shell.openExternal('file://' + this.props.album.getFolder())
        }.bind(this)
      },
      {
        'label': 'Search on Discogs',
        'handler': function(){
          this.openLink('http://www.discogs.com/search?type=release&q=')
        }.bind(this)
      },
      {
        'label': 'Search on RYM',
        'handler': function(){
          this.openLink('https://rateyourmusic.com/search?searchtype=l&searchterm=')
        }.bind(this)
      },
      {
        'label': 'Search on Last.fm',
        'handler': function(){
          this.openLink('http://www.last.fm/search?type=album&q=')
        }.bind(this)
      }
    ]
  },
  openLink: function(base){
    shell.openExternal(base + encodeURIComponent(this.props.album.getArtist() + ' ' + this.props.album.getTitle()))
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
