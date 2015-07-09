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
    this.groovePlaylist = groove.createPlaylist()
    this.player.useExactAudioFormat = true
    this.player.on('nowplaying', this.onNowplaying.bind(this))
    this.timer = null        
    this.userPlaylist = null
    this.attached = false
    this.loading = false
    this.currentAlbum = {}
    this.lastTrackPlayed = null
    this.lastAction = null
    this.playbackDirection = 0
  }
  getAll(){
    return this.groovePlaylist ? this.groovePlaylist.items() : []
  }
  startTimer(){
    if(this.timer){
      return
    }

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
      }else if(!this.groovePlaylist){
        reject(new Error('No playlist set!'))
      }else{
        this.player.attach(this.groovePlaylist, (err)=>{
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
      }else if(!this.groovePlaylist){
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
    if(this.loading){
      return
    }
    var current = this.groovePlaylist.position()
    if(current.item){
      if(!this.lastTrackPlayed){
        this.lastTrackPlayed = current.item.file.metadata()
      }else{
        var _lastTrackPlayed = current.item.file.metadata()
        this.playbackDirection = this.lastTrackPlayed.track <= _lastTrackPlayed.track ? 1 : -1
        this.lastTrackPlayed = _lastTrackPlayed        
      }
      if(!this.timer){
        this.startTimer()
      }
      this.emit('nowplaying')  
    }else{
      if(this.playbackDirection == 0){
        this.lastAction == 'prev' ? this.prevAlbum() : this.nextAlbum()
      }else{
        this.playbackDirection > 0 ? this.nextAlbum() : this.prevAlbum()  
      }
    }
  }
  playing() {
    return this.groovePlaylist && this.groovePlaylist.playing()
  }
  playbackInfo() {
    if(!this.groovePlaylist){
      return null;
    }
    var info = this.groovePlaylist.position()
    return {
      position: info.pos,
      playing: info.item && this.groovePlaylist.playing(),
      item: info.item ? this.fileLoader.getFromPool(info.item.file.filename) : {}
    }
  }
  play() {
    this.attach().then(()=>{
      this.startTimer()
      this.groovePlaylist.play()
    })
  }
  pause() {
    this.groovePlaylist.pause()
    this.clearTimer()
  }
  nextTrack() {
    this.lastAction = 'next'
    var items = this.groovePlaylist.items()
    var current = this.groovePlaylist.position()
    var currentIndex = _.findIndex(items, (item)=>{
      return item.id == current.item.id
    })
    if(currentIndex < items.length -1){
      this.groovePlaylist.seek(items[currentIndex+1], -1)
      return true
    }else{
      return this.nextAlbum()
    }    
  }
  prevTrack() {
    this.lastAction = 'prev'
    var items = this.groovePlaylist.items()
    var current = this.groovePlaylist.position()
    var currentIndex = _.findIndex(items, (item)=>{
      return item.id == current.item.id
    })
    if(currentIndex > 0){
      this.groovePlaylist.seek(items[currentIndex-1], -1)
      return true      
    }else{
      return this.prevAlbum()
    }    
  }
  gotoTrack(id) {
    id = id || this.currentAlbum.tracks[0].id
    var item = _.find(this.groovePlaylist.items(), (item)=>{
      return id == md5(item.file.filename)
    })
    if(item){
      this.groovePlaylist.seek(item, -1)
      !this.groovePlaylist.playing() && this.play()
    }
  }
  seek(to) {
    if(!this.groovePlaylist){
      return false;
    }
    var current = this.groovePlaylist.position()
    var seekToSecond = current.item.file.duration() * to
    current.item && this.groovePlaylist.seek(current.item, seekToSecond)    
  }
  nextAlbum(){
    var nextAlbum = this.userPlaylist.getNext(this.currentAlbum)
    return nextAlbum && this.playAlbum(nextAlbum)
  }
  prevAlbum(){
    var prevAlbum = this.userPlaylist.getPrevious(this.currentAlbum)
    return prevAlbum && this.playAlbum(prevAlbum)    
  }
  insert(file) {
    this.groovePlaylist.insert(file)
    if(this.playing() && !this.attached){
      this.groovePlaylist.pause()
    }
  }
  remove(file){
    this.groovePlaylist.remove(file)
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
    var filesToClose = this.groovePlaylist.items().map( i => i.file )
    this.groovePlaylist.clear()
    return this.closeFiles(filesToClose)
  }
  append(files){
    files.forEach((file)=>{
      file && this.groovePlaylist.insert(file)
    })
  }
  playAlbum(album, trackId){
    if(this.currentAlbum.id !== album.id){
      this.loading = true
      this.clearPlaylist().then(()=>{
        Promise.all(album.tracks.map((track)=>{
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
          this.loading = false
          this.gotoTrack(trackId)
          return true
        }).catch((err)=>{
          console.error(err, err.stack)
        })        
      })
    }else{
      this.gotoTrack(trackId)
    }
  } 
}