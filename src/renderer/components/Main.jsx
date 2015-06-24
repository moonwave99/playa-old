"use babel";

var ipc = require('ipc')
var _ = require('lodash')
var cx = require('classnames')

var React = require('react')
var Tabs = require('react-simpletabs')
var PlaybackBar = require('./player/PlaybackBar.jsx')
var Playlist = require('./playlist/Playlist.jsx')
var Sidebar = require('./Sidebar/Sidebar.jsx')
var Footer = require('./Footer.jsx')

var AppDispatcher = require('../dispatcher/AppDispatcher')

var OpenPlaylistStore = require('../stores/OpenPlaylistStore')
var PlayerStore = require('../stores/PlayerStore')
var SidebarStore = require('../stores/SidebarStore')

var OpenPlaylistActions = require('../actions/OpenPlaylistActions')

function getSidebarState(){
  return SidebarStore.getSidebarInfo()
}

function getOpenPlaylistState(){
  return {
    openPlaylists: OpenPlaylistStore.getAll() || [],
    selectedPlaylist: OpenPlaylistStore.getSelectedPlaylist() || null,
    selectedIndex: OpenPlaylistStore.getSelectedIndex()
  }  
}

function getPlayerState(){
  return {
    playbackInfo: PlayerStore.getPlaybackInfo() || {}
  }
}

module.exports = React.createClass({
  getInitialState: function() {
    return _.merge(getSidebarState() ,getPlayerState(), getOpenPlaylistState())
  },
  componentDidMount: function() {
    OpenPlaylistStore.addChangeListener(this._onOpenPlaylistChange)
    PlayerStore.addChangeListener(this._onPlayerChange)
    SidebarStore.addChangeListener(this._onSidebarChange)
  },
  componentWillUnmount: function() {
    OpenPlaylistStore.removeChangeListener(this._onOpenPlaylistChange)
    PlayerStore.removeChangeListener(this._onPlayerChange)
    SidebarStore.removeChangeListener(this._onSidebarChange)
  },  
  handleAfter: function(selectedIndex, $selectedPanel, $selectedTabMenu) {
    OpenPlaylistActions.select(selectedIndex-1)
  },
  handleScroll: function(item, event){
    OpenPlaylistActions.updateUI(item.props.playlist.id, { scrollBy: React.findDOMNode(item).scrollTop })
  },
  handleViewSwitchClick: function(){
    if(!this.state.selectedPlaylist)
      return
    OpenPlaylistActions.updateUI(this.state.selectedPlaylist.id, { displayMode: this.state.selectedPlaylist.displayMode == 'table' ? 'albums' : 'table' })
  },
  render: function() {   
    var openPlaylists = this.state.openPlaylists.map((playlist)=>{
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
            tabActive={this.state.selectedIndex+1}
            onAfterChange={this.handleAfter}>
            {openPlaylists}
          </Tabs>
        </div>
        <Footer handleViewSwitchClick={this.handleViewSwitchClick} selectedPlaylist={this.state.selectedPlaylist || {} } />
      </div>
    )
  },
  _onOpenPlaylistChange: function() {
    this.setState(getOpenPlaylistState())
  },
  _onPlayerChange: function(){
    this.setState(getPlayerState())
  },
  _onSidebarChange: function(){
    this.setState(getSidebarState())
  }
})