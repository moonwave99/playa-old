"use babel"

var groove = require('groove')
var Batch = require('batch')
var MetaDoctor = require('./MetaDoctor')

module.exports = class Playlist{
  constructor(options){
    this.groovePlaylist = groove.createPlaylist()
    this.title = options.title
  }
  add(files){
    files.forEach((file)=> {
      file && this.groovePlaylist.insert(file)
    })
  }
  items(){
    return this.groovePlaylist.items().map((item)=>{
      return {
        id: item.id,
        metadata: MetaDoctor.normalise(item.file.metadata()),
        duration: item.file.duration(),
        file: item.file
      }
    })
  }
  clear(){
    return new Promise((resolve, reject)=>{
      var batch = new Batch()      
      var files = this.groovePlaylist.items().map(function(item) { return item.file })
      this.groovePlaylist.clear()      
      files.forEach((file)=> {
        batch.push((cb)=> {
          file.close(cb)
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
}