"use babel";

var ipc = require('ipc')
var _ = require('lodash')
var cx = require('classnames')
var key = require('keymaster')

var React = require('react')
var Tabs = require('react-simpletabs')
var PlaybackBar = require('./player/PlaybackBar.jsx')
var Playlist = require('./playlist/Playlist.jsx')
var Sidebar = require('./Sidebar/Sidebar.jsx')
var Footer = require('./Footer.jsx')

var OpenPlaylistStore = require('../stores/OpenPlaylistStore')
var SidebarStore = require('../stores/SidebarStore')

var OpenPlaylistActions = require('../actions/OpenPlaylistActions')
var PlayerActions = require('../actions/PlayerActions')

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

module.exports = React.createClass({
  getInitialState: function() {
    return _.merge(getSidebarState(), getOpenPlaylistState())
  },
  componentDidMount: function() {
    OpenPlaylistStore.addChangeListener(this._onOpenPlaylistChange)
    SidebarStore.addChangeListener(this._onSidebarChange)
    key('space', this.handleSpacePress)
  },
  componentWillUnmount: function() {
    OpenPlaylistStore.removeChangeListener(this._onOpenPlaylistChange)
    SidebarStore.removeChangeListener(this._onSidebarChange)
    key.unbind('space')
  },  
  handleAfter: function(selectedIndex, $selectedPanel, $selectedTabMenu) {
    OpenPlaylistActions.select(selectedIndex-1)
  },
  handleViewSwitchClick: function(){
    if(!this.state.selectedPlaylist)
      return
    OpenPlaylistActions.updateUI(this.state.selectedPlaylist.id, { displayMode: this.state.selectedPlaylist.getDisplayMode() == 'table' ? 'albums' : 'table' })
  },
  render: function() {  
    var openPlaylists = this.state.openPlaylists.map((playlist)=>{
      return (
        <Tabs.Panel title={playlist.title} key={playlist.id}>
          <Playlist playlist={playlist}/>
        </Tabs.Panel>
      )
    })
    var classes = cx({
      'playa-main' : true,
      'sidebar-open' : this.state.showSidebar
    })
    return (
      <div className={classes}>
        <PlaybackBar/>
        <Sidebar isOpen={this.state.showSidebar}/>
        <div className="playa-main-wrapper">
          <Tabs
            tabActive={this.state.selectedIndex+1}
            onAfterChange={this.handleAfter}>
            {openPlaylists}
          </Tabs>
        </div>
        <Footer handleViewSwitchClick={this.handleViewSwitchClick} selectedPlaylist={this.state.selectedPlaylist} />
      </div>
    )
  },
  handleSpacePress: function(event){
    PlayerActions.toggle()
  },
  _onOpenPlaylistChange: function() {
    this.setState(getOpenPlaylistState())
  },
  _onSidebarChange: function(){
    this.setState(getSidebarState())
  }
})