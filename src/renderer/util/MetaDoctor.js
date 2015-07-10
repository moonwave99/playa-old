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
            value = value.join(', ')
          }
          memo[key] = value
          break
        case 'track':
          memo[key] = value.no
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
  }  
}

module.exports = MetaDoctor