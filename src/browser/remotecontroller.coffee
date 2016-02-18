_               = require 'lodash'
path            = require 'path'
http            = require 'http'
os              = require 'os'
Promise         = require 'bluebird'
express         = require 'express'
io              = require 'socket.io'
{EventEmitter}  = require 'events'

module.exports =
class RemoteController
  _.extend @prototype, EventEmitter.prototype

  constructor: (options={}) ->
    @started = false
    @defaultPort = 1337
    @port = options.port || @defaultPort
    @data =
      selectedPlaylist: {}
      playlists: []
      playbackInfo: {}
    @serverOpts =
      root: path.join __dirname, '../ui'
    @staticOpts =
      index: 'remote.html'
    @window = options.window
    @coverPath = options.coverPath

  isActive: =>
    @started

  start: ()=>
    @app = @_initExpress()
    @http ||= http.createServer @app
    @io = @_initIO @http

    @http.listen @port, =>
      console.info "Remote control listening at: #{@getAddress()}"

    @started = true

  stop: =>
    @http.close =>
      console.info 'Remote control stopped.'
    @started = false

  #SEE http://stackoverflow.com/a/9542157/1073758
  getAddress: =>
    ifaces = os.networkInterfaces()
    ipAddress = ''
    Object.keys ifaces
      .forEach (ifname) ->
        addresses = ifaces[ifname]
          .filter (iface) -> 'IPv4' == iface.family && !iface.internal
          .map (x) -> x.address
        if addresses.length then ipAddress = addresses[0]
    "http://#{ipAddress}:#{@port}"

  update: (data) =>
    Object.keys(@data).forEach (key) =>
      if data[key]
        @data[key] = data[key]
        @io.sockets.emit key, @data[key]

  _initIO: (server) =>
    if @io then @io else
      socketIO = io server
      socketIO.on 'connection', (socket) =>
        console.log 'New incoming connection'
        Object.keys(@data).forEach (key) =>
          socket.emit key, @data[key]
        socket.on 'control:playback', (data) =>
          switch data.action
            when 'toggle' then @window.togglePlayback()
            when 'prev' then @window.prevTrack()
            when 'next' then @window.nextTrack()
            when 'gotoAlbum' then @window.gotoAlbum data
            when 'gotoTrack' then @window.gotoTrack data
            when 'seekTo' then @window.seekTo data
            when 'selectPlaylist' then @window.selectPlaylist data
      socketIO

  _initExpress: =>
    if @app then @app
    else
      app = require('express')()
      app.use express.static @serverOpts.root, @staticOpts
      app.get '/', (req, res) =>
        res.sendFile 'remote.html', @serverOpts
      app.get '/js/:file(*)', (req, res) =>
        res.sendFile path.resolve __dirname, '../../node_modules/', req.params.file
      app.get '/covers/:cover', (req, res) =>
        res.sendFile path.resolve @coverPath, req.params.cover
      app
