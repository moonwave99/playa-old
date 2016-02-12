_               = require 'lodash'
ipc             = require 'ipc'
path            = require 'path'
http            = require 'http'
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
    @serverOpts =
      root: path.join __dirname, '../ui'

  isActive: =>
    @started

  start: (playa)=>
    @playa = playa
    @app = require('express')()
    @http = http.createServer @app
    @socket = io http
    @app.use express.static @serverOpts.root
    @app.get '/', (req, res) =>
      res.sendFile 'remote.html', @serverOpts

    @http.listen @port, =>
      console.info "Remote control listening at: #{@getAddress()}"

    @started = true

  stop: =>
    @started = false
    @http.close =>
      console.info 'Remote control stopped.'

  getAddress: =>
    "http://192.168.1.3:#{@port}"
