"use babel"

var _ = require('lodash')
var md5 = require('MD5')
var AlbumPlaylist = require('./AlbumPlaylist')

module.exports = class OpenPlaylistManager {
  constructor(options) {
    this.loader = options.loader
    this.playlists = []
    this.selectedIndex = -1
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
    return this.playlists[this.selectedIndex]
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
  removeFiles(ids, playlist){
    playlist = playlist || this.getSelectedPlaylist()
    playlist && playlist.removeItems(ids)
  }
  save(playlist){
    playlist = playlist || this.getSelectedPlaylist()
    if(playlist){
      return this.loader.save(playlist).then((file)=>{
        console.info('Saved ' + playlist.id)
      })
    }else{
      return Promise.reject('Could not save playlist.')
    }
  }
  close(playlist){
    playlist = playlist || this.getSelectedPlaylist()
    if(playlist){
      playlist.clear()
      this.playlists = this.playlists.filter( p => p.id !== playlist.id )
      if(!this.playlists.length){
        this.playlists.push(
          new AlbumPlaylist({ title: 'Untitled', id: md5('Untitled' + playa.options.settings.playlistExtension) })
        )
      }
      var nextPlaylist = this.getAt(Math.max(this.selectedIndex -1, 0))
      if(nextPlaylist){
        return this._select(nextPlaylist)
      }else{
        Promise.resolve(true)
      }
    }
  }
  _select(playlist, index){
    if(!playlist){
      return Promise.reject('Playlist not found')
    }
    var index = _.isNumber(index) ? index : _.findIndex(this.playlists, p => p.id == playlist.id)
    if(index < 0){
      return Promise.reject('Could not select playlist at index: ' + index)
    }else{
      return this.loader.load(playlist).then((playlist)=>{
        this.selectedIndex = index
      })
    }
  }
}
