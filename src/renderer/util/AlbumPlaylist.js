"use babel"

var _ = require('lodash')
var path = require('path')
var Promise = require('bluebird')
var fs = Promise.promisifyAll(require('fs-extra'))
var md5 = require('MD5')
var uid = require('uid')
var DoublyLinkedList = require('doubly-linked-list-js')
var PlaylistItem = require('./PlaylistItem')
var Album = require('./Album')

module.exports = class AlbumPlaylist{
  constructor(options){
    this.items = new DoublyLinkedList()
    this.id = options.id || uid()
    this.path = options.path
    this.title = this.isNew() ? 'Untitled' : path.basename(this.path, '.m3u')
    this.loaded = false
    this.lastScrolledAlbum = null
  }
  getPrevious(album){
    return this.items.getPrevious(album)
  }
  getNext(album){
    return this.items.getNext(album)
  }
  getFileList(){
    return _.flatten(this.items.toArray().map( i => i.tracks.map(t => t.filename) ))
  }
  getItems(){
    return this.items.toArray()
  }
  getIds(){
    return this.items.toArray().map( i => i.id )
  }
  getAlbumById(id){
    return _.findWhere(this.items.toArray(), { id: id })
  }
  getDisplayMode(){
    return 'albums'
  }
  getStats(){
    var albums = this.getItems()
    var stats
    return _.reduce(albums, (memo, album)=>{
      stats = album.getStats()
      memo.tracks += stats.tracks
      memo.totalTime += stats.totalTime
      return memo
    }, { tracks: 0, totalTime: 0, albums: albums.length })
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
          this._process(files)
          this.loaded = true
          resolve(this)
        })
      }
    })
  }
  removeItems(ids=[]){
    ids.forEach((id)=>{
      var index = this.indexOf(id)
      this.items.removeAt(index)
    })
  }
  addFolder(folder){
    return playa.fileLoader.loadFolder(folder).bind(this).then((files)=>{
      return this._process(files)
    })
  }
  addFolderAtPosition(folder, positionId){
    return playa.fileLoader.loadFolder(folder).bind(this).then((files)=>{
      return this._process(files, { insertAfter: positionId })
    })
  }
  clear(){
    this.items = new DoublyLinkedList()
    this.loaded = false
  }
  indexOf(id){
    return _.findIndex(this.getItems(), { id: id })
  }
  reorder(albumFrom, albumTo){
    var items = this.getItems()
    var albumIds = items.map( i => i.id )
    var indexFrom = albumIds.indexOf(albumFrom)
    var indexTo = albumIds.indexOf(albumTo)
    albumIds.splice(indexTo, 0, albumIds.splice(indexFrom, 1)[0])
    this.items = new DoublyLinkedList()
    albumIds.forEach((id)=>{
      this.items.add(_.findWhere(items, { id: id }))
    })
  }
  _process(files, opts){
    var albums = _.groupBy(files, (file)=>{
      return file.metadata.album ? file.metadata.album.toLowerCase() : '_noalbum'
    })
    if(opts && opts.insertAfter){
      var positionIndex = this.indexOf(opts.insertAfter)
      var [previousAlbums, nextAlbums] =  _.partition(this.getItems(), (item, index)=>{
        return index < positionIndex
      })
      var processedAlbums =  _.map(albums, (tracks, key)=>{
        tracks = tracks.map( track => new PlaylistItem(track) )
        return new Album({
          id: md5(tracks[0].metadata.artist + tracks[0].metadata.album),
          tracks: tracks
        })
      })
      this.items = new DoublyLinkedList()
      _.uniq(
        previousAlbums.concat(processedAlbums, nextAlbums),
        (album => album.id)
      ).forEach( a => this.items.add(a) )
    }else{
      _.forEach(albums, (tracks, key)=>{
        tracks = tracks.map( track => new PlaylistItem(track) )
        this.items.add(new Album({
          id: md5(tracks[0].metadata.artist + tracks[0].metadata.album),
          tracks: tracks
        }))
      })
    }
    return true
  }
}
