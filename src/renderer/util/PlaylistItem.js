"use babel"

var groove = require('groove')
var PlaylistItem = require('./PlaylistItem')

module.exports = class PlaylistItem{
  constructor(options){
    this.id = options.id
    this.metadata = options.metadata
    this.duration = options.duration
    this.grooveFile = options.grooveFile
  }
}