"use babel";

var _ = require('lodash')
var moment = require('moment')

var MetaDoctor = {
  normalise(metadata){
    return _.reduce(metadata, (memo, value, key)=>{
      switch(key = key.toLowerCase()){
        case 'artist':
        case 'albumartist':
          if(_.isArray(value)){
            value = _(value).map(this.normaliseArtist).uniq().value().join(', ')
          }else{
            value = this.normaliseArtist(value)
          }
          memo[key] = value
          break
        case 'track':
          memo[key] = value ? value.no : 0
          break
        case 'year':
        case 'date':
          memo[key] = value ? moment(new Date(value.match(/\d{4}/)[0])).format('YYYY') : '-'
          break
        default:
          memo[key] = value
          break
      }
      return memo
    }, {})
  },
  normaliseArtist(artist){
    return artist.match(/, The$/)
      ? artist = 'The ' + artist.replace(/, The$/, '')
      : artist
  }
}

module.exports = MetaDoctor
