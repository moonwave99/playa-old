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
    this.disabled = options.disabled
    if(this.disabled){
      this._artists = []
      return
    }
    this._title = _.find(this.tracks, t => t.metadata.album).metadata.album || '_noalbum'
    this._year = _.find(this.tracks, t => t.metadata.year).metadata.year
    this._artists = _(this.tracks.map( t => t.metadata.artist)).uniq( a => a ? a.toLowerCase() : null ).compact().value()
    this._isCompilation = (this.tracks[0].metadata.albumartist && this.tracks[0].metadata.albumartist.match(/various/i))
      || this._artists.length > _variousArtistThreshold
    this._isSplit = this._artists.length > 1 && !this._isCompilation
    this._isMultiple = _.uniq(this.tracks.map( t => t.getDiscNumber() )).length > 1
  }
  contains(id){
    return this.tracks.map(i => i.id).indexOf(id) > -1
  }
  findById(id){
    return _.findWhere(this.tracks, { id: id })
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
      if(!track.disabled){
        memo.tracks++
        memo.totalTime += track.duration
      }
      return memo
    }, { tracks: 0, totalTime: 0})
  }
  missingTracksCount(){
    return this.tracks.filter( t => t.disabled ).length
  }
  getFolder(){
    return this._folder
  }
  serializeForRemote(){
    return {
      id: this.id,
      disabled: this.disabled,
      title: this.getTitle(),
      artist: this.getArtist(),
      year: this.getYear(),
      tracks: this.tracks.map( x => x.serializeForRemote() )
    }
  }
}
