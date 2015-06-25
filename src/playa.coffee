ipc                   = require 'ipc'
React                 = require 'react'
Main                  = require './renderer/components/Main.jsx'
Playlist              = require './renderer/util/Playlist'
Player                = require './renderer/util/Player'
PlaylistLoader        = require './renderer/util/PlaylistLoader'
FileLoader            = require './renderer/util/FileLoader'
AppDispatcher         = require './renderer/dispatcher/AppDispatcher'
PlayerConstants       = require './renderer/constants/PlayerConstants'
OpenPlaylistConstants = require './renderer/constants/OpenPlaylistConstants'
SidebarConstants      = require './renderer/constants/SidebarConstants'
PlayerStore           = require './renderer/stores/PlayerStore'
OpenPlaylistStore     = require './renderer/stores/OpenPlaylistStore'
SidebarStore          = require './renderer/stores/SidebarStore'
OpenPlaylistActions   = require './renderer/actions/OpenPlaylistActions'

module.exports = class Playa
  constructor: () ->
    @playlistLoader = new PlaylistLoader()
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
    OpenPlaylistActions.add([
      new Playlist({
        path: '/Users/moonwave99/Desktop/nu 2014.m3u',
        title: 'Nu [2014]',
        id: 'nu 2014'
      }),
      new Playlist({
        path: '/Users/moonwave99/Desktop/nu 2015.m3u',
        title: 'Nu [2015]',
        id: 'nu 2015'
      })      
    ])
    OpenPlaylistActions.select(0)
    
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
        
    ipc.on 'playlist:clear', ->
      AppDispatcher.dispatch
        actionType: OpenPlaylistConstants.CLEAR_PLAYLIST        
        
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