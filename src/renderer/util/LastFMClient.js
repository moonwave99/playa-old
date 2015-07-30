"use babel"

var _ = require('lodash')
var LastFmNode = require('lastfm').LastFmNode

module.exports = class LastFMClient {
  constructor(options) {
    this.key = options.key
    this.secret = options.secret
    this.useragent = options.useragent
    this.lastfm = new LastFmNode({
      api_key:    this.key,
      secret:     this.secret,
      useragent:  this.useragent
    })
  }
  scrobble(track, after) {
    console.log(track, after)
  }
}
