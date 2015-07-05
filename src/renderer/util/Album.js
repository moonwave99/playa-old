"use babel"

var path = require('path')

module.exports = class Album{
  constructor(options){
    this.id = options.id
    this.title = options.title
    this.tracks = options.tracks || []
  }
  isCompilation(){
    return this.tracks[0].metadata.album_artist && this.tracks[0].metadata.album_artist.match(/various/i)
  }
  getArtist(){
    return this.isCompilation() ? 'Various Artists' : this.tracks[0].metadata.artist
  }
  getFolder(){
    return this.tracks.length && path.dirname(this.tracks[0].filename)
  }
}