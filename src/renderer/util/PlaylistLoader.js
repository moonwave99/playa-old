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
  parseM3U(m3UPath){
    return fs.readFileAsync(m3UPath, 'utf8').bind(this).then((data)=>{
      return data.split('\n')
    }).catch((err)=>{
      console.error(err.stack)
    })
  }  
  load(playlist) {
    return this.parseM3U(playlist.path).then((files)=>{
      return playlist.load(files)
    })
  }
  save(playlist){
    return fs.outputFileAsync(path.join(process.env.HOME, 'Desktop', playlist.id + '.m3u'), playlist.items.map((i)=>{ return i.filename }).join("\n"))
  }
}