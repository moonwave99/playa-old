"use babel"

var PlaylistActions = require('../actions/PlaylistActions')
var ipc = require('ipc')
var path = require('path')
var groove = require('groove')
var assert = require('assert')
var Batch = require('batch')
var glob = require('glob')

function openFileFn(filename) {
  return function(cb) {
    groove.open(filename, cb)
  }
}

module.exports = class Loader {
  constructor(options) {
    this.folder = options.folder
  }
  load() {
    return new Promise((resolve, reject)=>{
      var batch = new Batch()
      glob("**/*.{mp3,flac}", { cwd: this.folder }, (er, files)=> {
        files.forEach((f)=> {
          batch.push(openFileFn(path.join(this.folder, f)))
        })
        batch.end((err, files)=> {
          if(err){
            reject(err)
          }else{
            resolve(files)
          }
        }) 
      })      
    })
  }  
}