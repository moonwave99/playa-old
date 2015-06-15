"use babel";

var ipc = require('ipc')

var React = require('react')
var Tabs = require('react-simpletabs')
var _ = require('lodash')
var PlaybackBar = require('./player/PlaybackBar.jsx')
var Playlist = require('./playlist/Playlist.jsx')

var AppDispatcher = require('../dispatcher/AppDispatcher')

var PlaylistStore = require('../stores/PlaylistStore')
var PlayerStore = require('../stores/PlayerStore')

var PlaylistConstants = require('../constants/PlaylistConstants')
var PlaylistActions = require('../actions/PlaylistActions')

ipc.on('playlist:create', function(){
  PlaylistActions.create()
})

ipc.on('playlist:clear', function(){
  AppDispatcher.dispatch({
    actionType: PlaylistConstants.CLEAR_PLAYLIST
  })
  PlaylistActions.clearPlaylist()
})

ipc.on('open:folder', function(folder){
  PlaylistActions.addFolder(folder)
})

function getPlaylistState(){
  return {
    playlists: PlaylistStore.getAll() || [],
    selectedPlaylist: PlaylistStore.getSelectedIndex() || 0
  }  
}

function getPlayerState(){
  return {
    playbackInfo: PlayerStore.getPlaybackInfo() || {}
  }
}

_ui = {}

module.exports = React.createClass({
  getInitialState: function() {
    return _.merge(getPlayerState(), getPlaylistState())
  },
  componentDidMount: function() {
    PlaylistStore.addChangeListener(this._onPlaylistChange)
    PlayerStore.addChangeListener(this._onPlayerChange)
    PlaylistActions.create()
    PlaylistActions.select(0)
    PlaylistActions.activate(0)
  },
  componentWillUnmount: function() {
    PlaylistStore.removeChangeListener(this._onPlaylistChange)
    PlayerStore.removeChangeListener(this._onPlayerChange)
  },  
  handleAfter: function(selectedIndex, $selectedPanel, $selectedTabMenu) {
    PlaylistActions.select(selectedIndex-1)
  },
  handleScroll: function(item, event){
    _ui[item.props.playlist.id] = React.findDOMNode(item).scrollTop
  },  
  render: function() {   
    var playlists = this.state.playlists.map((playlist)=>{
      return (
        <Tabs.Panel title={playlist.title} key={playlist.id}>
          <Playlist className="playa-playlist-main" playlist={playlist} handleScroll={this.handleScroll} scrollBy={_ui[playlist.id] || 0}/>
        </Tabs.Panel>
      )
    })
    return (
      <div className="playa-main">
        <PlaybackBar playbackInfo={this.state.playbackInfo}/>
        <Tabs
          tabActive={this.state.selectedPlaylist+1}
          onAfterChange={this.handleAfter}>
          {playlists}
        </Tabs>
      </div>
    )
  },
  _onPlaylistChange: function() {
    this.setState(getPlaylistState())
  },
  _onPlayerChange: function(){
    this.setState(getPlayerState())
  }  
})