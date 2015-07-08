"use babel";

var EventEmitter = require('events').EventEmitter
var assert = require('assert')
var groove = require('groove')
var md5 = require('MD5')
var _ = require('lodash')

groove.setLogging(groove.LOG_ERROR)

module.exports = class Player extends EventEmitter{
  constructor(options) {
    super(options)
    this.player = groove.createPlayer()
    this.playlist = groove.createPlaylist()
    this.player.useExactAudioFormat = true
    this.player.on('nowplaying', this.onNowplaying.bind(this))
    this.timer = null        
    this.attached = false
    this.currentAlbum = null
  }
  getAll(){
    return this.playlist ? this.playlist.items() : []
  }
  startTimer(){
    if(this.timer)
      return
      
    this.timer = setInterval(()=>{
      this.emit('playerTick')
    }, 1000)
  }
  clearTimer(){
    this.timer && clearInterval(this.timer)
    this.timer = null
  }
  attach(){
    return new Promise((resolve, reject)=>{
      if(this.attached){
        resolve(true)
      }else if(!this.playlist){
        reject(new Error('No playlist set!'))
      }else{
        this.player.attach(this.playlist, (err)=>{
          if(err){
            reject(err)
          }else{
            this.attached = true
            resolve(true)
          }
        })
      }    
    })
  }
  detach(){
    return new Promise((resolve, reject)=>{
      if(!this.attached){
        resolve(true)
      }else if(!this.playlist){
        reject(new Error('No playlist to detach!'))
      }else{
        this.player.detach((err)=>{
          if(err){
            reject(err)
          }else{
            this.attached = false
            resolve(true)
          }
        })
      }
    })
  }  
  onNowplaying() {
    var current = this.playlist.position()
    if(current.item){
      if(!this.timer){
        this.startTimer()
      }
      this.emit('nowplaying')  
    }else{
      this.clearTimer()
    }
  }
  playing() {
    return this.playlist && this.playlist.playing()
  }
  playbackInfo() {
    if(!this.playlist){
      return null;
    }
    var info = this.playlist.position()
    return {
      position: info.pos,
      playing: info.item && this.playlist.playing(),
      item: info.item ? this.fileLoader.getFromPool(info.item.file.filename) : {}
    }
  }
  play() {
    this.attach().then(()=>{
      this.startTimer()
      this.playlist.play()
    })
  }
  pause() {
    this.playlist.pause()
    this.clearTimer()
  }
  next() {
    var items = this.playlist.items()
    var current = this.playlist.position()
    var currentIndex = _.findIndex(items, (item)=>{
      return item.id == current.item.id
    })
    if(currentIndex < items.length -1){
      this.playlist.seek(items[currentIndex+1], -1)
      return true
    }else{
      return false
    }    
  }
  prev() {
    var items = this.playlist.items()
    var current = this.playlist.position()
    var currentIndex = _.findIndex(items, (item)=>{
      return item.id == current.item.id
    })
    if(currentIndex > 0){
      this.playlist.seek(items[currentIndex-1], -1)
      return true
    }else{
      return false
    }    
  }
  goto(id) {
    var item = _.find(this.playlist.items(), (item)=>{
      return id == md5(item.file.filename)
    })
    if(item){
      this.playlist.seek(item, -1)
      !this.playlist.playing() && this.play()
    }
  }
  seek(to) {
    if(!this.playlist){
      return false;
    }
    var current = this.playlist.position()
    var seekToSecond = current.item.file.duration() * to
    current.item && this.playlist.seek(current.item, seekToSecond)    
  }
  insert(file) {
    this.playlist.insert(file)
    if(this.playing() && !this.attached){
      this.playlist.pause()
    }
  }
  remove(file){
    this.playlist.remove(file)
  }
  closeFiles(filesToClose){
    return Promise.all(filesToClose.map((file)=>{
      var filename = file.filename
      return new Promise((resolve, reject)=>{
        file.close((err)=>{
          if(err){ reject(err)
          }else{ resolve(filename) }
        })
      })
    }))
  }
  clearPlaylist() {
    var filesToClose = this.playlist.items().map( i => i.file )
    this.playlist.clear()
    return this.closeFiles(filesToClose)
  }
  append(files){
    files.forEach((file)=>{
      file && this.playlist.insert(file)
    })
  }
  playAlbum(album, trackId, playlist){    
    var _playAlbum = Promise.all(album.tracks.map((track)=>{
      return new Promise((resolve, reject)=>{
        groove.open(track.filename, (err, file)=>{
          if(err){
            reject(err)
          }else{
            resolve(file)
          }
        })
      })
    })).then((files)=>{
      this.currentAlbum = album
      return this.append(files)
    }).then(()=>{
      this.goto(trackId)
      return true
    }).catch((err)=>{
      console.error(err, err.stack)
    })
    
    if(this.currentAlbum && this.currentAlbum.id !== album.id){
      return this.clearPlaylist().then(_playAlbum)
    }else{
      return _playAlbum
    }
  } 
}