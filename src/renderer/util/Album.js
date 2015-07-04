"use babel"

var path = require('path')

module.exports = class Album{
  constructor(options){
    this.id = options.id
    this.title = options.title
    this.tracks = options.tracks || []
  }
  getFolder(){
    return this.tracks.length && path.dirname(this.tracks[0].filename)
  }
}