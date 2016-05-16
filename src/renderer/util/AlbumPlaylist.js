"use babel"

var _ = require('lodash')
var path = require('path')
var Promise = require('bluebird')
var fs = Promise.promisifyAll(require('fs-extra'))
var md5 = require('md5')
var uid = require('uid')
var DoublyLinkedList = require('doubly-linked-list-js')
var PlaylistItem = require('./PlaylistItem')
var Album = require('./Album')

module.exports = class AlbumPlaylist{
  constructor(options){
    this.items = new DoublyLinkedList()
    this.id = options.id || uid()
    this.path = options.path
    this.ext = this.isNew() ? '.yml' : path.extname(this.path)
    this.title = this.isNew() ? 'Untitled' : path.basename(this.path, this.ext)
    this.loaded = false
    this.lastPlayedAlbumId = null
    this.lastPlayedTrackId = null
    this.lastScrolledAlbumId = null
    this.openAlbums = []
  }
  getFirst(){
    return this.items.getFirst()
  }
  getLast(){
    return this.items.getLast()
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
  getLength(){
    return this.items.getLength()
  }
  getIds(){
    return this.items.toArray().map( i => i.id )
  }
  getAlbumById(id){
    return _.findWhere(this.items.toArray(), { id: id })
  }
  getTrackById(id){
    var tracks = _.flatten(this.items.toArray().map( i => i.tracks ))
    return _.findWhere(tracks, { id: id })
  }
  getAlbumByTrackId(id){
    return _.find(this.items.toArray(), a => a.contains(id))
  }
  getLastPlayedAlbum(){
    return this.getAlbumById(this.lastPlayedAlbumId)
  }
  find(buffer){
    return _.find(this.items.toArray(), a => a.getArtist().toLowerCase().startsWith(buffer) || a.getTitle().toLowerCase().startsWith(buffer))
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
  load(files, opts={}){
    return new Promise((resolve, reject)=>{
      if((this.loaded && !opts.force) || this.isNew()){
        resolve(this)
      }else{
        playa.mediaFileLoader.loadFiles(files, opts).bind(playa.mediaFileLoader).then((results)=>{
          this._process(results, opts)
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
    return playa.mediaFileLoader.loadFolder(folder).bind(this).then((files)=>{
      return this._process(files)
    })
  }
  addFolderAtPosition(folder, positionId){
    return playa.mediaFileLoader.loadFolder(folder).bind(this).then((files)=>{
      return this._process(files, { insertAt: positionId })
    })
  }
  clear(){
    this.items = new DoublyLinkedList()
    this.loaded = false
  }
  indexOf(id){
    return _.findIndex(this.getItems(), { id: id })
  }
  findAlbumByTrackId(id){
    return _.find(this.items.toArray(), album => album.contains(id) )
  }
  reorder(albumFromId, albumToId, position){
    var albumFrom = this.getAlbumById(albumFromId)
    var indexFrom = this.indexOf(albumFromId)
    var indexTo = this.indexOf(albumToId)

    if(position == 'after'){
      indexTo++
    }
    if(indexTo >= this.items.getLength()){
      this.items.add(albumFrom)
    }else{
      this.items.addAt(albumFrom, indexTo)
    }
    if(indexFrom > indexTo){
      this.items.removeAt(indexFrom+1)
    }else{
      this.items.removeAt(indexFrom)
    }
  }
  rename(to){
    var newPath = path.join(
      path.dirname(this.path),
      to + this.ext
    )
    return new Promise((resolve, reject)=>{
      fs.statAsync(newPath).bind(this).then((stats)=>{
        reject(new Error('File already exists'))
      }).catch((error)=>{
        fs.moveAsync(this.path, newPath).bind(this).then(()=>{
          this.title = to
          this.path = newPath
          resolve()
        })
      })
    })
  }
  hydrate(data){
    this.title = data.title
    this.lastPlayedAlbumId = data.lastPlayedAlbumId
    this.lastPlayedTrackId = data.lastPlayedTrackId
    this.lastScrolledAlbumId = data.lastScrolledAlbumId
    this.openAlbums = data.openAlbums || []
  }
  serialize(){
    return {
      title: this.title,
      lastPlayedAlbumId: this.lastPlayedAlbumId || null,
      lastPlayedTrackId: this.lastPlayedTrackId || null,
      lastScrolledAlbumId: this.lastScrolledAlbumId || null,
      openAlbums: this.openAlbums || [],
      tracklist: this.getFileList() || []
    }
  }
  _process(results, opts={}){
    var processedAlbums = _(results)
      .groupBy( r => path.dirname( r.isFulfilled() ? r.value().filename : r.reason() ))
      .map((album, directory)=>{
        var candidateTrack = null
        var tracks = album.map((track, index)=>{
          if(track.isFulfilled()){
            var t = new PlaylistItem(track.value())
            if(candidateTrack == null){
              candidateTrack = t
            }
            return t
          }else{
            return new PlaylistItem({
              filename: track.reason(),
              disabled: true
            })
          }
        })
        return new Album({
          id: ['a',
            candidateTrack
              ? md5(candidateTrack.metadata.artist + candidateTrack.metadata.album)
              : md5(tracks[0].filename)
            ].join('_'),
          tracks: tracks,
          disabled: !candidateTrack
        })
      }).value()

    if(opts.insertAt){
      var positionIndex = this.indexOf(opts.insertAt)
      this.items.addArrayAt(processedAlbums, positionIndex)
    }else{
      if(opts.force){
        this.items = new DoublyLinkedList()
      }
      processedAlbums.forEach( a => this.items.add(a) )
    }

    return this
  }
}
