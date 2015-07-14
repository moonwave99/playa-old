fs = require 'fs-plus'
app = require 'app'

module.exports =
class SessionSettings
  constructor: (options) ->
    @path = options.path
    @data = {}
  load: ->
    @data = JSON.parse(fs.readFileSync @path, 'utf-8' ) if fs.existsSync @path
  save: ->
    fs.writeFileSync @path, JSON.stringify(@data)
  set: (key, value) ->
    @data[key] = value
    @
  get: (key) ->
    @data[key]
  all: ->
    @data
