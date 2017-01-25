'use babel';

import { difference, find, findIndex, findWhere, forEach, isNumber } from 'lodash';
import md5 from 'md5';
import AlbumPlaylist from './AlbumPlaylist';

const newPlaylist = function newPlaylist() {
  return new AlbumPlaylist({
    title: 'Untitled',
    id: md5(`Untitled${playa.getSetting('common', 'playlistExtension')}`),
  });
};

module.exports = class OpenPlaylistManager {
  constructor({ loader, mediaFileLoader }) {
    this.loader = loader;
    this.mediaFileLoader = mediaFileLoader;
    this.playlists = [];
    this.selectedId = null;
    this.activeIndex = -1;
  }
  selectByIndex(index) {
    const playlist = this.playlists[index];
    return this._select(playlist, index);
  }
  selectById(id) {
    const playlist = this.findBy('id', id);
    return this._select(playlist);
  }
  getSelectedPlaylist() {
    return findWhere(this.playlists, { id: this.selectedId });
  }
  getSelectedIndex() {
    return findIndex(this.playlists, { id: this.selectedId });
  }
  getAll() {
    return this.playlists;
  }
  getAt(index) {
    return this.playlists[index];
  }
  findBy(key, value) {
    return find(this.playlists, {
      [key]: value,
    });
  }
  update(id, values) {
    const playlist = this.findBy('id', id);
    if (playlist) {
      forEach(values, (value, key) => {
        playlist[key] = value;
      });
    }
    return playlist;
  }
  locateFolder(id, albumId, newFolder) {
    const playlist = this.findBy('id', id);
    if (!playlist) {
      return Promise.reject(`Could not find playlist with id: ${id}`);
    }
    const album = playlist.getAlbumById(albumId);
    const next = playlist.getNext(album);
    playlist.removeItems([albumId]);
    if (next) {
      return playlist.addFolderAtPosition(newFolder, next.id);
    }
    return playlist.addFolder(newFolder);
  }
  add(playlists) {
    const newPlaylists = difference(
      playlists.map(i => i.id),
      this.playlists.map(i => i.id)
    );
    this.playlists = this.playlists.concat(playlists.filter(
      p => newPlaylists.indexOf(p.id) > -1
    ));
  }
  addFolder(folder, playlist = this.getSelectedPlaylist()) {
    if (folder && playlist) {
      return playlist.addFolder(folder)
        .catch(err => console.error(err, err.stack)); // eslint-disable-line
    }
    return Promise.reject('Could not add folder to playlist.');
  }
  addFolderAtPosition(folder, position, playlist = this.getSelectedPlaylist()) {
    if (folder && playlist) {
      return playlist.addFolderAtPosition(folder, position)
        .catch(err => console.error(err, err.stack)); // eslint-disable-line
    }
    return Promise.reject('Could not add folder to playlist at position.');
  }
  reorder(id, from, to, position) {
    const playlist = this.findBy('id', id);
    if (!playlist) {
      return false;
    }
    playlist.reorder(from, to, position);
    return true;
  }
  reload(playlist = this.getSelectedPlaylist()) {
    if (!playlist) {
      return Promise.reject('Could not reload playlist.');
    }
    return this.load(playlist.id, { force: true });
  }
  removeFiles(ids, playlist = this.getSelectedPlaylist()) {
    if (!playlist) {
      return;
    }
    const filesToRemove = ids.reduce((memo, id) => memo.concat(
        playlist.getAlbumById(id).tracks.map(t => t.filename)
      )
    , []);
    playlist.removeItems(ids);
    this.mediaFileLoader.invalidate(filesToRemove);
  }
  save(playlist = this.getSelectedPlaylist()) {
    const wasNew = playlist.isNew();
    const id = playlist.id;
    if (!playlist) {
      return Promise.reject('Could not save playlist.');
    }
    return this.loader.save(playlist)
      .then((savedPlaylist) => {
        console.info(`Saved ${savedPlaylist.id}`, savedPlaylist); // eslint-disable-line
        if (wasNew && id === this.selectedId) {
          this.selectedId = savedPlaylist.id;
        }
        return savedPlaylist;
      });
  }
  close(playlist = this.getSelectedPlaylist()) {
    if (!playlist) {
      return false;
    }
    const currentIndex = this.getSelectedIndex();
    playlist.clear();
    this.playlists = this.playlists.filter(p => p.id !== playlist.id);
    if (!this.playlists.length) {
      this.playlists.push(newPlaylist());
    }
    const nextPlaylist = this.getAt(Math.max(currentIndex - 1, 0));
    if (nextPlaylist) {
      return this._select(nextPlaylist);
    }
    return true;
  }
  load(id, opts) {
    const playlist = find(this.playlists, p => p.id === id);
    if (!playlist) {
      return Promise.reject(`Could not select playlist widh id: ${id}`);
    } else if (playlist.isNew()) {
      playlist.loaded = true;
      return Promise.resolve(playlist);
    }
    return this.loader.load(playlist, opts)
      .then(loadedPlaylist => console.info(`Loaded ${loadedPlaylist.id}`, loadedPlaylist)); // eslint-disable-line
  }
  _select(playlist, index) {
    if (!playlist) {
      return false;
    }
    const foundIndex = isNumber(index)
      ? index
      : findIndex(this.playlists, p => p.id === playlist.id);
    if (foundIndex < 0) {
      return false;
    }
    this.selectedId = playlist.id;
    return true;
  }
};
