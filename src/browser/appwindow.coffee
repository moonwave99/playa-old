Menu = require 'menu'
app = require 'app'
fs = require 'fs'
ipc = require('electron').ipcMain
path = require 'path'
os = require 'os'
net = require 'net'
url = require 'url'
dialog = require 'dialog'

{EventEmitter} = require 'events'
BrowserWindow = require 'browser-window'
_ = require 'underscore-plus'

mediaControlMap =
  MediaPlayPause:     'playback:toggle'
  MediaNextTrack:     'playback:next'
  MediaPreviousTrack: 'playback:prev'

module.exports =
class AppWindow
  _.extend @prototype, EventEmitter.prototype

  constructor: (options) ->
    @loadSettings =
      bootstrapScript: require.resolve '../renderer/main'

    @loadSettings = _.extend(@loadSettings, options)

    lastWindowState = @loadSettings.sessionSettings.get('lastWindowState') || {}

    windowOpts =
      width: lastWindowState.width || 1024
      height: lastWindowState.height || 768
      x: lastWindowState.x
      y: lastWindowState.y
      transparent: true
      frame: false
      title: options.title ? "You Should Set options.title"
      'web-preferences':
        'subpixel-font-scaling': true
        'direct-write': true

    windowOpts = _.extend(windowOpts, @loadSettings)

    @window = new BrowserWindow(windowOpts)

    @window.maximize() if lastWindowState.maximized

    @window.on 'close', (e) =>
      bounds = @window.getBounds()
      @loadSettings.sessionSettings.set "lastWindowState",
         x: bounds.x,
         y: bounds.y,
         width: bounds.width,
         height: bounds.height,
         maximized: @window.isMaximized()
      @loadSettings.sessionSettings.save()

    @window.on 'closed', (e) =>
      this.emit 'closed', e

    @window.on 'devtools-opened', (e) =>
      @window.webContents.send 'window:toggle-dev-tools', true

    @window.on 'devtools-closed', (e) =>
      @window.webContents.send 'window:toggle-dev-tools', false

  show: ->
    targetPath = path.resolve __dirname, '..', '..', 'src', 'ui', 'index.html'
    targetUrl = url.format
      protocol: 'file'
      pathname: targetPath
      slashes: true
      query: {loadSettings: JSON.stringify(@loadSettings)}

    @window.loadUrl targetUrl
    @window.show()

  openFolder: ->
    folder = dialog.showOpenDialog({ properties: ['openDirectory'], title: 'Open folder' })
    @window.webContents.send('open:folder', folder[0]) if folder

  prevTrack: ->
    @window.webContents.send('playback:prev')

  nextTrack: ->
    @window.webContents.send('playback:next')

  togglePlayback: ->
    @window.webContents.send('playback:toggle')

  createPlaylist: ->
    @window.webContents.send('playlist:create')

  savePlaylist: ->
    @window.webContents.send('playlist:save')

  reloadPlaylist: ->
    @window.webContents.send('playlist:reload')

  closePlaylist: ->
    @window.webContents.send('playlist:close')

  toggleViewMode: ->
    @window.webContents.send('playlist:toggleViewMode')

  showSettings: ->
    @window.webContents.send('sidebar:show', 'settings')

  showPlaylists: ->
    @window.webContents.send('sidebar:show', 'playlists')

  showFileBrowser: ->
    @window.webContents.send('sidebar:show', 'files')

  togglePlaylistInfo: ->
    @window.webContents.send('playlist:toggleInfo')

  toggleSidebar: ->
    @window.webContents.send('sidebar:toggle')

  sendMediaControl: (mediaControl)->
    @window.webContents.send mediaControlMap[mediaControl]

  reload: ->
    @window.webContents.reload()

  toggleFullScreen: ->
    @window.setFullScreen(not @window.isFullScreen())

  toggleDevTools: ->
    @window.toggleDevTools()

  close: ->
    @window.close()
    @window = null
