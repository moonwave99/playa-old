"use babel"

var _ = require('lodash')
var fs = require('fs-extra')
var path = require('path')
var async = require('async')
var musicmetadata = require('musicmetadata')
var Promise = require('bluebird')
var needle = Promise.promisifyAll(require('needle'))

module.exports = class CoverLoader {
  constructor(options) {
    this.root = options.root
    this.discogs = options.discogs
    this.enableLog = !!options.enableLog
    this.notFound = []
    this.requestQueue = async.queue((album, callback)=>{
      setTimeout(()=>{
        this.loadCoverFromDiscogs(album)
          .then((cover)=>{
            callback()
          })
          .catch(callback)
      }, this.discogs.throttle)
    }, 1)
  }
  load(album){
    return new Promise((resolve, reject)=>{
      var coverPath = this.getCached(album)
      if(coverPath){
        resolve(coverPath)
      }else if(_.contains(this.notFound, album.id)){
        this.log('Skipping req for: ' + album.title)
        reject(coverPath)
      }else{
        this.requestQueue.push(album, (err)=>{
          if(err){
            reject(err)
          }else{
            resolve(this.getAlbumCoverPath(album))
          }
        })
      }
    })
  }
  loadCoverFromMetadata(album){
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
  loadCoverFromDiscogs(album){
    var title = album.getTitle()
    this.log('Looking up for ' + title)
    return needle.requestAsync('get', 'https://api.discogs.com/database/search', {
      q: album.getArtist() + ' ' + title,
      key: this.discogs.key,
      secret: this.discogs.secret
    }).then((response)=>{
      this.log('Successful request: ' + response[0].req.path)
      if(!response[1].results.length){
        throw new Error('No results for: ' + title)
      }else{
        this.log('Found ' + title, response)
        var thumbResult = _.find(response[1].results, (result) => {
          return result.thumb.length > 0
            && _.contains(['release', 'master'], result.type)
        })
        if(!thumbResult)
          throw new Error('No results for: ' + title)
        return needle.getAsync(thumbResult.thumb)
      }
    }).then((response)=>{
      return this.saveImageFromBuffer(response[1], 'jpg', album)
    }).catch((err)=>{
      this.notFound.push(album.id)
      throw err
    })
  }
  getCoverFromFile(album, file, callback){
    var stream
    musicmetadata(stream = fs.createReadStream(file.filename), (err, metadata)=> {
      if (err) throw err
      if(metadata.picture.length){
        this.saveImageFromBuffer(metadata.picture[0].data, metadata.picture[0].format, album)
        .then(callback)
        .catch((err)=>{
          console.error('Error saving cover for ' + album, err.stack)
        })
      }else{
        callback(false)
      }
    })
  }
  saveImageFromBuffer(buffer, format, album){
    return new Promise((resolve, reject)=>{
      var targetPath = this.getAlbumCoverPath(album, format)
      fs.writeFile(targetPath, buffer, (err)=>{
        if(err){
          reject(err)
        }else{
          this.log('Saved ' + targetPath + ' [' + album.getArtist() + ' - ' + album.getTitle() + ']')
          resolve(targetPath)
        }
      })
    })
  }
  getAlbumCoverPath(album, format){
    format = format || 'jpg'
    return path.join(this.root, album.id + '.' + format)
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
  log(message, response){
    this.enableLog && (response ? console.info(message, response) : console.info(message))
  }
}
