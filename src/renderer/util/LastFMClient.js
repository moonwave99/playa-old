"use babel"

var _ = require('lodash')
var Promise = require('bluebird')
var shell = require('shell')
var EventEmitter = require('events').EventEmitter
var LastFmNode = require('lastfm').LastFmNode

module.exports = class LastFMClient extends EventEmitter{
  constructor(options) {
    super(options)
    this.scrobbleEnabled = options.scrobbleEnabled
    this.key = options.key
    this.secret = options.secret
    this.sessionInfo = options.sessionInfo
    this.authURL = 'http://www.last.fm/api/auth/'
    this.useragent = options.useragent
    this.lastfm = new LastFmNode({
      api_key:    this.key,
      secret:     this.secret,
      useragent:  this.useragent
    })
    this.authorised = false
    this.token = null
    this.session = null
  }
  isAuthorized(){
    return this.session && this.session.isAuthorised()
  }
  authorise(){
    if(this.sessionInfo){
      this.session = this.lastfm.session({
        user: this.sessionInfo.user,
        key: this.sessionInfo.key
      })
    }else{
      this.requestToken()
        .then((data)=>{
          this.token = data.token
          this.openAuthPage()
          this.session = this.lastfm.session({
            token: this.token,
            handlers: {
              success: (data)=>{ this.emit('authorised') }
            }
          })
        })
        .catch((error)=>{
          console.error(error, error.stack)
        })
    }
  }
  requestToken(){
    return new Promise((resolve, reject)=>{
      this.lastfm.request('auth.getToken', {
        handlers: {
          success: resolve,
          error: reject
        }
      })
    })
  }
  openAuthPage(){
    shell.openExternal(this.authURL + '?api_key=' + this.key + '&token=' + this.token)
  }
  scrobble(track, after) {
    if(!this.scrobbleEnabled || !this.isAuthorized()){
      return
    }
    this.lastfm.update('scrobble', this.session, {
      track: track.metadata.title,
      artist: track.metadata.artist,
      album: track.metadata.album,
      timestamp: Math.floor((new Date()).getTime() / 1000),
      handlers: {
        success: (data)=>{
          this.emit('scrobbledTrack', track)
        },
        error: (error)=>{
          console.error(error, error.stack)
        }
      }
    })
  }
}
