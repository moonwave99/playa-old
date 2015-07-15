"use babel"

var _ = require('lodash')
var fs = require('fs-plus')
var path = require('path')
var Promise = require('bluebird')
var waveform = require('waveform')

module.exports = class WaveformLoader {
  constructor(options) {
    this.root = options.root
    this.config = options.config
    this.enableLog = !!options.enableLog
  }
  load(track){
    return new Promise((resolve, reject)=>{
      var waveformPath = this.getCached(track)
      if(waveformPath){
        resolve(waveformPath)
      }else{
        var targetPath = this.getWaveformPath(track)
        waveform(track.filename, {
          'scan'              : false,
          'png'               : targetPath,
          'png-width'         : this.config['png-width'],
          'png-height'        : this.config['png-height'],
          'png-color-bg'      : this.config['png-color-bg'],
          'png-color-center'  : this.config['png-color-center'],
          'png-color-outer'   : this.config['png-color-outer']
        }, (err, stdout)=>{
          if(err){
            reject(err)
          }else{
            setTimeout(()=>{
              resolve(targetPath)
            }, this.config.wait)
          }
        })
      }
    })
  }
  getCached(track){
    var waveformPath = this.getWaveformPath(track)
    return fs.existsSync(waveformPath) ? waveformPath : false
  }
  getWaveformPath(track){
    return path.join(
      this.root,
      [
        track.id,
        this.config['png-width'],
        this.config['png-height'],
        this.config['png-color-bg'],
        this.config['png-color-center'],
        this.config['png-color-outer']
      ].join('_') + '.png'
    )
  }
  log(message, response){
    this.enableLog && (response ? console.info(message, response) : console.info(message))
  }
}
