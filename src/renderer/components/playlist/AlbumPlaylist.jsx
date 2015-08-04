"use babel"

var _ = require('lodash')
var uid = require('uid')
var React = require('react')
var ReactPropTypes = React.PropTypes
var ReactList = require('react-list')

var AlbumPlaylistItem = require('./AlbumPlaylistItem.jsx')
var AlbumTracklistItem = require('./AlbumTracklistItem.jsx')
var OpenPlaylistActions = require('../../actions/OpenPlaylistActions')
var PlayerActions = require('../../actions/PlayerActions')
var PlayerStore = require('../../stores/PlayerStore')

var DropArea = require('./DropArea.jsx')

function getPlayerState(){
  var playerState = PlayerStore.getPlaybackInfo()
  return {
    currentTrack: playerState.currentTrack
  }
}

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
    return _.extend({
      list: this.getFlattenedList(this.props, this.state)
    }, getPlayerState())
  },
  componentDidMount: function(){
    PlayerStore.addChangeListener(this._onPlayerChange)
  },
  componentWillUnmount: function(){
    PlayerStore.removeChangeListener(this._onPlayerChange)
  },
  componentWillReceiveProps: function(nextProps){
    this.setState({
      list: this.getFlattenedList(nextProps)
    })
  },
  getFlattenedList: function(props){
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
            isPlaying: this.state.currentTrack && (track.id == this.state.currentTrack.id)
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
            currentTrack={this.state.currentTrack || {}}
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
        height = 56
        break
      case 'track':
      case 'discNumber':
        height = 28
        break
    }
    return height
  },
  render: function() {
    return (
      <div onClick={this.handleGlobalClick}>
        <ReactList
          itemRenderer={this.itemRenderer}
          itemsRenderer={this.itemsRenderer}
          itemSizeGetter={this.itemSizeGetter}
          length={this.state.list.length}
          threshold={56 * 4}
          type='variable'
          ref='list'
          list={this.state.list}
          currentTrack={this.state.currentTrack}
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
  scrollTo: function(id){
    var index = _.findIndex(this.state.list, item => item.id == id)
    this.refs.list.scrollAround(index)
  },
  _onPlayerChange: function(){
    this.setState(getPlayerState())
  }
})

module.exports = AlbumPlaylist
