"use babel"

var _ = require('lodash')
var path = require('path')
var Promise = require('bluebird')
var ffmpeg = Promise.promisifyAll(require('fluent-ffmpeg'))
var appConfig = require('../../config/appConfig')

module.exports = class AudioMetadata {
  constructor(filename) {
    this.filename = filename
    this.data = {}
  }
  load() {
    if(!this.filename){
      return Promise.reject('No filename provided!')
    }
    ffmpeg.setFfprobePath(appConfig.ffprobePath)
    return ffmpeg.ffprobeAsync(this.filename).bind(this).then(this._parseMetadata)
  }
  _parseMetadata(metadata) {
    this._rawData = metadata
    let stream = metadata.streams[0] || {}
    this.data = {
      filename: this.filename,
      bit_rate: stream.bit_rate == 'N/A' ? 'N/A' : Math.floor(stream.bit_rate / 1000),
      sample_rate: stream.sample_rate,
      format: stream.codec_long_name,
      channels: stream.channels,
      channel_layout: stream.channel_layout
    }
    return this
  }
  toJSON() {
    return this.data
  }
}
