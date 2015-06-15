"use babel"

var groove = require('groove')
var md5 = require('MD5')
var Batch = require('batch')
var Loader = require('./Loader')
var Playa = require('../../playa')
var PlaylistItem = require('./PlaylistItem')

module.exports = class Playlist{
  constructor(options){
    this.items = []
    this.title = options.title
    this.id = options.id
  }
  add(folder){
    var loader = new Loader({ folder: folder })
    return loader.load().then((files)=>{
      files.forEach((file)=> {
        var hash = md5(file.filename)
        var info = Playa.playerCache.get(file)
        this.items.push(new PlaylistItem(
          {
            id: info.id,
            grooveFile: file,
            duration: info.duration,
            metadata: info.metadata
          }        
        ))
      })
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