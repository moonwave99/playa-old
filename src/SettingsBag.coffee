fs = require 'fs-plus'

module.exports =
class SettingsBag
  constructor: (options) ->
    @path = options.path
    @data = options.data || {}
    @readOnly = !!options.readOnly
  load: ->
    @data = JSON.parse(fs.readFileSync @path, 'utf-8' ) if fs.existsSync @path
  save: ->
    if !@readOnly then fs.writeFileSync @path, JSON.stringify(@data)
  set: (key, value) ->
    if !@readOnly then @data[key] = value
    @
  get: (key) ->
    @data[key]
  all: ->
    @data
