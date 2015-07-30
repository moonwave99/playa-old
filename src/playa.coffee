_                           = require 'lodash'
fs                          = require 'fs-extra'
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
LastFMClient                = require './renderer/util/LastFMClient'
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

OpenPlaylistManager         = require './renderer/util/OpenPlaylistManager'
FileTree                    = require './renderer/util/FileTree'

_tabScopeNames = [
  KeyboardNameSpaceConstants.PLAYLIST_BROWSER,
  KeyboardNameSpaceConstants.FILE_BROWSER,
  KeyboardNameSpaceConstants.SETTINGS
]

module.exports = class Playa
  constructor: (options) ->

    @firstPlaylistLoad = false

    @options = options
    @options.settings =
      fileBrowserRoot:    path.join process.env.HOME, 'Downloads'
      playlistRoot:       path.join @options.userDataFolder, 'Playlists'
      fileExtensions:     ['mp3', 'm4a', 'flac', 'ogg']
      playlistExtension:  '.yml'
      useragent:          'playa/v0.1'
      scrobbleThreshold:
        percent:  0.5
        absolute: 4 * 60

    @options.userSettings =
      scrobbleEnabled:  true

    @options.mainProps =
      breakpoints:
        widescreen: '1500px'

    @options.discogs  = fs.readJsonSync path.join __dirname, '..',  'settings', 'discogs.json'
    @options.lastfm   = fs.readJsonSync path.join __dirname, '..',  'settings', 'lastfm.json'

    @fileBrowser = new FileBrowser()

    @fileTree = new FileTree
      fileBrowser:  @fileBrowser
      rootFolder:   @options.settings.fileBrowserRoot
      rootName:     path.basename @options.settings.fileBrowserRoot
      filter:       'directory'

    @playlistTree = new FileTree
      fileBrowser:  @fileBrowser
      rootFolder:   @options.settings.playlistRoot
      rootName:     'Playlists'
      filter:       @options.settings.playlistExtension

    @playlistLoader = new PlaylistLoader
      root:               @options.settings.playlistRoot
      playlistExtension:  @options.settings.playlistExtension

    @mediaFileLoader = new MediaFileLoader
      fileExtensions: @options.settings.fileExtensions

    @coverLoader = new CoverLoader
      root: path.join @options.userDataFolder, 'Covers'
      discogs:
        key:      @options.discogs.DISCOGS_KEY
        secret:   @options.discogs.DISCOGS_SECRET
        throttle: 1000

    @waveformLoader = new WaveformLoader
      root: path.join @options.userDataFolder, 'Waveforms'
      config:
        'wait'              : 300,
        'png-width'         : 1600,
        'png-height'        : 160,
        'png-color-bg'      : '00000000',
        'png-color-center'  : '505050FF',
        'png-color-outer'   : '505050FF'

    @openPlaylistManager = new OpenPlaylistManager
      loader: @playlistLoader

    @lastFMClient = new LastFMClient
      scrobbleEnabled:  @options.userSettings.scrobbleEnabled
      key:              @options.lastfm.LASTFM_KEY
      secret:           @options.lastfm.LASTFM_SECRET
      useragent:        @options.settings.useragent
      sessionInfo:      @options.sessionSettings.lastFMSession

    @lastFMClient.on 'authorised', (options = {})=>
      console.info 'LastFM authorisation succesful', @lastFMClient.session
      ipc.send 'session:save', key: 'lastFMSession', value:
        key:  @lastFMClient.session.key
        user: @lastFMClient.session.user

    @lastFMClient.on 'scrobbledTrack', (track)=>
      console.info 'LastFM scrobbled:', track

    @player = new Player
      mediaFileLoader: @mediaFileLoader
      resolution: 1000
      scrobbleThreshold: @options.settings.scrobbleThreshold

    @player.on 'trackChange', ->
      PlayerStore.emitChange()

    @player.on 'nowplaying', ->
      playbackInfo = PlayerStore.getPlaybackInfo()
      selectedPlaylist = OpenPlaylistStore.getSelectedPlaylist()
      selectedPlaylist.lastPlayedAlbumId = playbackInfo.currentAlbum.id
      selectedPlaylist.lastPlayedTrackId = playbackInfo.currentTrack.id
      OpenPlaylistActions.savePlaylist()
      PlayerStore.emitChange()

    @player.on 'playerTick', ->
      PlayerStore.emitChange()

    @player.on 'scrobbleTrack', (track, after) =>
      @lastFMClient.scrobble(track, after)

    OpenPlaylistStore.addChangeListener @_onOpenPlaylistChange

  init: ->
    @initIPC()
    @loadPlaylists()
    @lastFMClient.authorise()

  loadPlaylists: =>
    playlists = []
    if @options.sessionSettings.openPlaylists
      playlists = @options.sessionSettings.openPlaylists.map (i) ->
        new AlbumPlaylist({ id: md5(i), path: i })

    if playlists.length == 0
      playlists.push new AlbumPlaylist({ title: 'Untitled', id: md5('Untitled' + @options.settings.playlistExtension) })

    AppDispatcher.dispatch
      actionType: OpenPlaylistConstants.ADD_PLAYLIST
      playlists: playlists

    AppDispatcher.dispatch
      actionType: OpenPlaylistConstants.SELECT_PLAYLIST
      selected: Math.max @options.sessionSettings.selectedPlaylist, 0

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

  toggleSidebar: (toggle)=>
    AppDispatcher.dispatch
      actionType: SidebarConstants.TOGGLE
      toggle: toggle

    SidebarStatus = SidebarStore.getInfo()
    if SidebarStatus.isOpen
      switch SidebarStatus.selectedTab
        when 0 then @loadSidebarPlaylists()
        when 1 then @loadSidebarFileBrowser()

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
        actionType: if @player.playing then PlayerConstants.PAUSE else PlayerConstants.PLAY

    ipc.on 'sidebar:toggle', =>
      @toggleSidebar()

    ipc.on 'playlist:create', =>
      AppDispatcher.dispatch
        actionType: OpenPlaylistConstants.ADD_PLAYLIST
        playlists: [ new AlbumPlaylist({ title: 'Untitled', id: md5('Untitled' + @options.settings.playlistExtension) }) ]

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

  render: ->
    React.render React.createElement(Main, @options.mainProps), document.getElementById('main')

  postRender: ->
    AppDispatcher.dispatch
      actionType: KeyboardFocusConstants.REQUEST_FOCUS
      scopeName:  KeyboardNameSpaceConstants.ALBUM_PLAYLIST

  _onOpenPlaylistChange: =>
    playlists = @openPlaylistManager.playlists
    playlistPaths = playlists.filter((i) -> !i.isNew() ).map (i) -> i.path
    selectedPlaylistIndex = @openPlaylistManager.selectedIndex
    if playlists.length then ipc.send 'session:save', key: 'openPlaylists', value: playlistPaths
    if selectedPlaylistIndex > -1
      ipc.send 'session:save', key: 'selectedPlaylist', value: selectedPlaylistIndex
      AppDispatcher.dispatch
        actionType: KeyboardFocusConstants.REQUEST_FOCUS
        scopeName:  KeyboardNameSpaceConstants.ALBUM_PLAYLIST

    if !@firstPlaylistLoad and playlists.length > 0 and selectedPlaylistIndex > -1
      @firstPlaylistLoad = true
      selectedPlaylist = @openPlaylistManager.getSelectedPlaylist()
      selectedAlbum = selectedPlaylist.getLastPlayedAlbum()
      if selectedAlbum
        AppDispatcher.dispatch
          actionType: OpenPlaylistConstants.SELECT_ALBUM
          playlist: selectedPlaylist
          album: selectedAlbum
          trackId: selectedPlaylist.lastPlayedTrackId
          play: false
