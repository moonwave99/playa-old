"use babel";

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
    ipc.on('open:folder', this.openFolder.bind(this))
  }
  openFolder(folder) {
    var batch = new Batch()
    glob("**/*.{mp3,flac}", { cwd: folder }, (er, files)=> {
      files.forEach((f)=> {
        batch.push(openFileFn(path.join(folder, f)))
      })
      batch.end((err, files)=> {          
        PlaylistActions.addFiles(files)
      }) 
    })
  }  
}