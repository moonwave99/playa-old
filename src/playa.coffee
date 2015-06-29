md5                       = require 'md5'
ipc                       = require 'ipc'
React                     = require 'react'
Main                      = require './renderer/components/Main.jsx'
Playlist                  = require './renderer/util/Playlist'
Player                    = require './renderer/util/Player'
PlaylistLoader            = require './renderer/util/PlaylistLoader'
FileLoader                = require './renderer/util/FileLoader'
AppDispatcher             = require './renderer/dispatcher/AppDispatcher'
PlayerConstants           = require './renderer/constants/PlayerConstants'
PlaylistBrowserConstants  = require './renderer/constants/PlaylistBrowserConstants'
OpenPlaylistConstants     = require './renderer/constants/OpenPlaylistConstants'
SidebarConstants          = require './renderer/constants/SidebarConstants'
PlayerStore               = require './renderer/stores/PlayerStore'
OpenPlaylistStore         = require './renderer/stores/OpenPlaylistStore'
SidebarStore              = require './renderer/stores/SidebarStore'
OpenPlaylistActions       = require './renderer/actions/OpenPlaylistActions'

module.exports = class Playa
  constructor: () ->
    @playlistLoader = new PlaylistLoader({ root: '/Users/moonwave99/Desktop/_playlists' })
    @fileLoader = new FileLoader()
    @player = new Player()
    @player.fileLoader = @fileLoader
    
    @player.on 'nowplaying', ->
      PlayerStore.emitChange()

    @player.on 'playerTick', ->
      PlayerStore.emitChange()
    
  init: ->
    @initIPC()
    @loadPlaylists()

  loadPlaylists: ->
    @playlistLoader.loadTree().then (tree)=>
      AppDispatcher.dispatch
        actionType: PlaylistBrowserConstants.LOAD_TREE
        tree: tree

    AppDispatcher.dispatch
      actionType: OpenPlaylistConstants.ADD_PLAYLIST
      playlists: [
        new Playlist({
          id: md5('/Users/moonwave99/Desktop/_playlists/slsk.m3u')
          path: '/Users/moonwave99/Desktop/_playlists/slsk.m3u'
          title: 'slsk'
        })
      ]

    AppDispatcher.dispatch
      actionType: OpenPlaylistConstants.SELECT_PLAYLIST
      selected: 0
    
  initIPC: ->
    ipc.on 'playback:prev', ->
      AppDispatcher.dispatch
        actionType: PlayerConstants.PREV

    ipc.on 'playback:next', ->
      AppDispatcher.dispatch
        actionType: PlayerConstants.NEXT

    ipc.on 'playback:toggle', ->
      AppDispatcher.dispatch
        actionType: if @player.playing() then PlayerConstants.PAUSE else PlayerConstants.PLAY
        
    ipc.on 'sidebar:toggle', ->
      AppDispatcher.dispatch
        actionType: SidebarConstants.TOGGLE
        
    ipc.on 'playlist:create', ->
      AppDispatcher.dispatch
        actionType: OpenPlaylistConstants.ADD_PLAYLIST
        playlists: [ new Playlist({ title: 'Untitled' })]
        
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
        
    ipc.on 'playlist:toggleViewMode', ->
      selectedPlaylist = OpenPlaylistStore.getSelectedPlaylist()
      if !selectedPlaylist then return
        
      AppDispatcher.dispatch
        actionType: OpenPlaylistConstants.UPDATE_UI,
        id: selectedPlaylist.id,
        ui:
          displayMode: if selectedPlaylist.displayMode == 'table' then 'albums' else 'table'
        
  render: ->
    React.render React.createElement(Main), document.getElementById('main')