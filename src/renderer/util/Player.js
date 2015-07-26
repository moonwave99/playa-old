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
    this.mediaFileLoader = options.mediaFileLoader
    this.resolution = options.resolution || 1000
    this.player = groove.createPlayer()
    this.player.useExactAudioFormat = true
    this.player.on('nowplaying', this.onNowplaying.bind(this))
    this.groovePlaylist = groove.createPlaylist()
    this.timer = null
    this.attached = false
    this.loading = false
    this.playing = false
    this.currentPlaylist = null
    this.currentAlbum = null
    this.currentTrack = null
    this.lastTrackPlayed = null
    this.lastAction = null
    this.playbackDirection = 0
  }
  startTimer(){
    if(this.timer){
      return
    }
    this.timer = setInterval(()=>{
      this.emit('playerTick')
    }, this.resolution)
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
          if(err){ reject(err)
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
          if(err){ reject(err)
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
      this.currentTrack = this.currentAlbum.findById(md5(current.item.file.filename))
      this.emit('nowplaying')
    }else{
      if(this.playbackDirection == 0){
        this.lastAction == 'prev' ? this.prevAlbum() : this.nextAlbum()
      }else{
        this.playbackDirection > 0 ? this.nextAlbum() : this.prevAlbum()
      }
    }
  }
  playbackInfo() {
    if(!this.groovePlaylist){
      return null;
    }
    var info = this.groovePlaylist.position()
    return {
      position: info.pos,
      playing: this.playing,
      item: this.currentTrack || {},
      album: this.currentAlbum
    }
  }
  play() {
    this.attach().then(()=>{
      this.startTimer()
      this.playing = true
      this.groovePlaylist.play()
    })
  }
  pause() {
    this.groovePlaylist.pause()
    this.playing = false
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
      this.currentTrack = this.currentAlbum.findById(id)
      this.emit('trackChange')
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
    var nextAlbum = this.currentPlaylist.getNext(this.currentAlbum)
    return nextAlbum && this.loadAlbum(nextAlbum)
  }
  prevAlbum(){
    var prevAlbum = this.currentPlaylist.getPrevious(this.currentAlbum)
    return prevAlbum && this.loadAlbum(prevAlbum)
  }
  insert(file) {
    this.groovePlaylist.insert(file)
    if(this.playing && !this.attached){
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
  loadAlbum(album){
    return new Promise((resolve, reject)=>{
      if(!this.currentAlbum || (this.currentAlbum.id !== album.id)){
        this.loading = true
        this.clearPlaylist().then(()=>{
          Promise.all(album.tracks.map((track)=>{
            return new Promise((resolve, reject)=>{
              groove.open(track.filename, (err, file)=>{
                if(err){ reject(err)
                }else{ resolve(file) }
              })
            })
          })).then((files)=>{
            this.currentAlbum = album
            return this.append(files)
          }).then(()=>{
            this.loading = false
            this.emit('trackChange')
            resolve(album)
          }).catch((err)=>{
            console.error(err, err.stack)
            reject(err)
          })
        })
      }else{
        this.emit('trackChange')
        resolve(this.currentAlbum)
      }
    })
  }
}
