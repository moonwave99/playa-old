"use babel"

var _ = require('lodash')
var Promise = require('bluebird')
var fs = Promise.promisifyAll(require('fs-extra'))
var ipc = require('ipc')
var md5 = require('MD5')
var path = require('path')
var groove = require('groove')
var glob = Promise.promisifyAll(require('glob'))

var AlbumPlaylist = require('./AlbumPlaylist')

module.exports = class PlaylistLoader {
  constructor(options) {
    this.root = options.root
    this.playlistExtension = options.playlistExtension
    this.treeCache = []
  }
  parseM3U(m3UPath){
    return fs.readFileAsync(m3UPath, 'utf8').bind(this).then((data)=>{
      return data.split('\n')
    }).catch((err)=>{
      console.error(err.stack)
    })
  }
  loadTree(){
    return new Promise((resolve, reject)=>{
      if(this.treeCache.length){
        resolve(this.treeCache)
      }else{
        glob.callAsync(this, path.join(this.root, '**', '*.' + this.playlistExtension)).bind(this).then((files)=>{
          this.treeCache = files.map( file => new AlbumPlaylist({
            id: md5(file),
            path: file,
            title: path.basename(file, '.' + this.playlistExtension)
          }) )
          resolve(this.treeCache)
        }).catch(reject)
      }
    })
  }
  load(playlist) {
    return new Promise((resolve, reject)=>{
      if(playlist.isNew()){
        resolve(playlist)
      }else{
        resolve(this.parseM3U(playlist.path).then((files)=>{
          return playlist.load(files)
        }))
      }
    })
  }
  save(playlist){
    var targetPath
    if(playlist.isNew()){
      targetPath = ipc.sendSync('request:save:dialog', {
        title: 'Save Playlist as',
        defaultPath: this.root,
        filters: [
          { name: 'Playlist files', extensions: [this.playlistExtension] }
        ]
      })
    }else{
      targetPath = path.join(this.root, playlist.title + '.' + this.playlistExtension)
    }

    return fs.outputFileAsync(
      targetPath,
      playlist.getFileList().join("\n")
    ).then(()=>{
      playlist.path = targetPath
    })
  }
}
