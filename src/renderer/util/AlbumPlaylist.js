'use babel';

import path from 'path';
import _, { flatten, find, findWhere, findIndex, where } from 'lodash';
import Promise from 'bluebird';
import fs from 'fs-extra';
import md5 from 'md5';
import uid from 'uid';
import DoublyLinkedList from 'doubly-linked-list-js';
import PlaylistItem from './PlaylistItem';
import Album from './Album';

Promise.promisifyAll(fs);

const processArtist = function processArtist(metadata) {
  if (metadata.albumartist.match(/various/i)) {
    return 'Various';
  }
  return metadata.albumartist
    ? metadata.albumartist
    : metadata.artist;
};

module.exports = class AlbumPlaylist {
  constructor(options) {
    this.items = new DoublyLinkedList();
    this.id = options.id || uid();
    this.path = options.path;
    this.ext = this.isNew() ? '.yml' : path.extname(this.path);
    this.title = this.isNew() ? 'Untitled' : path.basename(this.path, this.ext);
    this.loaded = false;
    this.lastPlayedAlbumId = null;
    this.lastPlayedTrackId = null;
    this.lastScrolledAlbumId = null;
    this.openAlbums = [];
  }
  setPath(_path) {
    this.path = _path;
  }
  setId(id) {
    this.id = id;
  }
  setTitle(title) {
    this.title = title;
  }
  getFirst() {
    return this.items.getFirst();
  }
  getLast() {
    return this.items.getLast();
  }
  getPrevious(album) {
    return this.items.getPrevious(album);
  }
  getNext(album) {
    return this.items.getNext(album);
  }
  getFileList() {
    return flatten(
      this.items.toArray().map(i => i.tracks.map(t => t.filename))
    );
  }
  getItems(opts) {
    const items = this.items.toArray();
    return opts ? where(items, opts) : items;
  }
  getLength() {
    return this.items.getLength();
  }
  getIds() {
    return this.items.toArray().map(i => i.id);
  }
  getAlbumById(id) {
    return findWhere(this.items.toArray(), { id });
  }
  getTrackById(id) {
    const tracks = flatten(this.items.toArray().map(i => i.tracks));
    return findWhere(tracks, { id });
  }
  getAlbumByTrackId(id) {
    return find(this.items.toArray(), a => a.contains(id));
  }
  getLastPlayedAlbum() {
    return this.getAlbumById(this.lastPlayedAlbumId);
  }
  find(buffer) {
    return find(this.items.toArray(), a =>
      a.getArtist().toLowerCase().startsWith(buffer)
      || a.getTitle().toLowerCase().startsWith(buffer)
    );
  }
  getStats() {
    const albums = this.getItems();
    return albums.reduce((memo, album) => {
      const { tracks, totalTime } = album.getStats();
      return {
        tracks: memo.tracks + tracks,
        totalTime: memo.totalTime + totalTime,
        albums: memo.albums,
      };
    }, {
      tracks: 0,
      totalTime: 0,
      albums: albums.length,
    });
  }
  isNew() {
    return !this.path;
  }
  load(files, opts = {}) {
    if ((this.loaded && !opts.force) || this.isNew()) {
      return Promise.resolve(this);
    }
    return playa.mediaFileLoader
      .loadFiles(files, opts)
      .then((results) => {
        this.process(results, opts);
        this.loaded = true;
        return this;
      });
  }
  removeItems(ids = []) {
    ids.forEach(id => this.items.removeAt(this.indexOf(id)));
  }
  addFolder(folder) {
    return playa.mediaFileLoader.loadFolder(folder)
      .bind(this)
      .then(files => this.process(files));
  }
  addFolderAtPosition(folder, positionId) {
    return playa.mediaFileLoader.loadFolder(folder)
      .bind(this)
      .then(files => this.process(files, { insertAt: positionId }));
  }
  clear() {
    this.items = new DoublyLinkedList();
    this.loaded = false;
  }
  indexOf(id) {
    return findIndex(this.getItems(), { id });
  }
  findAlbumByTrackId(id) {
    return find(this.items.toArray(), album => album.contains(id));
  }
  reorder(albumFromId, albumToId, position) {
    const albumFrom = this.getAlbumById(albumFromId);
    const indexFrom = this.indexOf(albumFromId);
    let indexTo = this.indexOf(albumToId);

    if (position === 'after') {
      indexTo += 1;
    }
    if (indexTo >= this.items.getLength()) {
      this.items.add(albumFrom);
    } else {
      this.items.addAt(albumFrom, indexTo);
    }
    if (indexFrom > indexTo) {
      this.items.removeAt(indexFrom + 1);
    } else {
      this.items.removeAt(indexFrom);
    }
  }
  rename(to) {
    const newPath = path.join(
      path.dirname(this.path),
      to + this.ext,
    );
    return new Promise((resolve, reject) => {
      fs.statAsync(newPath)
        .bind(this)
        .then(() => reject(new Error('File already exists')))
        .catch(() =>
          fs.moveAsync(this.path, newPath)
            .bind(this)
            .then(() => {
              this.title = to;
              this.path = newPath;
              resolve();
            }),
        );
    });
  }
  hydrate(data) {
    this.title = data.title;
    this.lastPlayedAlbumId = data.lastPlayedAlbumId;
    this.lastPlayedTrackId = data.lastPlayedTrackId;
    this.lastScrolledAlbumId = data.lastScrolledAlbumId;
    this.openAlbums = data.openAlbums || [];
    return this;
  }
  serialize() {
    return {
      title: this.title,
      lastPlayedAlbumId: this.lastPlayedAlbumId || null,
      lastPlayedTrackId: this.lastPlayedTrackId || null,
      lastScrolledAlbumId: this.lastScrolledAlbumId || null,
      openAlbums: this.openAlbums || [],
      tracklist: this.getFileList() || [],
    };
  }
  serializeForRemote() {
    return {
      id: this.id,
      title: this.title,
      albums: this.getItems({ disabled: false })
        .map(album => album.serializeForRemote()),
    };
  }
  process(results, opts = {}) {
    // #TODO create PlaylistItems here, use _.reduce, _.memoize, ASCII normalisation
    // (#SEE http://stackoverflow.com/questions/286921/efficiently-replace-all-accented-characters-in-a-string )
    const processedAlbums = _(results)
      .groupBy((r) => {
        if (r.isFulfilled()) {
          const track = r.value();
          const artist = processArtist(track.metadata);
          return (artist + track.metadata.album).toLowerCase();
        }
        return path.dirname(r.reason());
      })
      .map((album) => {
        let candidateTrack = null;
        const tracks = album.map((track) => {
          if (track.isFulfilled()) {
            const t = new PlaylistItem(track.value());
            if (candidateTrack == null) {
              candidateTrack = t;
            }
            return t;
          }
          return new PlaylistItem({
            filename: track.reason(),
            disabled: true,
          });
        });
        const sortedTracks = _(tracks)
          .sortBy(t => (t.getDiscNumber() * 1000) + t.metadata.track)
          .value();
        return new Album({
          id: ['a',
            candidateTrack
              ? md5(
                  path.dirname(candidateTrack.filename)
                  + candidateTrack.metadata.artist
                  + candidateTrack.metadata.album
                )
              : md5(path.dirname(tracks[0].filename)),
          ].join('_'),
          tracks: sortedTracks,
          disabled: !candidateTrack,
        });
      }).value();

    if (opts.insertAt) {
      this.items.addArrayAt(processedAlbums, this.indexOf(opts.insertAt));
    } else {
      if (opts.force) {
        this.items = new DoublyLinkedList();
      }
      processedAlbums.forEach(a => this.items.add(a));
    }
    return this;
  }
};
