"use babel"

var _ = require('lodash')
var ipc = require('ipc')
var fs = require('fs-extra')
var md5 = require('MD5')
var path = require('path')
var groove = require('groove')
var mm = require('musicmetadata')
var assert = require('assert')
var glob = require('glob')
var Promise = require('bluebird')

var MetaDoctor = require('./MetaDoctor')
var PlaylistItem = require('./PlaylistItem')

module.exports = class MediaFileLoader {
  constructor(options) {
    this.fileExtensions = options.fileExtensions
    this.fileAmountThreshold = options.fileAmountThreshold
    this.cache = {}
  }
  loadFiles(files) {
    var loads = files.map((f)=>{
      return this.openFile(f)
    })
    return Promise.all(loads)
  }
  loadFolder(folder) {
    folder = _.isArray(folder) ? folder : [folder]
    return Promise.all(folder.map((f)=>{
      return new Promise((resolve, reject)=>{
        var pattern = "**/*.{" + this.fileExtensions.join(',') + "}"
        glob(pattern, { cwd: f, nocase: true }, (err, files)=> {
          if(err){
            reject(err)
          }else{
            resolve(files.map( file => path.join(f, file) ))
          }
        })
      })
    }))
    .then((files)=>{
      return Promise.all(_.flatten(files).map( f => this.openFile(f) ))
    })
    .catch((err)=>{
      console.error(err, err.stack)
    })
  }
  openFile(filename){
    var stream
    return new Promise((resolve, reject)=>{
      var hash = md5(filename)
      if(this.cache[hash]){
        resolve(this.cache[hash])
      }else{
        mm(stream = fs.createReadStream(filename), { duration: true }, (err, metadata)=>{
          this.cache[hash] = {
            filename: filename,
            metadata: err ? {} : MetaDoctor.normalise(metadata),
            duration: metadata.duration,
          }
          stream.close()
          resolve(this.cache[hash])
        })
      }
    })
  }
  getFromPool(filename){
    return this.cache[md5(filename)];
  }
  invalidate(ids){
    ids.forEach( id => delete this.cache[md5(id)] )
  }
}
