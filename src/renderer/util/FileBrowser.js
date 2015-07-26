"use babel"

var _ = require('lodash')
var Promise = require('bluebird')
var path = require('path')
var walkdir = Promise.promisifyAll(require('walkdir'))
var glob = Promise.promisifyAll(require('glob'))

module.exports = class FileBrowser {
  constructor(options) {

  }
  load(folder, filter='directory'){
    if(filter == 'directory'){
      return this.loadFolder(folder)
    }else{
      return this.loadFiles(folder, filter)
    }
  }
  loadFolder(folder) {
    return new Promise((resolve, reject)=>{
      var dirs = []
      var emitter = walkdir(folder, {
        "max_depth" : 1
      })
      emitter.on('directory', (dir)=>{
        dirs.push(dir)
      })
      emitter.on('end', ()=>{
        resolve(dirs)
      })
      emitter.on('error', (path, error)=>{
        reject(error)
      })
      emitter.on('fail', (path, error)=>{
        reject(error)
      })
    })
  }
  loadFiles(folder, filter){
    return glob.callAsync(this, path.join(folder, '*' + filter))
  }
}
