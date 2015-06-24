ipc               = require 'ipc'
React             = require 'react'
Main              = require './renderer/components/Main.jsx'
Player            = require './renderer/util/Player'
Loader            = require './renderer/util/Loader'
AppDispatcher     = require './renderer/dispatcher/AppDispatcher'
PlayerConstants   = require './renderer/constants/PlayerConstants'
PlaylistConstants = require './renderer/constants/PlaylistConstants'
PlayerStore       = require './renderer/stores/PlayerStore'
PlaylistStore     = require './renderer/stores/PlaylistStore'
SidebarStore      = require './renderer/stores/SidebarStore'
PlaylistActions   = require './renderer/actions/PlaylistActions'

module.exports = class Playa
  constructor: () ->
    @loader = new Loader()
    @player = new Player()
    @player.loader = @loader
    
    @player.on 'nowplaying', ->
      PlayerStore.emitChange()

    @player.on 'playerTick', ->
      PlayerStore.emitChange()

    @initIPC()
    @loadPlaylists()

  loadPlaylists: ->
    PlaylistActions.create()
    PlaylistActions.select(0)
    PlaylistActions.activate(0)
    
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
        actionType: PlaylistConstants.CREATE
        
    ipc.on 'playlist:clear', ->
      AppDispatcher.dispatch
        actionType: PlaylistConstants.CLEAR_PLAYLIST        
        
    ipc.on 'playlist:close', ->
      AppDispatcher.dispatch
        actionType: PlaylistConstants.CLOSE_PLAYLIST
        
    ipc.on 'open:folder', (folder)->
      AppDispatcher.dispatch
        actionType: PlaylistConstants.ADD_FOLDER
        folder: folder
        
    ipc.on 'playlist:toggleViewMode', ->
      selectedPlaylist = PlaylistStore.getSelectedPlaylist()
      if !selectedPlaylist then return
        
      AppDispatcher.dispatch
        actionType: PlaylistConstants.UPDATE_UI,
        id: selectedPlaylist.id,
        ui:
          displayMode: if selectedPlaylist.displayMode == 'table' then 'albums' else 'table'
        
  render: ->
    React.render React.createElement(Main), document.getElementById('main')