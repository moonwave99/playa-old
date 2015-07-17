"use babel";

var _ = require('lodash')
var ipc = require('ipc')
var cx = require('classnames')
var key = require('keymaster')

var React = require('react')
var Tabs = require('react-simpletabs')

var DragDropContext = require('react-dnd').DragDropContext
var HTML5Backend = require('react-dnd/modules/backends/HTML5')

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
    openPlaylists: OpenPlaylistStore.getAll(),
    selectedPlaylist: OpenPlaylistStore.getSelectedPlaylist(),
    selectedIndex: OpenPlaylistStore.getSelectedIndex()
  }
}

var Main = React.createClass({
  getInitialState: function() {
    return _.merge({ sidebar: getSidebarState() }, getOpenPlaylistState())
  },
  componentDidMount: function() {
    OpenPlaylistStore.addChangeListener(this._onOpenPlaylistChange)
    SidebarStore.addChangeListener(this._onSidebarChange)
    key('space', this.handleSpacePress)
    key(_.range(9).map( n => '⌘+' + n).join(', '), this.handleCommandNumberPress)
  },
  componentWillUnmount: function() {
    OpenPlaylistStore.removeChangeListener(this._onOpenPlaylistChange)
    SidebarStore.removeChangeListener(this._onSidebarChange)
    key.unbind('space')
    _.range(9).forEach( n => key.unbind('⌘+' + n))
  },
  render: function() {
    var openPlaylists = this.state.openPlaylists.map((playlist)=>{
      return (
        <Tabs.Panel title={playlist.title} key={playlist.id}>
          <Playlist playlist={playlist} isSidebarOpen={this.state.sidebar.isOpen}/>
        </Tabs.Panel>
      )
    })
    var classes = cx({
      'playa-main' : true,
      'sidebar-open' : this.state.sidebar.isOpen
    })
    return (
      <div className={classes}>
        <PlaybackBar/>
        <Sidebar {...this.state.sidebar}/>
        <div className="playa-main-wrapper">
          <Tabs
            tabActive={this.state.selectedIndex+1}
            onAfterChange={this.handleAfter}>
            {openPlaylists}
          </Tabs>
        </div>
        <Footer selectedPlaylist={this.state.selectedPlaylist} />
      </div>
    )
  },
  handleAfter: function(selectedIndex, $selectedPanel, $selectedTabMenu) {
    OpenPlaylistActions.select(selectedIndex-1)
  },
  handleCommandNumberPress: function(event){
    var index = event.which - 48
    if(index == 0){
      OpenPlaylistActions.select(this.state.openPlaylists.length -1)
    }else if(index <= this.state.openPlaylists.length){
      OpenPlaylistActions.select(index -1)
    }
  },
  handleSpacePress: function(event){
    PlayerActions.toggle()
  },
  _onOpenPlaylistChange: function() {
    this.setState(getOpenPlaylistState())
  },
  _onSidebarChange: function(){
    this.setState({ sidebar: getSidebarState()})
  }
})

module.exports = DragDropContext(HTML5Backend)(Main)
