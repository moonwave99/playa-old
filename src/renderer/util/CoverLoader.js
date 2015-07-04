"use babel"

var async = require('async')
var fs = require('fs-extra')
var path = require('path')
var musicmetadata = require('musicmetadata')
var Promise = require('bluebird')

module.exports = class CoverLoader {
  constructor(options) {
    this.root = options.root
    this.cache = {}
  }
  load(album){
    return new Promise((resolve, reject)=>{
      var coverPath = this.getCached(album)
      if(coverPath){
        resolve(coverPath)
      }else{
        async.detect(album.tracks, (item, cb)=>{
          this.getCoverFromFile(album, item, cb)
        }, (result)=>{
          resolve(result ? this.getAlbumCoverPath(album) : null)
        })        
      }
    })
  }
  getCoverFromFile(album, file, callback){
    var stream
    musicmetadata(stream = fs.createReadStream(file.filename), (err, metadata)=> {
      if (err) throw err
      if(metadata.picture.length){
        this.saveImageFromBuffer(metadata.picture[0], album)
        .then(callback)
        .catch((err)=>{
          console.error('Error saving cover for ' + album, err.stack)
        })
      }else{
        callback(false)
      }
    })
  }
  saveImageFromBuffer(picture, album){
    return new Promise((resolve, reject)=>{
      fs.writeFile(path.join(this.root, album.id + '.' + picture.format), picture.data, (err)=>{
        if(err) reject(err)
        resolve(true)
      })
    })
  }
  getAlbumCoverPath(album){
    return path.join(this.root, album.id + '.jpg')
  }
  getCached(album){
    var coverPath = this.getAlbumCoverPath(album)
    try{
      fs.statSync(coverPath)
    }catch(e){
      return false
    }
    return coverPath
  }
}