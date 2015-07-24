_                           = require 'lodash'
md5                         = require 'md5'
ipc                         = require 'ipc'
path                        = require 'path'
React                       = require 'react'
Main                        = require './renderer/components/Main.jsx'
Player                      = require './renderer/util/Player'
AlbumPlaylist               = require './renderer/util/AlbumPlaylist'
FileBrowser                 = require './renderer/util/FileBrowser'
PlaylistLoader              = require './renderer/util/PlaylistLoader'
MediaFileLoader             = require './renderer/util/MediaFileLoader'
CoverLoader                 = require './renderer/util/CoverLoader'
WaveformLoader              = require './renderer/util/WaveformLoader'
AppDispatcher               = require './renderer/dispatcher/AppDispatcher'
PlayerConstants             = require './renderer/constants/PlayerConstants'
FileBrowserConstants        = require './renderer/constants/FileBrowserConstants'
PlaylistBrowserConstants    = require './renderer/constants/PlaylistBrowserConstants'
OpenPlaylistConstants       = require './renderer/constants/OpenPlaylistConstants'
KeyboardFocusConstants      = require './renderer/constants/KeyboardFocusConstants'
SidebarConstants            = require './renderer/constants/SidebarConstants'
PlayerStore                 = require './renderer/stores/PlayerStore'
OpenPlaylistStore           = require './renderer/stores/OpenPlaylistStore'
SidebarStore                = require './renderer/stores/SidebarStore'
OpenPlaylistActions         = require './renderer/actions/OpenPlaylistActions'
KeyboardFocusActions        = require './renderer/actions/KeyboardFocusActions'
KeyboardNameSpaceConstants  = require './renderer/constants/KeyboardNameSpaceConstants'

FileTree                    = require './renderer/util/FileTree'

require('dotenv').load()

_tabScopeNames = [
  KeyboardNameSpaceConstants.PLAYLIST_BROWSER,
  KeyboardNameSpaceConstants.FILE_BROWSER,
  KeyboardNameSpaceConstants.SETTINGS
]

