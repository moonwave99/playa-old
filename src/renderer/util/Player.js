"use babel";

var EventEmitter = require('events').EventEmitter
var assert = require('assert')
var groove = require('groove')
var _ = require('lodash')


module.exports = class Player extends EventEmitter{
  constructor(options) {
    super(options)
    this.playlist = null
    this.player = groove.createPlayer()
    this.player.useExactAudioFormat = true
    this.player.on('nowplaying', this.onNowplaying.bind(this))
    this.timerId = null
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
  setPlaylist(playlist){
    this.player.attach(playlist, (err)=>{
      if(!err){
        
      }
    })
    this.playlist = playlist;    
  }
  onNowplaying() {
    var current = this.player.position()
    this.emit('nowplaying')
  }
  playing() {
    return this.playlist && this.playlist.playing()
  }
  playbackInfo() {
    if(!this.playlist){
      return {
        currentItem: null,
        position: 0,
        playing: false
      }
    }else{
      var info = this.playlist.position()      
      return {
        currentItem: info.item,
        position: info.pos,
        playing: this.playlist.playing()
      }
    }
  }
  play(playlist) {
    if(!this.playlist){
      this.setPlaylist(playlist)
    }else{
      this.playlist.play()
    }
    this.startTimer()
  }
  pause() {
    this.playlist && this.playlist.pause()
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
  goto(id, playlist) {
    if(this.playlist !== playlist){
      this.setPlaylist(playlist)
    }    
    var item = _.findWhere(this.playlist.items(), { id: id })
    if(item){
      this.playlist.seek(item, -1)
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
}