"use babel"

var groove = require('groove')
var Promise = require('bluebird')
var md5 = require('MD5')
var Batch = require('batch')
var PlaylistItem = require('./PlaylistItem')

module.exports = class Playlist{
  constructor(options){
    this.items = []
    this.title = options.title
    this.id = options.id
    this.path = options.path
    this.displayMode = 'table'
  }
  isNew(){
    return !!this.path
  }
  add(folder){
    return playa.fileLoader.load(folder).then((items)=>{
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