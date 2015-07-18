"use babel"

var _ = require('lodash')
var path = require('path')

var _variousArtistThreshold = 5
var _variousArtistsLabel = 'Various Artists'

module.exports = class Album{
  constructor(options){
    this.id = options.id
    this.tracks = options.tracks || []
    this._folder = this.tracks.length && path.dirname(this.tracks[0].filename)
    this._title = this.tracks[0].metadata.album || '_noalbum'
    this._year = this.tracks[0].metadata.year
    this._artists = _.uniq(this.tracks.map( t => t.metadata.artist), a => a.toLowerCase() )
    this._isCompilation = (this.tracks[0].metadata.albumartist && this.tracks[0].metadata.albumartist.match(/various/i))
      || this._artists.length > _variousArtistThreshold
    this._isSplit = this._artists.length > 1 && !this._isCompilation
    this._isMultiple = _.uniq(this.tracks.map( t => t.metadata.disk.no )).length > 1
  }
  contains(id){
    return _(this.tracks).map(i => i.id).contains(id)
  }
  isCompilation(){
    return this._isCompilation
  }
  isMultiple(){
    return this._isMultiple
  }
  getTitle(){
    return this._title
  }
  getArtistCount(){
    return this._artists.length
  }
  getArtist(){
    return this._isCompilation ? _variousArtistsLabel : this._artists.join(', ')
  }
  getYear(){
    return this._year
  }
  getStats(){
    return _.reduce(this.tracks, (memo, track)=>{
      memo.tracks++
      memo.totalTime += track.duration
      return memo
    }, { tracks: 0, totalTime: 0})
  }
  getFolder(){
    return this._folder
  }
}
