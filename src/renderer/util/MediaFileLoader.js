"use babel"

var _ = require('lodash')
var ipc = require('electron').ipcRenderer
var fs = require('fs-extra')
var md5 = require('md5')
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
  loadFiles(files, opts) {
    return Promise.settle(files.map( f => this.openFile(f, opts) ))
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
      return Promise.settle(_.flatten(files).map( f => this.openFile(f) ))
    })
    .catch((err)=>{
      console.error(err, err.stack)
    })
  }
  openFile(filename, opts={}){
    var stream
    return new Promise((resolve, reject)=>{
      var hash = md5(filename)
      if(this.cache[hash] && !opts.force){
        resolve(this.cache[hash])
      }else{
        stream = fs.createReadStream(filename)
        stream.on('error', reject.bind(null, filename))
        mm(stream, { duration: true }, (error, metadata)=>{
          if(error){
            stream.close()
            reject(filename)
          }else{
            this.cache[hash] = {
              filename: filename,
              metadata: error ? {} : MetaDoctor.normalise(metadata),
              duration: metadata.duration,
            }
            stream.close()
            resolve(this.cache[hash])
          }
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
