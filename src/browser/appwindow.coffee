Menu = require 'menu'
app = require 'app'
fs = require 'fs'
ipc = require 'ipc'
path = require 'path'
os = require 'os'
net = require 'net'
url = require 'url'
dialog = require 'dialog'

{EventEmitter} = require 'events'
BrowserWindow = require 'browser-window'
_ = require 'underscore-plus'

module.exports =
class AppWindow
  _.extend @prototype, EventEmitter.prototype

  constructor: (options) ->
    @loadSettings =
      bootstrapScript: require.resolve '../renderer/main'

    @loadSettings = _.extend(@loadSettings, options)

    windowOpts =
      width: 1024
      height: 768
      transparent: true
      frame: false
      title: options.title ? "You Should Set options.title"
      'web-preferences':
        'subpixel-font-scaling': true
        'direct-write': true

    windowOpts = _.extend(windowOpts, @loadSettings)

    @window = new BrowserWindow(windowOpts)

    @window.on 'closed', (e) =>
      this.emit 'closed', e

    @window.on 'devtools-opened', (e) =>
      @window.webContents.send 'window:toggle-dev-tools', true

    @window.on 'devtools-closed', (e) =>
      @window.webContents.send 'window:toggle-dev-tools', false

  show: ->
    targetPath = path.resolve(__dirname, '..', '..', 'static', 'index.html')

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
        
  closePlaylist: ->
    @window.webContents.send('playlist:close')
    
  clearPlaylist: ->
    @window.webContents.send('playlist:clear')

  toggleSidebar: ->
    @window.webContents.send('sidebar:toggle')
    
  reload: ->
    @window.webContents.reload()

  toggleFullScreen: ->
    @window.setFullScreen(not @window.isFullScreen())

  toggleDevTools: ->
    @window.toggleDevTools()

  close: ->
    @window.close()
    @window = null
