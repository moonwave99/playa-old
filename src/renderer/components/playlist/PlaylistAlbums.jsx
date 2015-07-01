"use babel"

var _ = require('lodash')
var uid = require('uid')
var key = require('keymaster')
var React = require('react')
var ReactPropTypes = React.PropTypes
var PlaylistAlbumItem = require('./PlaylistAlbumItem.jsx')

var OpenPlaylistActions = require('../../actions/OpenPlaylistActions')
var PlayerActions = require('../../actions/PlayerActions')
var PlayerStore = require('../../stores/PlayerStore')

function getPlayerState(){
  var playerState = PlayerStore.getPlaybackInfo()
  return {
    currentItem: playerState.item
  }  
}

var PlaylistAlbums = React.createClass({
  propTypes: {
    albums: ReactPropTypes.array,
    handleClick: ReactPropTypes.func,
    handleDoubleClick: ReactPropTypes.func
  },
  getInitialState: function(){
    return getPlayerState()
  },  
  componentDidMount: function(){
    PlayerStore.addChangeListener(this._onPlayerChange)
  },
  componentWillUnmount: function(){
    PlayerStore.removeChangeListener(this._onPlayerChange)
  },  
  render: function() {
    var albums = this.props.albums.map((album, index)=>{
      var output = (
        <PlaylistAlbumItem
          key={album.title || uid()}
          itemKey={album.id}
          album={album}
          metadata={album.tracks[0].metadata}
          handleClick={this.handleClick}
          handleDoubleClick={this.handleDoubleClick}
          currentItem={this.state.currentItem}
          isOpened={this.props.openElements.indexOf(album.id) > -1}
          isSelected={this.props.selection.indexOf(album.id) > -1} />
      )
      return output
    })
    
    return (
      <div className="albums">{albums}</div>
    )
  },
  handleClick: function(event, item){
    this.props.handleClick(event, item)
  },  
  handleDoubleClick: function(id){
    this.props.handleDoubleClick(id)
  },
  _onPlayerChange: function(){
    this.setState(getPlayerState())
  }  
})

module.exports = PlaylistAlbums