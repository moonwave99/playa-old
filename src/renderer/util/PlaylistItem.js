"use babel"

var md5 = require('MD5')

module.exports = class PlaylistItem{
  constructor(options){
    this.metadata = options.metadata
    this.duration = options.duration
    this.grooveFile = options.grooveFile
    this.filename = options.filename
    this.id = md5(this.filename)
  }
}