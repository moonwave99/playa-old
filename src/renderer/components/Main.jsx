"use babel";

var _ = require('lodash')
var ipc = require('ipc')
var cx = require('classnames')
var key = require('keymaster')

var React = require('react')
var Tabs = require('react-simpletabs')

var DragDropContext = require('react-dnd').DragDropContext
var HTML5Backend = require('react-dnd/modules/backends/HTML5')

var ContextMenu = require('./ContextMenu.jsx')
var PlaybackBar = require('./player/PlaybackBar.jsx')
var Playlist = require('./playlist/Playlist.jsx')
var Sidebar = require('./Sidebar/Sidebar.jsx')
var Footer = require('./Footer.jsx')

var ContextMenuStore = require('../stores/ContextMenuStore')
var OpenPlaylistStore = require('../stores/OpenPlaylistStore')
var SidebarStore = require('../stores/SidebarStore')

var ContextMenuActions = require('../actions/ContextMenuActions')
var OpenPlaylistActions = require('../actions/OpenPlaylistActions')
var PlayerActions = require('../actions/PlayerActions')

var KeyboardFocusActions = require('../actions/KeyboardFocusActions')
var KeyboardNameSpaceConstants = require('../constants/KeyboardNameSpaceConstants')

function getContextMenuState(){
  return ContextMenuStore.getInfo()
}

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
    return _.merge({
      sidebar: getSidebarState(),
      contextMenu: getContextMenuState(),
    }, getOpenPlaylistState())
  },
  componentDidMount: function() {
    OpenPlaylistStore.addChangeListener(this._onOpenPlaylistChange)
    SidebarStore.addChangeListener(this._onSidebarChange)
    ContextMenuStore.addChangeListener(this._onContextMenuChange)

    key('space', this.handleSpacePress)
    key(_.range(9).map( n => '⌘+' + n).join(', '), this.handleCommandNumberPress)
  },
  componentWillUnmount: function() {
    OpenPlaylistStore.removeChangeListener(this._onOpenPlaylistChange)
    SidebarStore.removeChangeListener(this._onSidebarChange)
    ContextMenuStore.removeChangeListener(this._onContextMenuChange)

    key.unbind('space')
    _.range(9).forEach( n => key.unbind('⌘+' + n))
  },
  componentDidUpdate: function(prevProps, prevState) {
    if(prevState.selectedIndex !== this.state.selectedIndex){
      KeyboardFocusActions.requestFocus(KeyboardNameSpaceConstants.ALBUM_PLAYLIST)
    }
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
      <div className={classes} onClick={this.handleGlobalClick}>
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
        <ContextMenu {...this.state.contextMenu}/>
      </div>
    )
  },
  handleGlobalClick: function(event){
    ContextMenuActions.hide()
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
  },
  _onContextMenuChange: function(){
    this.setState({ contextMenu: getContextMenuState()})
  }
})

module.exports = DragDropContext(HTML5Backend)(Main)
