"use babel"

var _ = require('lodash')
var Promise = require('bluebird')
var fs = Promise.promisifyAll(require('fs-extra'))
var ipc = require('ipc')
var md5 = require('MD5')
var path = require('path')
var groove = require('groove')
var assert = require('assert')
var glob = Promise.promisifyAll(require('glob'))

var Playlist = require('./Playlist')
var AlbumPlaylist = require('./AlbumPlaylist')

module.exports = class PlaylistLoader {
  constructor(options) {
    this.root = options.root
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
        glob.callAsync(this, path.join(this.root, '**', '*.m3u')).bind(this).then((files)=>{
          this.treeCache = files.map( file => new AlbumPlaylist({
            id: md5(file),
            path: file,
            title: path.basename(file, '.m3u')
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
          { name: 'Playlist files', extensions: ['m3u'] }
        ] 
      })
    }else{
      targetPath = path.join(this.root, playlist.title + '.m3u')
    }
     
    return fs.outputFileAsync(
      targetPath,
      playlist.getFileList().join("\n")
    ).then(()=>{
      playlist.path = targetPath
    })
  }
}