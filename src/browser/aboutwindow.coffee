{app, BrowserWindow} = require 'electron'
fs = require 'fs'
ipc = require('electron').ipcMain
path = require 'path'
os = require 'os'
net = require 'net'
url = require 'url'

{EventEmitter} = require 'events'
_ = require 'underscore-plus'

module.exports =
class AboutWindow
  _.extend @prototype, EventEmitter.prototype

  constructor: (options) ->
    windowOpts =
      width: 400
      height: 400
      x: 100
      y: 100
      title: ''
      resizable: false
      'web-preferences':
        'subpixel-font-scaling': true
    @window = new BrowserWindow(windowOpts)

  show: ->
    targetUrl = url.format
      protocol: 'file'
      pathname: path.resolve __dirname, '..', '..', 'src', 'ui', 'about.html'
      slashes: true

    @window.loadURL targetUrl
    @window.show()
