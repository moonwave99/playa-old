"use babel"

var _ = require('lodash')
var path = require('path')

module.exports = class Album{
  constructor(options){
    this.id = options.id
    this.title = options.title
    this.tracks = options.tracks || []
  }
  contains(id){
    return _(this.tracks).map(i => i.id).contains(id);
  }
  isCompilation(){
    return this.tracks[0].metadata.albumartist && this.tracks[0].metadata.albumartist.match(/various/i)
  }
  getTitle(){
    return this.tracks[0].metadata.album || '_noalbum'
  }
  getArtist(){
    return this.isCompilation() ? 'Various Artists' : this.tracks[0].metadata.artist
  }
  getYear(){
    return this.tracks[0].metadata.year
  }
  getFolder(){
    return this.tracks.length && path.dirname(this.tracks[0].filename)
  }
}