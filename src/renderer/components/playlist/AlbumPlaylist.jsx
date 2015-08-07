"use babel"

var _ = require('lodash')
var cx = require('classnames')
var uid = require('uid')
var React = require('react')
var ReactPropTypes = React.PropTypes
var ReactList = require('react-list')

var AlbumPlaylistItem = require('./AlbumPlaylistItem.jsx')
var AlbumTracklistItem = require('./AlbumTracklistItem.jsx')
var OpenPlaylistActions = require('../../actions/OpenPlaylistActions')
var PlayerActions = require('../../actions/PlayerActions')

var DropArea = require('./DropArea.jsx')

var AlbumPlaylist = React.createClass({
  propTypes: {
    playlist: ReactPropTypes.object,
    focusParent: ReactPropTypes.func,
    closeElements: ReactPropTypes.func,
    handleClick: ReactPropTypes.func,
    handleDoubleClick: ReactPropTypes.func,
    selection: ReactPropTypes.array
  },
  getInitialState: function(){
    return {
      list: this.getFlattenedList(this.props, this.props.currentTrack)
    }
  },
  componentDidMount: function(){
    this.refs.list.getScrollParent().addEventListener('scroll', this._onListScrollHandler)
    this.props.playlist.lastScrolledAlbumId && this.scrollTo(this.props.playlist.lastScrolledAlbumId)
  },
  componentWillUnmount: function(){
    this.refs.list.getScrollParent().removeEventListener('scroll', this._onListScrollHandler)
    this.props.playlist.openAlbums = this.props.openElements
  },
  componentWillReceiveProps: function(nextProps){
    this.setState({
      list: this.getFlattenedList(nextProps, this.props.currentTrack)
    })
  },
  getFlattenedList: function(props, currentTrack){
    var list = []
    props.playlist.getItems().forEach((album, index)=>{
      var isOpened = props.openElements.indexOf(album.id) > -1
      list.push({
        id: album.id,
        type: 'album',
        album: album,
        isOpened: isOpened,
        isSelected: props.selection.indexOf(album.id) > -1,
        index: index
      })
      if(isOpened){
        var isMultiple = album.isMultiple()
        album.tracks.forEach((track, trackIndex)=>{
          if(isMultiple && track.metadata.track == 1){
            list.push({
              type: 'discNumber',
              disc: track.metadata.disk.no,
              key: track.id + '_disc_' + track.metadata.disk.no
            })
          }
          list.push({
            id: track.id,
            type: 'track',
            track: track,
            album: album,
            index: trackIndex,
            isSelected: props.selection.indexOf(track.id) > -1,
            isPlaying: currentTrack && (track.id == currentTrack.id)
          })
        })
      }
    })
    return list
  },
  itemRenderer: function(index, key){
    var item = this.state.list[index]
    switch(item.type){
      case 'album':
        var album = item.album
        return (
          <AlbumPlaylistItem
            key={album.id}
            index={item.index}
            itemKey={album.id}
            album={album}
            closeElements={this.props.closeElements}
            handleClick={this.handleClick}
            handleFolderDrop={this.handleFolderDrop}
            handleDragEnd={this.handleDragEnd}
            playTrack={this.playTrack}
            currentTrack={this.props.currentTrack || {}}
            moveAlbum={this.moveAlbum}
            direction={this.props.direction}
            isSelected={item.isSelected}
            isOpened={item.isOpened}/>
        )
        break
      case 'track':
        var track = item.track
        return (
          <AlbumTracklistItem
            key={track.id}
            itemKey={track.id}
            album={item.album}
            track={track}
            index={item.index}
            isSelected={item.isSelected}
            isPlaying={item.isPlaying}
            handleClick={this.handleTracklistClick}
            handleDoubleClick={this.handleTracklistDoubleClick}/>
        )
        break
      case 'discNumber':
        return (
          <li key={item.key} className="disc-number">Disc {item.disc}</li>
        )
        break
    }
  },
  itemsRenderer: function(items, ref){
    return (
      <ol className="albums list-unstyled" ref={ref}>{items}</ol>
    )
  },
  itemSizeGetter: function(index){
    var height = 0
    var item = this.state.list[index]
    if(!item){
      return
    }
    switch(item.type){
      case 'album':
        height = 4 * this.props.baseFontSize
        break
      case 'track':
      case 'discNumber':
        height = 2 * this.props.baseFontSize
        break
    }
    return height
  },
  render: function() {
    var classes = cx({
      'playlist-content'  : true,
      'loading'           : !this.props.playlist.loaded
    })
    return (
      <div onClick={this.handleGlobalClick} className={classes}>
        <i className="fa fa-circle-o-notch fa-spin load-icon"></i>
        <ReactList
          itemRenderer={this.itemRenderer}
          itemsRenderer={this.itemsRenderer}
          itemSizeGetter={this.itemSizeGetter}
          length={this.state.list.length}
          threshold={this.getScrollThreshold()}
          type='variable'
          ref='list'
          list={this.state.list}
          currentTrack={this.props.currentTrack}
          selection={this.props.selection}
          openElements={this.props.openElements}
        />
        <DropArea
          height={this.calculateDropAreaHeight()}
          moveAlbum={this.moveAlbum}
          handleFolderDrop={this.handleFolderDrop}
          handleDragEnd={this.handleDragEnd}/>
      </div>
    )
  },
  handleGlobalClick: function(event){
    this.setState({ openMenu: null })
  },
  handleClick: function(event, item){
    this.props.handleClick(event, item)
  },
  handleTracklistClick: function(event, item){
    event.stopPropagation()
    this.props.handleClick(event, item)
  },
  handleTracklistDoubleClick: function(event, item){
    event.stopPropagation()
    this.playTrack(item.props.album, item.props.track.id)
  },
  handleFolderDrop: function(folder, afterId){
    if(!afterId){
      OpenPlaylistActions.addFolder(folder)
    }else{
      OpenPlaylistActions.addFolderAtPosition(folder, afterId)
    }
  },
  handleDragEnd: function(){
    var node = React.findDOMNode(this)
    _.forEach(node.querySelectorAll('.drag-over'), (e)=> e.classList.remove('drag-over', 'drag-over-bottom', 'drag-over-top') )
    node.querySelector('.drop-area').classList.remove('over')
  },
  moveAlbum: function(id, afterId, position){
    if(!afterId){
      afterId = this.props.playlist.getLast().id
    }
    if(id != afterId){
      OpenPlaylistActions.reorder(this.props.playlist.id, id, afterId, position)
    }
  },
  playTrack: function(album, trackId){
    OpenPlaylistActions.selectAlbum(album, trackId, this.props.playlist, true)
  },
  calculateDropAreaHeight: function(){
    var height = _.reduce(this.state.list, (memo, item, index)=>{
      memo += this.itemSizeGetter(index)
      return memo
    }, 0)
    return 'calc(100vh - 9rem - ' + height + 'px)'
  },
  scrollAround: function(id){
    var index = _.findIndex(this.state.list, item => item.id == id)
    this.refs.list.scrollAround(index)
  },
  scrollTo: function(id){
    var index = _.findIndex(this.state.list, item => item.id == id)
    this.refs.list.scrollTo(index)
  },
  getScrollThreshold: function(){
    return 0
  },
  _onListScrollHandler: _.throttle(function(event){
    if(!this.refs.list){
      return
    }
    var index = this.refs.list.state.from
    if(!index){
      return
    }
    var threshold = 3
    var lastScrolledAlbum = this.state.list[index]
    this.props.playlist.lastScrolledAlbumId = lastScrolledAlbum.id
  }, 100)
})

module.exports = AlbumPlaylist
