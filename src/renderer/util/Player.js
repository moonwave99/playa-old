"use babel";

var EventEmitter = require('events').EventEmitter
var assert = require('assert')
var groove = require('groove')
var Batch = require('batch')
var _ = require('lodash')

groove.setLogging(groove.LOG_ERROR)

module.exports = class Player extends EventEmitter{
  constructor(options) {
    super(options)
    this.player = groove.createPlayer()
    this.player.useExactAudioFormat = true
    this.player.on('nowplaying', this.onNowplaying.bind(this))
    this.timerId = null        
    this.attached = false;
    this.playlist = groove.createPlaylist()
  }
  getAll(){
    return this.playlist ? this.playlist.items() : []
  }
  startTimer(){
    var timer = function(){
      return setTimeout(() =>{
        this.emit('playerTick')
        this.timerId = timer()
      }, 1000)
    }.bind(this)
    timerId = timer()
  }
  clearTimer(){
    this.timerId && clearInterval(this.timerId)
  }
  attach(){
    return new Promise((resolve, reject)=>{
      if(this.attached){
        resolve()
      }else if(!this.playlist){
        reject()
      }else{
        this.player.attach(this.playlist, (err)=>{
          if(err){
            reject(err)
          }else{
            this.attached = true
            resolve()
          }
        })
      }    
    })
  }
  detach(){
    return new Promise((resolve, reject)=>{
      if(!this.attached){
        resolve()
      }else if(!this.playlist){
        reject()
      }else{
        this.player.detach(this.playlist, (err)=>{
          if(err){
            reject(err)
          }else{
            this.attached = false
            resolve()
          }
        })
      }
    })
  }  
  onNowplaying() {
    var current = this.playlist.position()
    if(current.item){
      if(!this.timerId){
        this.startTimer()
      }
      this.emit('nowplaying', current)  
    }
  }
  playing() {
    return this.playlist && this.playlist.playing()
  }
  playbackInfo() {
    var info = this.playlist.position()
    return {
      currentItem: info.item,
      position: info.pos,
      playing: info.item && this.playlist.playing()
    }
  }
  play() {
    this.attach().then(()=>{
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
    var item = _.findWhere(this.playlist.items(), { id: id })
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
  clearPlaylist() {
    this.clearTimer()    
    return new Promise((resolve, reject)=>{
      var batch = new Batch()      
      var files = this.playlist.items().map(function(item) { return item.file })
      this.playlist.clear()      
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
    }).then(this.detach)
  }
}