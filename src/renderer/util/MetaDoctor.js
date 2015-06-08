"use babel";

var _ = require('lodash')

var MetaDoctor = {
  normalise(metadata){
    return _.reduce(metadata, (memo, value, key)=>{
      memo[key.toLowerCase()] = value
      return memo
    }, {})
  }  
}

module.exports = MetaDoctor