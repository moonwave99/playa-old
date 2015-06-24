"use babel"

var Promise = require('bluebird')
var fs = Promise.promisifyAll(require('fs-extra'))
var ipc = require('ipc')
var md5 = require('MD5')
var path = require('path')
var groove = require('groove')
var assert = require('assert')
var glob = require('glob')

var Playlist = require('./Playlist')

module.exports = class PlaylistLoader {
  constructor(options) {

  }
  load(folder) {
    
  }
  save(playlist){
    return fs.outputFileAsync(path.join(process.env.HOME, 'Desktop', playlist.id + '.m3u'), playlist.items.map((i)=>{ return i.filename }).join("\n"))
  }
}