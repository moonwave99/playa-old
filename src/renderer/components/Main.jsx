"use babel";

let _ = require('lodash')
let ipc = require('electron').ipcRenderer
let cx = require('classnames')
let key = require('keymaster')
let enquire = require('enquire.js')

let React = require('react')
let ReactDOM = require('react-dom')
let Tabs = require('react-simpletabs')

let DragDropContext = require('react-dnd').DragDropContext
let HTML5Backend = require('react-dnd/modules/backends/HTML5')

let Modal = require('./Modal.jsx')
let ContextMenu = require('./ContextMenu.jsx')
let PlaybackBar = require('./player/PlaybackBar.jsx')
let Playlist = require('./playlist/Playlist.jsx')
let Sidebar = require('./Sidebar/Sidebar.jsx')
let Footer = require('./Footer.jsx')

let ModalStore = require('../stores/ModalStore')
let ContextMenuStore = require('../stores/ContextMenuStore')
let OpenPlaylistStore = require('../stores/OpenPlaylistStore')
let SidebarStore = require('../stores/SidebarStore')
let SettingsStore = require('../stores/SettingsStore')

let ModalActions = require('../actions/ModalActions')
let ContextMenuActions = require('../actions/ContextMenuActions')
let OpenPlaylistActions = require('../actions/OpenPlaylistActions')
let SidebarActions = require('../actions/SidebarActions')
let PlayerActions = require('../actions/PlayerActions')

let KeyboardFocusActions = require('../actions/KeyboardFocusActions')
let KeyboardNameSpaceConstants = require('../constants/KeyboardNameSpaceConstants')

function getModalState(){
  return ModalStore.getInfo()
}

function getContextMenuState(){
  return ContextMenuStore.getInfo()
}

function getSidebarState(){
  return SidebarStore.getInfo()
}

function getOpenPlaylistState(){
  return {
    openPlaylists: OpenPlaylistStore.getAll(),
    selectedPlaylist: OpenPlaylistStore.getSelectedPlaylist(),
    selectedIndex: OpenPlaylistStore.getSelectedIndex()
  }
}

function getSettingsState(){
  return SettingsStore.getSettings()
}

let Main = React.createClass({
  getInitialState: function() {
    return _.merge({
      sidebar: getSidebarState(),
      contextMenu: getContextMenuState(),
      modal: getModalState(),
      settings: getSettingsState(),
      baseFontSize: this.props.baseFontSize.normal
    }, getOpenPlaylistState())
  },
  componentDidMount: function() {
    OpenPlaylistStore.addChangeListener(this._onOpenPlaylistChange)
    SidebarStore.addChangeListener(this._onSidebarChange)
    ContextMenuStore.addChangeListener(this._onContextMenuChange)
    ModalStore.addChangeListener(this._onModalChange)
    SettingsStore.addChangeListener(this._onSettingsChange)

    this._registerCommonKeyHandler()
    this._registerMediaQueryHandler()
  },
  componentWillUnmount: function() {
    OpenPlaylistStore.removeChangeListener(this._onOpenPlaylistChange)
    SidebarStore.removeChangeListener(this._onSidebarChange)
    ContextMenuStore.removeChangeListener(this._onContextMenuChange)
    ModalStore.removeChangeListener(this._onModalChange)
    SettingsStore.removeChangeListener(this._onSettingsChange)

    this._unregisterCommonKeyHandler()
    this._unregisterMediaQueryHandler()
  },
  componentDidUpdate: function(prevProps, prevState) {
    if(prevState.selectedIndex !== this.state.selectedIndex){
      KeyboardFocusActions.requestFocus(KeyboardNameSpaceConstants.ALBUM_PLAYLIST)
    }
    this._updateTabsWidth()
  },
  render: function() {
    let baseFontSize = this.state.baseFontSize || this.props.baseFontSize.normal
    let openPlaylists = this.state.openPlaylists.map((playlist)=>{
      return (
        <Tabs.Panel title={playlist.title} key={playlist.id}>
          <Playlist playlist={playlist} isSidebarOpen={this.state.sidebar.isOpen} baseFontSize={baseFontSize}/>
        </Tabs.Panel>
      )
    })
    let classes = cx({
      'playa-main' : true,
      'sidebar-open' : this.state.sidebar.isOpen
    })
    return (
      <div className={classes} onClick={this.handleGlobalClick}>
        <Modal {...this.state.modal}/>
        <PlaybackBar/>
        <Sidebar settings={this.state.settings} {...this.state.sidebar}/>
        <div className="playa-main-wrapper">
          <Tabs
            ref="tabs"
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
    let index = event.which - 48
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
    this.setState({ sidebar: getSidebarState() })
  },
  _onContextMenuChange: function(){
    this.setState({ contextMenu: getContextMenuState() })
  },
  _onModalChange: function(){
    this.setState({ modal: getModalState() })
  },
  _onSettingsChange: function(){
    this.setState({ settings: getSettingsState() })
  },
  _registerCommonKeyHandler: function(){
    key('space', this.handleSpacePress)
    key(_.range(9).map( n => '⌘+' + n).join(', '), this.handleCommandNumberPress)
  },
  _unregisterCommonKeyHandler: function(){
    key.unbind('space')
    _.range(9).forEach( n => key.unbind('⌘+' + n))
  },
  _registerMediaQueryHandler: function(){
    enquire.register('screen and (min-width:' + this.props.breakpoints.widescreen + ')', {
      match: ()=>{
        this.state.settings.user.openSidebar && playa.toggleSidebar(true)
      },
      unmatch: ()=>{}
    })
    enquire.register('screen and (min-width:' + this.props.breakpoints.widefont + ')', {
      match: ()=>{
        this.setState({ baseFontSize: this.props.baseFontSize.wide })
      },
      unmatch: ()=>{
        this.setState({ baseFontSize: this.props.baseFontSize.normal })
      }
    })
  },
  _unregisterMediaQueryHandler: function(){
    enquire.unregister('screen and (min-width:' + this.props.breakpoints.widescreen + ')')
    enquire.unregister('screen and (min-width:' + this.props.breakpoints.widefont + ')')
  },
  _updateTabsWidth: function(){
    let width = ((this.state.openPlaylists.length - 1) * this.state.baseFontSize * 10 + this.state.baseFontSize * 15) + 'px'
    ReactDOM.findDOMNode(this.refs.tabs).querySelector('.tabs-menu').style.width = width
  }
})

module.exports = DragDropContext(HTML5Backend)(Main)
