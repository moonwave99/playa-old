"use babel"

var MetaDoctor = require('./MetaDoctor')
var md5 = require('MD5')

module.exports = class PlayerCache {
  constructor(options) {
    this.cache = {}
  }
  compute(file, hash) {
    this.cache[hash] = {
      metadata: MetaDoctor.normalise(file.metadata()),
      duration: file.duration(),
      id: hash
    }
  }
  get(file) {
    var hash = md5(file.filename)
    if(!this.cache[hash]){
      this.compute(file, hash)
    }
    return this.cache[hash]
  }
}