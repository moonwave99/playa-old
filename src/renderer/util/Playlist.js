"use babel"

var _ = require('lodash')
var groove = require('groove')
var Promise = require('bluebird')
var fs = Promise.promisifyAll(require('fs-extra'))
var md5 = require('MD5')
var uid = require('uid')
var PlaylistItem = require('./PlaylistItem')
var Album = require('./Album')

module.exports = class Playlist{
  constructor(options){
    this.items = []
    this.id = options.id || uid()
    this.title = options.title
    this.path = options.path
    this.loaded = false
    this.displayMode = 'albums'
  }
  groupByAlbum(){
    return _.reduce(this.items, (memo, item)=>{
      var album = _.find(memo, (i)=>{ return i.title && item.metadata.album && (i.title.toLowerCase() == item.metadata.album.toLowerCase()) })
      if(!album){
        album = new Album({
          id: md5(item.metadata.artist + item.metadata.album),
          title: item.metadata.album,
          tracks: []
        })
        memo.push(album)
      }
      album.tracks.push(item)
      return memo
    }, [])    
  }
  isNew(){
    return !this.path
  }
  load(files){
    return new Promise((resolve, reject)=>{
      if(this.loaded || this.isNew()){
        resolve(this)
      }else{
        playa.fileLoader.loadFiles(files).bind(playa.fileLoader).then((items)=>{
          this.items = this.items.concat(items)
          this.loaded = true
          resolve(this)
        })            
      }
    })
  }
  addFolder(folder){
    return playa.fileLoader.loadFolder(folder).then((items)=>{
      this.items = this.items.concat(items)
    })
  }
  closeFiles(files){
    files = files || this.items
    
    return Promise.all(files.map((item)=>{
      return new Promise((resolve, reject)=>{
        item.grooveFile.close((err)=>{
          if(err){
            reject(err)
          }else{
            resolve(item)
          }
        })
      })
    }))     
  }
  removeFiles(ids){
    return this.closeFiles(this.items.filter( i => ids.indexOf(i.id) > -1)).then((removedItems)=>{
      var removedIds = removedItems.map((i)=>{ return i.id })
      _.remove(this.items, (item)=>{
        return removedIds.indexOf(item.id) > -1
      })
    })
  }
  clear(){
    return this.closeFiles().then(()=>{
      this.items = []
    })
  }
  indexOf(id){
    return _.findIndex(this.items, { id: id })
  }
  reorder(from, to, at){
    var movingItems = this.items.splice(from, to-from+1)
    Array.prototype.splice.apply(this.items, [at, 0].concat(movingItems))
  }
}