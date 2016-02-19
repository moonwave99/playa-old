BrowserWindow = require 'browser-window'
app = require 'app'
Menu = require 'menu'
fs = require 'fs-plus'
ipc = require('electron').ipcMain
path = require 'path'
os = require 'os'
net = require 'net'
url = require 'url'
dialog = require 'dialog'
globalShortcut = require('electron').globalShortcut

{EventEmitter} = require 'events'
_ = require 'underscore-plus'
{spawn} = require 'child_process'

AppMenu = require './appmenu'
AppWindow = require './appwindow'
AboutWindow = require './aboutwindow'
SettingsBag = require '../SettingsBag'
RemoteController = require './remotecontroller'

module.exports =
class Application
  _.extend @prototype, EventEmitter.prototype

  constructor: (options) ->
    {@resourcePath, @devMode } = options

    global.application = this

    @pkgJson = require '../../package.json'
    @windows = []
    @configSettings = new SettingsBag
      data: require '../config/appConfig.js'
      readOnly: true

    @sessionSettings = new SettingsBag
      path: path.join app.getPath('userData'), 'session_settings.json'
    @sessionSettings.load()
    options.sessionSettings = @sessionSettings

    @registerGlobalShortcuts()

    app.on 'window-all-closed', ->
      app.quit() if process.platform in ['win32', 'linux']

    app.on 'will-quit', =>
      console.log 'Unregistering all global shortcuts...'
      globalShortcut.unregisterAll()
      if @remote.isActive() then @remote.stop()

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
    @initRemoteController newWindow
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

    @menu.on 'application:about', =>
      @openAboutWindow()

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

    @menu.on 'window:reloadPlaylist', ->
      appWindow.reloadPlaylist()

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

    @menu.on 'window:togglePlaylistInfo', ->
      appWindow.togglePlaylistInfo()

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

    @menu.on 'window:hide', ->
      Menu.sendActionToFirstResponder 'hide:'

    @menu.on 'application:run-specs', =>
      @openWithOptions(test: true)

    ipc.on 'request:save:dialog', (event, params) ->
      params||={}
      event.returnValue = dialog.showSaveDialog(params) || false

    ipc.on 'request:open:dialog', (event, params) ->
      params||={}
      event.returnValue = dialog.showOpenDialog(params) || false

    ipc.on 'request:app:path', (event, params) =>
      event.returnValue = app.getPath params.key

    ipc.on 'request:session:settings', (event) =>
      event.returnValue = @sessionSettings

    ipc.on 'session:save', (event, params) =>
      @sessionSettings.set params.key, params.value
      @sessionSettings.save()

    ipc.on 'remote:start', (event) =>
      if !@remote.isActive() then @remote.start()
      event.returnValue = true

    ipc.on 'remote:stop', (event, params) =>
      if @remote.isActive() then @remote.stop()
      event.returnValue = true

    ipc.on 'remote:getAddress', (event, params) =>
      event.returnValue = @remote.getAddress()

    ipc.on 'remote:isActive', (event, params) =>
      event.returnValue = @remote.isActive()

    ipc.on 'remote:update', (event, params) =>
      @remote.update params

    appWindow

  # Removes the given window from the list of windows, so it can be GC'd.
  #
  # options -
  #   :appWindow - The {AppWindow} to be removed.
  removeAppWindow: (appWindow) =>
    @windows.splice(idx, 1) for w, idx in @windows when w is appWindow

  # Registers global media shortcuts.
  registerGlobalShortcuts: =>
    ['MediaPlayPause', 'MediaNextTrack', 'MediaPreviousTrack'].forEach (shortcut) =>
      globalShortcut.register shortcut, =>
        @windows[0].sendMediaControl shortcut

  # Opens about window.
  openAboutWindow: =>
    @aboutwindow = new AboutWindow
    @aboutwindow.show()

  # Inits remote controller instance
  initRemoteController: (appWindow) =>
    @remote = new RemoteController
      window: appWindow
      coverPath: path.join app.getPath('userData'), @configSettings.get 'coverFolderName'