module.exports = class Playa
  constructor: (options) ->
    @options = options
    @options.settings =
      fileBrowserRoot:  path.join process.env.HOME, 'Downloads'
      playlistRoot:     path.join @options.userDataFolder, 'Playlists'

    @fileBrowser = new FileBrowser()

    @fileTree = new FileTree
      fileBrowser:  @fileBrowser
      rootFolder:   @options.settings.fileBrowserRoot
      rootName:     path.basename @options.settings.fileBrowserRoot
      filter:       'directory'

    @fileTree.loadRoot()

    @playlistTree = new FileTree
      fileBrowser:  @fileBrowser
      rootFolder:   @options.settings.playlistRoot
      rootName:     'Playlists'
      filter:       'm3u'

    @playlistTree.loadRoot()

    @playlistLoader = new PlaylistLoader
      root: @options.settings.playlistRoot
      playlistExtension: 'm3u'

    @mediaFileLoader = new MediaFileLoader
      fileExtensions: ['mp3', 'mp4', 'flac', 'ogg']

    @coverLoader = new CoverLoader
      root: path.join @options.userDataFolder, 'Covers'
      discogs:
        key: process.env.DISCOGS_KEY
        secret: process.env.DISCOGS_SECRET
        throttle: 1000

    @waveformLoader = new WaveformLoader
      root: path.join @options.userDataFolder, 'Waveforms'
      config:
        'wait'              : 100,
        'png-width'         : 1600,
        'png-height'        : 160,
        'png-color-bg'      : '00000000',
        'png-color-center'  : '505050FF',
        'png-color-outer'   : '505050FF'

    @player = new Player
      mediaFileLoader: @mediaFileLoader

    @player.on 'nowplaying', ->
      PlayerStore.emitChange()

    @player.on 'playerTick', ->
      PlayerStore.emitChange()

    OpenPlaylistStore.addChangeListener @_onOpenPlaylistChange

  init: ->
    @initIPC()
    @loadPlaylists()

  loadPlaylists: ->
    playlists = []
    if @options.sessionSettings.openPlaylists
      playlists = @options.sessionSettings.openPlaylists.map (i) ->
        new AlbumPlaylist({ id: md5(i), path: i })

    if playlists.length == 0
      playlists.push new AlbumPlaylist({ title: 'Untitled', id: md5('Untitled.m3u') })

    AppDispatcher.dispatch
      actionType: OpenPlaylistConstants.ADD_PLAYLIST
      playlists: playlists

    AppDispatcher.dispatch
      actionType: OpenPlaylistConstants.SELECT_PLAYLIST
      selected: @options.sessionSettings.selectedPlaylist or 0

  loadSidebarPlaylists: =>
    AppDispatcher.dispatch
      actionType: PlaylistBrowserConstants.LOAD_PLAYLIST_ROOT
      folder: @options.settings.playlistRoot

  loadSidebarFileBrowser: =>
    AppDispatcher.dispatch
      actionType: FileBrowserConstants.LOAD_FILEBROWSER_ROOT
      folder: @options.settings.fileBrowserRoot

  selectTab: (tab, tabScopeName)=>
    AppDispatcher.dispatch
      actionType: SidebarConstants.SELECT_TAB
      tab: tab

    if SidebarStore.getInfo().isOpen
      AppDispatcher.dispatch
        actionType: KeyboardFocusConstants.REQUEST_FOCUS
        scopeName:  tabScopeName
    else
      AppDispatcher.dispatch
        actionType: KeyboardFocusConstants.REQUEST_FOCUS
        scopeName:  KeyboardNameSpaceConstants.ALBUM_PLAYLIST

  initIPC: ->
    ipc.on 'sidebar:show', (tabName)=>
      switch tabName
        when 'playlists'
          @loadSidebarPlaylists()
          tab = 0
        when 'files'
          @loadSidebarFileBrowser()
          tab = 1
        when 'settings'
          tab = 2

      @selectTab(tab, _tabScopeNames[tab])

    ipc.on 'playback:prev', ->
      AppDispatcher.dispatch
        actionType: PlayerConstants.PREV

    ipc.on 'playback:next', ->
      AppDispatcher.dispatch
        actionType: PlayerConstants.NEXT

    ipc.on 'playback:toggle', =>
      AppDispatcher.dispatch
        actionType: if @player.playing() then PlayerConstants.PAUSE else PlayerConstants.PLAY

    ipc.on 'sidebar:toggle', =>
      @toggleSidebar()

    ipc.on 'playlist:create', ->
      AppDispatcher.dispatch
        actionType: OpenPlaylistConstants.ADD_PLAYLIST
        playlists: [ new AlbumPlaylist({ title: 'Untitled', id: md5('Untitled.m3u') }) ]

    ipc.on 'playlist:save', ->
      AppDispatcher.dispatch
        actionType: OpenPlaylistConstants.SAVE_PLAYLIST

    ipc.on 'playlist:close', ->
      AppDispatcher.dispatch
        actionType: OpenPlaylistConstants.CLOSE_PLAYLIST

    ipc.on 'open:folder', (folder)->
      AppDispatcher.dispatch
        actionType: OpenPlaylistConstants.ADD_FOLDER
        folder: folder

  toggleSidebar: (toggle)=>
    AppDispatcher.dispatch
      actionType: SidebarConstants.TOGGLE
      toggle: toggle

    SidebarStatus = SidebarStore.getInfo()
    if SidebarStatus.isOpen
      switch SidebarStatus.selectedTab
        when 0
          @loadSidebarPlaylists()
        when 1
          @loadSidebarFileBrowser()

  getMainProps: ->
    breakpoints:
      widescreen: '1500px'

  render: ->
    React.render React.createElement(Main, @getMainProps()), document.getElementById('main')

  postRender: ->
    AppDispatcher.dispatch
      actionType: KeyboardFocusConstants.REQUEST_FOCUS
      scopeName:  KeyboardNameSpaceConstants.ALBUM_PLAYLIST

  _onOpenPlaylistChange: ->
    playlists = OpenPlaylistStore.getAll().filter((i) -> !i.isNew() ).map (i) -> i.path
    selectedPlaylist = OpenPlaylistStore.getSelectedIndex()
    if playlists.length then ipc.send 'session:save', key: 'openPlaylists', value: playlists
    if selectedPlaylist > -1
      ipc.send 'session:save', key: 'selectedPlaylist', value: selectedPlaylist
      AppDispatcher.dispatch
        actionType: KeyboardFocusConstants.REQUEST_FOCUS
        scopeName:  KeyboardNameSpaceConstants.ALBUM_PLAYLIST
