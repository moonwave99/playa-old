"use babel"

var groove = require('groove')
var Batch = require('batch')
var Loader = require('./Loader')
var MetaDoctor = require('./MetaDoctor')
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
        this.items.push(new PlaylistItem(
          {
            id: file.filename,
            metadata: MetaDoctor.normalise(file.metadata()),
            duration: file.duration(),
            grooveFile: file
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