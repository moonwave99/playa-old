Menu = require 'menu'
BrowserWindow = require 'browser-window'
app = require 'app'
fs = require 'fs-plus'
ipc = require 'ipc'
path = require 'path'
os = require 'os'
net = require 'net'
url = require 'url'
dialog = require 'dialog'

{EventEmitter} = require 'events'
_ = require 'underscore-plus'
{spawn} = require 'child_process'

AppMenu = require './appmenu'
AppWindow = require './appwindow'
SessionSettings = require './session_settings'

module.exports =
class Application
  _.extend @prototype, EventEmitter.prototype

  constructor: (options) ->
    {@resourcePath, @devMode } = options

    global.application = this

    @pkgJson = require '../../package.json'
    @windows = []
    @sessionSettings = new SessionSettings
      path: path.join app.getPath('userData'), 'session_settings.json'
    @sessionSettings.load()
    options.sessionSettings = @sessionSettings

    app.on 'window-all-closed', ->
      app.quit() if process.platform in ['win32', 'linux']

    @openWithOptions(options)

  # Opens a new window based on the options provided.
  #
  # options -
  #   :resourcePath - The path to include specs from.
  #   :devMode - Boolean to determine if the application is running in dev mode.
  #   :test - Boolean to determine if the application is running in test mode.
  #   :exitWhenDone - Boolean to determine whether to automatically exit.
  #   :logfile - The file path to log output to.
  openWithOptions: (options) ->
    {test} = options

    if test
      newWindow = @openSpecsWindow(options)
    else
      newWindow = @openWindow(options)

    newWindow.show()
    @windows.push(newWindow)
    newWindow.on 'closed', =>
      @removeAppWindow(newWindow)

  # Opens up a new {AtomWindow} to run specs within.
  #
  # options -
  #   :exitWhenDone - Boolean to determine whether to automatically exit.
  #   :resourcePath - The path to include specs from.
  #   :logfile - The file path to log output to.
  openSpecsWindow: ({exitWhenDone, resourcePath, logFile}) ->
    if resourcePath isnt @resourcePath and not fs.existsSync(resourcePath)
      resourcePath = @resourcePath

    try
      bootstrapScript = require.resolve(path.resolve(resourcePath, 'spec', 'spec-bootstrap'))
    catch error
      bootstrapScript = require.resolve(path.resolve(__dirname, '..', '..', 'spec', 'spec-bootstrap'))

    isSpec = true
    devMode = true
    new AppWindow({bootstrapScript, exitWhenDone, resourcePath, isSpec, devMode, logFile})

  # Opens up a new {AppWindow} and runs the application.
  #
  # options -
  #   :resourcePath - The path to include specs from.
  #   :devMode - Boolean to determine if the application is running in dev mode.
  #   :test - Boolean to determine if the application is running in test mode.
  #   :exitWhenDone - Boolean to determine whether to automatically exit.
  #   :logfile - The file path to log output to.
  openWindow: (options) ->
    appWindow = new AppWindow(options)
    @menu = new AppMenu(pkg: @pkgJson)

    @menu.attachToWindow(appWindow)

    @menu.on 'application:quit', -> app.quit()

    @menu.on 'application:show-settings', ->
      appWindow.showSettings()

    @menu.on 'window:open', ->
      appWindow.openFolder()

    @menu.on 'window:prevTrack', ->
      appWindow.prevTrack()

    @menu.on 'window:nextTrack', ->
      appWindow.nextTrack()

    @menu.on 'window:togglePlayback', ->
      appWindow.togglePlayback()

    @menu.on 'window:createPlaylist', ->
      appWindow.createPlaylist()

    @menu.on 'window:savePlaylist', ->
      appWindow.savePlaylist()

    @menu.on 'window:closePlaylist', ->
      appWindow.closePlaylist()

    @menu.on 'window:toggleViewMode', ->
      appWindow.toggleViewMode()

    @menu.on 'window:showFileBrowser', ->
      appWindow.showFileBrowser()

    @menu.on 'window:showPlaylists', ->
      appWindow.showPlaylists()

    @menu.on 'window:toggleSidebar', ->
      appWindow.toggleSidebar()

    @menu.on 'window:reload', ->
      BrowserWindow.getFocusedWindow().reload()

    @menu.on 'window:toggle-full-screen', ->
      focusedWindow = BrowserWindow.getFocusedWindow()
      fullScreen = true
      if focusedWindow.isFullScreen()
        fullScreen = false

      focusedWindow.setFullScreen(fullScreen)

    @menu.on 'window:toggle-dev-tools', ->
      BrowserWindow.getFocusedWindow().toggleDevTools()

    @menu.on 'application:run-specs', =>
      @openWithOptions(test: true)

    ipc.on 'request:save:dialog', (event, params) ->
      params||={}
      event.returnValue = dialog.showSaveDialog(params)

    ipc.on 'request:app:path', (event, params) =>
      event.returnValue = app.getPath params.key

    ipc.on 'request:session:settings', (event, params) =>
      params||={}
      event.returnValue = if params.key then @sessionSettings.get(params.key) or false else @sessionSettings.all()

    ipc.on 'session:save', (event, params) =>
      @sessionSettings.set params.key, params.value
      @sessionSettings.save()

    appWindow

  # Removes the given window from the list of windows, so it can be GC'd.
  #
  # options -
  #   :appWindow - The {AppWindow} to be removed.
  removeAppWindow: (appWindow) =>
    @windows.splice(idx, 1) for w, idx in @windows when w is appWindow
