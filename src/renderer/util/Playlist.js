"use babel"

var _ = require('lodash')
var path = require('path')
var Promise = require('bluebird')
var fs = Promise.promisifyAll(require('fs-extra'))
var md5 = require('MD5')
var uid = require('uid')
var MetaDoctor = require('./MetaDoctor')
var PlaylistItem = require('./PlaylistItem')
var Album = require('./Album')

module.exports = class Playlist{
  constructor(options){
    this.items = []
    this.id = options.id || uid()
    this.title = options.title
    this.path = options.path
    this.loaded = false
  }
  getFileList(){
    return this.items.map( i => i.filename )
  }
  getItems(){
    return this.items
  }
  getIds(){
    return this.items.map( i => i.id )
  }  
  getDisplayMode(){
    return 'table'
  }
  groupByAlbum(){
    return _.reduce(this.items, (memo, item)=>{
      var album = _.find(memo, (i)=>{
        return i.title && item.metadata.album && (i.title.toLowerCase() == item.metadata.album.toLowerCase())
      })
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
        playa.fileLoader.loadFiles(files).bind(playa.fileLoader).then((files)=>{
          this.items = this.items.concat(files.map( file => new PlaylistItem(file) ))
          this.loaded = true
          resolve(this)
        })            
      }
    })
  }
  addFolder(folder){
    return playa.fileLoader.loadFolder(folder).then((files)=>{
      this.items = this.items.concat(files.map( file => new PlaylistItem(file) ))
    })
  }
  removeItems(ids){
    _.remove(this.items, (item)=>{
      return ids.indexOf(item.id) > -1
    })
  }
  clear(){
    this.items = []
  }
  indexOf(id){
    return _.findIndex(this.items, { id: id })
  }
  reorder(from, to, at){
    var movingItems = this.items.splice(from, to-from+1)
    Array.prototype.splice.apply(this.items, [at, 0].concat(movingItems))
  }
}