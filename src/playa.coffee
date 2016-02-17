_                           = require 'lodash'
fs                          = require 'fs-extra'
fsPlus                      = require 'fs-plus'
md5                         = require 'md5'
ipc                         = require('electron').ipcRenderer
path                        = require 'path'
React                       = require 'react'
ReactDOM                    = require 'react-dom'
moment                      = require 'moment'
Promise                     = require 'bluebird'
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
SettingsBag                 = require './SettingsBag'

require 'moment-duration-format'

_tabScopeNames = [
  KeyboardNameSpaceConstants.PLAYLIST_BROWSER,
  KeyboardNameSpaceConstants.FILE_BROWSER,
  KeyboardNameSpaceConstants.SETTINGS
]

module.exports = class Playa
  constructor: (options) ->
    @settings = {}
    @settings.config = new SettingsBag
      readOnly: true
      data:     require './config/appConfig'

    @settings.common = new SettingsBag
      readOnly: true
      data:
        userDataFolder:     options.userDataFolder
        fileBrowserRoot:    path.join process.env.HOME, 'Downloads'
        playlistRoot:       path.join options.userDataFolder, @getSetting 'config', 'playlistFolderName'
        fileExtensions:     ['mp3', 'm4a', 'flac', 'ogg']
        playlistExtension:  '.yml'
        useragent:          "playa/v#{@getSetting 'config', 'version'}"
        scrobbleThreshold:
          percent:  0.5
          absolute: 4 * 60
        storeFolders:
          covers:     @getSetting 'config', 'coverFolderName'
          waveforms:  @getSetting 'config', 'waveformFolderName'
          playlists:  @getSetting 'config', 'playlistFolderName'

    @settings.session = new SettingsBag
      data: options.sessionInfo.data
      path: options.sessionInfo.path

    @settings.ui = new SettingsBag
      readOnly: true
      data:
        breakpoints:
          widescreen: '1500px'
          widefont:   '1700px'
        baseFontSize:
          normal: 14
          wide:   16

    @settings.user = new SettingsBag
      path: path.join options.userDataFolder, 'user_settings.json'

    @settings.user.load()
    if !@settings.user.get 'fileBrowserRoot'
      @settings.user.set 'fileBrowserRoot', path.join process.env.HOME, 'Downloads'

    ['discogs', 'lastfm'].forEach (x) =>
      @settings[x] = new SettingsBag
        readOnly: true
        path:     path.join __dirname, '..',  'settings', "#{x}.json"
      @settings[x].load()

    @fileBrowser = new FileBrowser()

    @fileTree = new FileTree
      fileBrowser:  @fileBrowser
      rootFolder:   @getSetting 'user', 'fileBrowserRoot'
      rootName:     path.basename @getSetting 'user', 'fileBrowserRoot'
      filter:       'directory'

    @playlistTree = new FileTree
      fileBrowser:  @fileBrowser
      rootFolder:   @getSetting 'common', 'playlistRoot'
      rootName:     @getSetting('common', 'storeFolders').playlists
      filter:       @getSetting 'common', 'playlistExtension'

    @playlistLoader = new PlaylistLoader
      root:               @getSetting 'common', 'playlistRoot'
      playlistExtension:  @getSetting 'common', 'playlistExtension'

    @mediaFileLoader = new MediaFileLoader
      fileExtensions: @getSetting 'common', 'fileExtensions'

    @coverLoader = new CoverLoader
      root: path.join options.userDataFolder, @getSetting('common', 'storeFolders').covers
      discogs:
        key:      @getSetting 'discogs', 'DISCOGS_KEY'
        secret:   @getSetting 'discogs', 'DISCOGS_SECRET'
        throttle: 1000

    @waveformLoader = new WaveformLoader
      root: path.join options.userDataFolder, @getSetting('common', 'storeFolders').waveforms
      config:
        'wait'              : 300,
        'png-width'         : 1600,
        'png-height'        : 160,
        'png-color-bg'      : '00000000',
        'png-color-center'  : '505050FF',
        'png-color-outer'   : '505050FF'

    @openPlaylistManager = new OpenPlaylistManager
      loader:           @playlistLoader
      mediaFileLoader:  @mediaFileLoader

    @lastFMClient = new LastFMClient
      scrobbleEnabled:  @getSetting 'user', 'scrobbleEnabled'
      key:              @getSetting 'lastfm', 'LASTFM_KEY'
      secret:           @getSetting 'lastfm', 'LASTFM_SECRET'
      useragent:        @getSetting 'common', 'useragent'
      sessionInfo:      @getSetting 'session', 'lastFMSession'

    @player = new Player
      mediaFileLoader: @mediaFileLoader
      resolution: 1000
      scrobbleThreshold: @getSetting 'common', 'scrobbleThreshold'

  init: ->
    @firstPlaylistLoad = false
    @ensureFolders _.map @getSetting('common', 'storeFolders'), (value, key) -> value

    @lastFMClient.on 'signout', =>
      console.info 'LastFM signout'
      @saveSetting 'session', 'lastFMSession', null

    @lastFMClient.on 'authorised', (options = {}) =>
      console.info 'LastFM authorisation succesful', @lastFMClient.session
      @saveSetting 'session', 'lastFMSession',
        key:  @lastFMClient.session.key
        user: @lastFMClient.session.user

    @lastFMClient.on 'scrobbledTrack', (track) =>
      console.info 'LastFM scrobbled:', track

    @player.on 'trackChange', ->
      PlayerStore.emitChange()

    @player.on 'nowplaying', ->
      playbackInfo = PlayerStore.getPlaybackInfo()
      selectedPlaylist = OpenPlaylistStore.getSelectedPlaylist()

      if (selectedPlaylist.lastPlayedAlbumId != playbackInfo.currentAlbum.id) or (selectedPlaylist.lastPlayedTrackId != playbackInfo.currentTrack.id)
        selectedPlaylist.lastPlayedAlbumId = playbackInfo.currentAlbum.id
        selectedPlaylist.lastPlayedTrackId = playbackInfo.currentTrack.id
        OpenPlaylistActions.savePlaylist()
      PlayerStore.emitChange()

    @player.on 'playerTick', ->
      PlayerStore.emitChange()

    @player.on 'scrobbleTrack', (track, after) =>
      if @getSetting 'user', 'scrobbleEnabled' then @lastFMClient.scrobble(track, after)

    OpenPlaylistStore.addChangeListener @_onOpenPlaylistChange
    PlayerStore.addChangeListener @_onPlayerChange

    @initIPC()
    @initRemote()
    @loadPlaylists()

  loadPlaylists: =>
    playlists = []
    if @getSetting 'session', 'openPlaylists'
      playlists = @getSetting 'session', 'openPlaylists'
        .filter (file) ->
          fsPlus.existsSync(file)
        .map (file) ->
          new AlbumPlaylist
            id:   md5(file)
            path: file

    if playlists.length == 0
      playlists.push new AlbumPlaylist
        title:  'Untitled'
        id: md5 "Untitled#{@getSetting 'common', 'playlistExtension'}"

    AppDispatcher.dispatch
      actionType: OpenPlaylistConstants.ADD_PLAYLIST
      playlists:  playlists
      params:
        silent:   true

    AppDispatcher.dispatch
      actionType: OpenPlaylistConstants.SELECT_PLAYLIST_BY_ID
      id:         @getSetting 'session', 'selectedPlaylist'

  loadSidebarPlaylists: =>
    AppDispatcher.dispatch
      actionType: PlaylistBrowserConstants.LOAD_PLAYLIST_ROOT
      folder:     @getSetting 'session', 'playlistRoot'

  loadSidebarFileBrowser: =>
    AppDispatcher.dispatch
      actionType: FileBrowserConstants.LOAD_FILEBROWSER_ROOT
      folder:     @getSetting 'user', 'fileBrowserRoot'

  selectTab: (tab, tabScopeName) =>
    AppDispatcher.dispatch
      actionType: SidebarConstants.SELECT_TAB
      tab:        tab

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

  initRemote: =>
    if @getSetting 'user', 'allowRemote'
      ipc.send 'remote:start', playa: @

  initIPC: ->
    ipc.on 'sidebar:show', (event, tabName) =>
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
        actionType: PlayerConstants.PREV_TRACK

    ipc.on 'playback:next', ->
      AppDispatcher.dispatch
        actionType: PlayerConstants.NEXT_TRACK

    ipc.on 'playback:toggle', =>
      AppDispatcher.dispatch
        actionType: if @player.playing then PlayerConstants.PAUSE else PlayerConstants.PLAY

    ipc.on 'playback:seek', (event, params) ->
      AppDispatcher.dispatch
        actionType: PlayerConstants.SEEK
        to: params.seekTo

    ipc.on 'sidebar:toggle', =>
      @toggleSidebar()

    ipc.on 'playlist:create', =>
      playlist = new AlbumPlaylist title: 'Untitled', id: md5 "Untitled#{@getSetting 'common', 'playlistExtension'}"
      AppDispatcher.dispatch
        actionType: OpenPlaylistConstants.ADD_PLAYLIST
        playlists:  [ playlist ]
        silent:     true
      AppDispatcher.dispatch
        actionType: OpenPlaylistConstants.SELECT_PLAYLIST_BY_ID
        playlists:  [ playlist ]
        id:         playlist.id

    ipc.on 'playlist:save', ->
      AppDispatcher.dispatch
        actionType: OpenPlaylistConstants.SAVE_PLAYLIST

    ipc.on 'playlist:reload', ->
      AppDispatcher.dispatch
        actionType: OpenPlaylistConstants.RELOAD_PLAYLIST

    ipc.on 'playlist:close', ->
      AppDispatcher.dispatch
        actionType: OpenPlaylistConstants.CLOSE_PLAYLIST

    ipc.on 'playlist:gotoAlbum', (event, message) =>
      selectedPlaylist  = @openPlaylistManager.getSelectedPlaylist()
      if !selectedPlaylist then return

      selectedAlbum = selectedPlaylist.getAlbumById message.albumId
      if selectedAlbum
        AppDispatcher.dispatch
          actionType: OpenPlaylistConstants.SELECT_ALBUM
          playlist:   selectedPlaylist
          album:      selectedAlbum
          trackId:    selectedAlbum.tracks[0].id
          play:       true

    ipc.on 'playlist:gotoTrack', (event, message) =>
      selectedPlaylist  = @openPlaylistManager.getSelectedPlaylist()
      if !selectedPlaylist then return

      selectedAlbum = selectedPlaylist.getAlbumById message.albumId
      if selectedAlbum
        AppDispatcher.dispatch
          actionType: OpenPlaylistConstants.SELECT_ALBUM
          playlist:   selectedPlaylist
          album:      selectedAlbum
          trackId:    message.trackId
          play:       true

    ipc.on 'open:folder', (event, folder)->
      AppDispatcher.dispatch
        actionType: OpenPlaylistConstants.ADD_FOLDER
        folder:     folder

  render: ->
    ReactDOM.render React.createElement(Main, @settings.ui.all()), document.getElementById('main')
    @postRender()

  postRender: =>
    console.info "Welcome to Playa v#{@getSetting 'config', 'version'}"
    AppDispatcher.dispatch
      actionType: KeyboardFocusConstants.REQUEST_FOCUS
      scopeName:  KeyboardNameSpaceConstants.ALBUM_PLAYLIST

  saveSetting: (domain, key, value) =>
    if domain is 'session' then return @_saveSessionSetting key, value
    if not target = @settings[domain] then return
    target.set key, value
      .save()

  getSetting: (domain, key) =>
    if target = @settings[domain] then return target.get key

  ensureFolders: (folders = []) =>
    folders.forEach (f)=>
      fs.ensureDirSync path.join @getSetting('common', 'userDataFolder'), f

  _saveSessionSetting: (key, value) =>
    ipc.send 'session:save', key: key, value: value

  _onOpenPlaylistChange: =>
    playlists         = @openPlaylistManager.getAll()
    playlistPaths     = playlists.filter((i) -> !i.isNew() ).map (i) -> i.path
    selectedPlaylist  = @openPlaylistManager.getSelectedPlaylist()

    if selectedPlaylist
      @saveSetting 'session', 'selectedPlaylist', selectedPlaylist.id
      AppDispatcher.dispatch
        actionType: KeyboardFocusConstants.REQUEST_FOCUS
        scopeName:  KeyboardNameSpaceConstants.ALBUM_PLAYLIST

    if playlistPaths.length then @saveSetting 'session', 'openPlaylists', playlistPaths

    if selectedPlaylist and @getSetting 'user', 'allowRemote'
      serialisedPlaylist = selectedPlaylist.serializeForRemote()
      items = selectedPlaylist.getItems disabled: false
      Promise.settle items.map (album, index) =>
        if album.disabled
          Promise.reject 'Album disabled'
        else
          _album = serialisedPlaylist.albums[index]
          @coverLoader.load(album).then (cover) =>
            _album.cover = path.basename cover
            _album
          .catch (e) =>
            _album.cover = null
            _album
          .finally =>
            _album.tracks = _album.tracks.map (track) =>
              track.formattedDuration = moment.duration(track.duration, 'seconds').format 'mm:ss', trim: false
              track
            _album

      .then (albums) ->
        _albums = albums.filter( (x) -> x.isFulfilled() ).map( (x) -> x.value() )
        serialisedPlaylist.albums = _albums
        ipc.send 'remote:update',
          playlist: serialisedPlaylist

    if !@firstPlaylistLoad and playlists.length > 0 and selectedPlaylist
      @firstPlaylistLoad = true
      selectedAlbum = selectedPlaylist.getLastPlayedAlbum()
      if selectedAlbum
        AppDispatcher.dispatch
          actionType: OpenPlaylistConstants.SELECT_ALBUM
          playlist:   selectedPlaylist
          album:      selectedAlbum
          trackId:    selectedPlaylist.lastPlayedTrackId
          play:       false

  _onPlayerChange: =>
    ipc.send 'remote:update',
      playbackInfo: PlayerStore.getPlaybackInfo remote: true
