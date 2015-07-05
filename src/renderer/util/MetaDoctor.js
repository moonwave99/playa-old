"use babel";

var _ = require('lodash')
var moment = require('moment')

var MetaDoctor = {
  normalise(metadata){
    return _.reduce(metadata, (memo, value, key)=>{
      switch(key = key.toLowerCase()){
        case 'track':
          memo[key] = parseInt(value.split('/')[0]) || 0
          break
        case 'date':
          memo[key] = moment(new Date(value.match(/\d{4}/)[0])).format('YYYY')
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