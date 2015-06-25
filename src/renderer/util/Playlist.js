"use babel"

var groove = require('groove')
var Promise = require('bluebird')
var fs = Promise.promisifyAll(require('fs-extra'))
var md5 = require('MD5')
var uid = require('uid')
var Batch = require('batch')
var PlaylistItem = require('./PlaylistItem')

module.exports = class Playlist{
  constructor(options){
    this.items = []
    this.id = options.id || uid()
    this.title = options.title
    this.path = options.path
    this.loaded = false
    this.displayMode = 'table'
  }
  isNew(){
    return !this.path
  }
  parseM3U(){
    if(this.isNew()){
      return
    }
    return fs.readFileAsync(this.path, 'utf8').bind(this).then((data)=>{
      return data.split('\n')
    }).catch((err)=>{
      console.error(err.stack)
    })
  }
  load(){
    return new Promise((resolve, reject)=>{
      if(this.loaded || this.isNew()){
        resolve(this)
      }else{
        this.parseM3U().then(playa.fileLoader.loadFiles.bind(playa.fileLoader)).then((items)=>{
          this.items = this.items.concat(items);
          this.loaded = true
          resolve(this)
        })            
      }
    })
  }
  addFolder(folder){
    return playa.fileLoader.loadFolder(folder).then((items)=>{
      this.items = this.items.concat(items);
    })
  }
  closeFiles(){
    var batch = new Batch()
    return new Promise((resolve, reject)=>{
      this.items.forEach((item)=> {
        batch.push((cb)=> {
          item.grooveFile.close(cb)
        })
      })     
      batch.end((err)=> {
        if(err){
          reject(err)
        }else{
          resolve()
        }
      })
    })        
  }
  clear(){
    return this.closeFiles().then(()=>{
      this.items = []
    })
  }
}