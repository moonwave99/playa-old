"use babel"

var ipc = require('ipc')
var md5 = require('MD5')
var path = require('path')
var groove = require('groove')
var assert = require('assert')
var glob = require('glob')

var MetaDoctor = require('./MetaDoctor')
var PlaylistItem = require('./PlaylistItem')

module.exports = class FileLoader {
  constructor(options) {
    this.cache = {}
  }
  load(folder) {
    return new Promise((resolve, reject)=>{
      glob("**/*.{mp3,flac}", { cwd: folder }, (er, files)=> {
        Promise.all(
          files.map((f)=>{ return this.openFile( path.join(folder, f) ) })
        ).then((files)=>{
          resolve(files)
        }).catch((err)=>{
          reject(err)
        })
      })      
    })
  }
  openFile(filename){
    return new Promise((resolve, reject)=>{
      var hash = md5(filename)
      if(this.cache[hash]){
        resolve(this.cache[hash])
      }else{
        groove.open(filename, (err, file)=>{
          if(err){
            reject(err)
          }else{
            this.cache[hash] = new PlaylistItem({
              filename: file.filename,
              metadata: MetaDoctor.normalise(file.metadata()),
              duration: file.duration(),
              grooveFile: file
            })
            resolve(this.cache[hash])
          }
        })  
      }    
    })
  }
  getFromPool(filename){
    return this.cache[md5(filename)];
  }
}