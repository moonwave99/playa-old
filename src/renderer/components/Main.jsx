"use babel";

var ipc = require('ipc')
var _ = require('lodash')
var cx = require('classnames')

var React = require('react')
var Tabs = require('react-simpletabs')
var PlaybackBar = require('./player/PlaybackBar.jsx')
var Playlist = require('./playlist/Playlist.jsx')
var Sidebar = require('./Sidebar.jsx')
var Footer = require('./Footer.jsx')

var AppDispatcher = require('../dispatcher/AppDispatcher')

var PlaylistStore = require('../stores/PlaylistStore')
var PlayerStore = require('../stores/PlayerStore')
var SidebarStore = require('../stores/SidebarStore')

var PlaylistConstants = require('../constants/PlaylistConstants')
var PlaylistActions = require('../actions/PlaylistActions')

ipc.on('playlist:toggleViewMode', function(){
  var selectedPlaylist = PlaylistStore.getSelectedPlaylist()
  if(!selectedPlaylist)
    return
  PlaylistActions.updateUI(selectedPlaylist.id, { displayMode: selectedPlaylist.displayMode == 'table' ? 'albums' : 'table' })
})

ipc.on('playlist:create', function(){
  PlaylistActions.create()
})

ipc.on('playlist:clear', function(){
  PlaylistActions.clearPlaylist()
})

ipc.on('playlist:close', function(){
  PlaylistActions.closePlaylist()
})

ipc.on('open:folder', function(folder){
  PlaylistActions.addFolder(folder)
})

function getSidebarState(){
  return SidebarStore.getSidebarInfo()
}

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

module.exports = React.createClass({
  getInitialState: function() {
    return _.merge(getSidebarState() ,getPlayerState(), getPlaylistState())
  },
  componentDidMount: function() {
    PlaylistStore.addChangeListener(this._onPlaylistChange)
    PlayerStore.addChangeListener(this._onPlayerChange)
    SidebarStore.addChangeListener(this._onSidebarChange)
    PlaylistActions.create()
    PlaylistActions.select(0)
    PlaylistActions.activate(0)
  },
  componentWillUnmount: function() {
    PlaylistStore.removeChangeListener(this._onPlaylistChange)
    PlayerStore.removeChangeListener(this._onPlayerChange)
    SidebarStore.removeChangeListener(this._onSidebarChange)
  },  
  handleAfter: function(selectedIndex, $selectedPanel, $selectedTabMenu) {
    PlaylistActions.select(selectedIndex-1)
  },
  handleScroll: function(item, event){
    PlaylistActions.updateUI(item.props.playlist.id, { scrollBy: React.findDOMNode(item).scrollTop })
  },
  handleViewSwitchClick: function(){
    var selectedPlaylist = this.state.playlists[this.state.selectedPlaylist]
    if(!selectedPlaylist)
      return
    PlaylistActions.updateUI(selectedPlaylist.id, { displayMode: selectedPlaylist.displayMode == 'table' ? 'albums' : 'table' })
  },
  render: function() {   
    var openPlaylists = this.state.playlists.map((playlist)=>{
      return (
        <Tabs.Panel title={playlist.title} key={playlist.id}>
          <Playlist
            className="playa-playlist-main"
            playlist={playlist}
            handleScroll={this.handleScroll}
            currentItem={this.state.playbackInfo.item}/>
        </Tabs.Panel>
      )
    })
    var classes = cx({
      'playa-main' : true,
      'sidebar-open' : this.state.showSidebar
    })
    return (
      <div className={classes}>
        <PlaybackBar playbackInfo={this.state.playbackInfo}/>
        <Sidebar isOpen={this.state.showSidebar}/>
        <div className="playa-main-wrapper">
          <Tabs
            tabActive={this.state.selectedPlaylist+1}
            onAfterChange={this.handleAfter}>
            {openPlaylists}
          </Tabs>
        </div>
            <Footer handleViewSwitchClick={this.handleViewSwitchClick} selectedPlaylist={this.state.playlists[this.state.selectedPlaylist] || {} } />
      </div>
    )
  },
  _onPlaylistChange: function() {
    this.setState(getPlaylistState())
  },
  _onPlayerChange: function(){
    this.setState(getPlayerState())
  },
  _onSidebarChange: function(){
    this.setState(getSidebarState())
  }
})