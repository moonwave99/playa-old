"use babel"

var md5 = require('md5')

module.exports = class PlaylistItem{
  constructor(options){
    this.metadata = options.metadata || {}
    this.duration = +options.duration
    this.filename = options.filename
    this.id = 't_' + md5(this.filename)
    this.disabled = options.disabled
  }
  formattedTitle(){
    return this.metadata.artist + ' - ' + this.metadata.title
  }
  getDiscNumber(){
    return this.disabled ? 0 : this.metadata.disk.no
  }
  serializeForRemote(){
    if(this.disabled){
      return {}
    }else{
      return {
        id: this.id,
        title: this.metadata.title,
        artist: this.metadata.artist,
        track: this.metadata.track,
        duration: this.duration
      }
    }
  }
}
