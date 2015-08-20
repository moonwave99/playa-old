"use babel"

var _ = require('lodash')
var md5 = require('MD5')
var AlbumPlaylist = require('./AlbumPlaylist')

module.exports = class OpenPlaylistManager {
  constructor(options) {
    this.loader = options.loader
    this.mediaFileLoader = options.mediaFileLoader
    this.playlists = []
    this.selectedId = null
    this.activeIndex = -1
  }
  selectByIndex(index){
    var playlist = this.playlists[index]
    return this._select(playlist, index)
  }
  selectById(id){
    var playlist = this.findBy('id', id)
    return this._select(playlist)
  }
  getSelectedPlaylist(){
    return _.findWhere(this.playlists, { id: this.selectedId })
  }
  getSelectedIndex(){
    return _.findIndex(this.playlists, {id: this.selectedId })
  }
  getAll(){
    return this.playlists
  }
  getAt(index){
    return this.playlists[index]
  }
  findBy(key, value){
    var query = {}
    query[key] = value
    return _.find(this.playlists, query)
  }
  update(id, values){
    var playlist = this.findBy('id', id)
    if(playlist){
      _.forEach(values, (value, key)=>{
        playlist[key] = value
      })
    }
    return playlist
  }
  locateFolder(id, files, newFolder){
    var playlist = this.findBy('id', id)
    if(playlist){
      return playlist.addFolder(newFolder)
    }else{
      return Promise.reject('Could not find playlist with id: ' + id)
    }
  }
  newPlaylist(){
    return new AlbumPlaylist({
      title: 'Untitled',
      id: md5('Untitled' + playa.getSetting('common', 'playlistExtension'))
    })
  }
  add(playlists){
    var newPlaylists = _.difference(playlists.map( i => i.id), this.playlists.map(i => i.id))
    this.playlists = this.playlists.concat(playlists.filter((p)=>{
      return newPlaylists.indexOf(p.id) > -1
    }))
  }
  addFolder(folder, playlist){
    playlist = playlist || this.getSelectedPlaylist()
    if(folder && playlist) {
      return playlist.addFolder(folder).catch((err)=>{
        console.error(err, err.stack)
      })
    }else{
      return Promise.reject('Could not add folder to playlist.')
    }
  }
  addFolderAtPosition(folder, position, playlist){
    playlist = playlist || this.getSelectedPlaylist()
    if(folder && playlist) {
      return playlist.addFolderAtPosition(folder, position).catch((err)=>{
        console.error(err, err.stack)
      })
    }else{
      return Promise.reject('Could not add folder to playlist at position.')
    }
  }
  reorder(id, from, to, position){
    var playlist = this.findBy('id', id)
    if(!playlist){
      return false
    }
    playlist.reorder(from, to, position)
    return true
  }
  reload(playlist){
    playlist = playlist || this.getSelectedPlaylist()
    if(!playlist){
      return Promise.reject('Could not reload playlist.')
    }else{
      return this.load(playlist.id, { force: true })
    }
  }
  removeFiles(ids, playlist){
    playlist = playlist || this.getSelectedPlaylist()
    if(playlist){
      var filesToRemove = _.reduce(ids, (memo, id)=>{
        return memo.concat(
          playlist.getAlbumById(id).tracks.map( t => t.filename )
        )
      }, [])
      playlist.removeItems(ids)
      this.mediaFileLoader.invalidate(filesToRemove)
    }
  }
  save(playlist){
    playlist = playlist || this.getSelectedPlaylist()
    var wasNew = playlist.isNew()
    var id = playlist.id
    if(playlist){
      return this.loader.save(playlist).then((playlist)=>{
        console.info('Saved ' + playlist.id, playlist)
        if(wasNew && id == this.selectedId){
          this.selectedId = playlist.id
        }
        return playlist
      })
    }else{
      return Promise.reject('Could not save playlist.')
    }
  }
  close(playlist){
    playlist = playlist || this.getSelectedPlaylist()
    if(playlist){
      var currentIndex = this.getSelectedIndex()
      playlist.clear()
      this.playlists = this.playlists.filter( p => p.id !== playlist.id )
      if(!this.playlists.length){
        this.playlists.push(this.newPlaylist())
      }
      var nextPlaylist = this.getAt(Math.max(currentIndex-1, 0))
      if(nextPlaylist){
        return this._select(nextPlaylist)
      }else{
        return true
      }
    }
  }
  load(id, opts){
    var playlist = _.find(this.playlists, p => p.id == id)
    if(!playlist){
      return Promise.reject('Could not select playlist widh id: ' + id)
    }else if(playlist.isNew()){
      playlist.loaded = true
      return Promise.resolve(playlist)
    }
    return this.loader.load(playlist, opts).then((playlist)=>{
      console.info('Loaded ' + playlist.id, playlist)
    })
  }
  _select(playlist, index){
    if(!playlist){
      return false
    }
    var index = _.isNumber(index) ? index : _.findIndex(this.playlists, p => p.id == playlist.id)
    if(index < 0){
      return false
    }else{
      this.selectedId = playlist.id
      return true
    }
  }
}
