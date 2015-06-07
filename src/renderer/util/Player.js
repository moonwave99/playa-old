"use babel";

var groove = require('groove')
var assert = require('assert')
var _ = require('lodash')

module.exports = class Player {
  constructor(options) {
    this.playlist = null
    this.player = groove.createPlayer()
    this.player.useExactAudioFormat = true
  }
  playing() {
    return this.playlist && this.playlist.playing()
  }
  playbackInfo() {
    if(!this.playlist){
      return {
        currentItem: null,
        position: 0
      }
    }else{
      var info = this.playlist.position()      
      return {
        currentItem: info.item,
        position: info.pos
      }
    }
  }
  play(playlist) {
    if(!this.playlist){
      this.player.attach(playlist, (err)=>{
        if(!err){
          
        }
      })
      this.playlist = playlist;
    }else{
      this.playlist.play()
    }
  }
  pause() {
    this.playlist && this.playlist.pause()
  }
  next() {
    var items = this.playlist.items()
    var current = this.playlist.position()
    var currentIndex = _.findIndex(items, (item)=>{
      return item.id == current.item.id
    })
    if(currentIndex < items.length -1){
      this.playlist.seek(items[currentIndex+1], 0)
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
      this.playlist.seek(items[currentIndex-1], 0)
      return true
    }else{
      return false
    }    
  }
}