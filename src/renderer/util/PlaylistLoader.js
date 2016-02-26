"use babel"

var _ = require('lodash')
var Promise = require('bluebird')
var fs = Promise.promisifyAll(require('fs-extra'))
var ipc = require('electron').ipcRenderer
var md5 = require('md5')
var path = require('path')
var yaml = Promise.promisifyAll(require('js-yaml'))
var glob = Promise.promisifyAll(require('glob'))

var AlbumPlaylist = require('./AlbumPlaylist')

module.exports = class PlaylistLoader {
  constructor(options) {
    this.root = options.root
    this.playlistExtension = options.playlistExtension
    this.treeCache = []
  }
  parse(playlistPath){
    return fs.readFileAsync(playlistPath, 'utf8').bind(this)
      .then(yaml.safeLoad)
      .catch((err)=>{
        console.error(err, err.stack)
      })
  }
  load(playlist, opts) {
    return new Promise((resolve, reject)=>{
      if(playlist.isNew()){
        resolve(playlist)
      }else{
        resolve(this.parse(playlist.path).then((data)=>{
          playlist.hydrate(data)
          return playlist.load(_.uniq(data.tracklist), opts)
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
          { name: 'Playlist files', extensions: [this.playlistExtension.replace('.', '')] }
        ]
      })
      if(!targetPath){
        return Promise.reject('Cancel save')
      }else{
        playlist.title = path.basename(targetPath.replace(this.root, ''), this.playlistExtension)
      }
    }else{
      targetPath = path.join(this.root, playlist.title + this.playlistExtension)
    }
    return fs.outputFileAsync(
      targetPath,
      yaml.safeDump(playlist.serialize())
    ).then(()=>{
      playlist.path = targetPath
      playlist.id = md5(targetPath)
      return playlist
    }).catch((error)=>{
      console.error(error, error.stack)
    })
  }
}
