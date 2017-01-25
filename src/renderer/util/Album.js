'use babel';

import _, { find, uniq, findWhere } from 'lodash';
import path from 'path';
import AlbumConstants from '../constants/AlbumConstants';

const isCompilation = function isCompilation(album) {
  return (
    album.tracks[0].metadata.albumartist
    && album.tracks[0].metadata.albumartist.match(/various/i)
  ) || album._artists.length > AlbumConstants.VARIOUS_ARTISTS_THRESHOLD;
};

export default class Album {
  constructor({ id, tracks = [], disabled = false }) {
    this.id = id;
    this.tracks = tracks;
    this._folder = this.tracks.length && path.dirname(this.tracks[0].filename);
    this.disabled = disabled;
    if (this.disabled) {
      this._artists = [];
      return;
    }
    this._title = find(this.tracks, t => t.metadata.album).metadata.album
      || AlbumConstants.NO_ALBUM;
    this._year = +find(this.tracks, t => t.metadata.year).metadata.year;
    this._artists = _(this.tracks.map(t => t.metadata.artist))
      .uniq(a => (a || '').toLowerCase())
      .compact()
      .value();
    this._isCompilation = isCompilation(this);
    this._isSplit = this._artists.length > 1 && !this._isCompilation;
    this._isMultiple = uniq(this.tracks.map(t => t.getDiscNumber())).length > 1;
  }
  contains(id) {
    return this.tracks.map(i => i.id).indexOf(id) > -1;
  }
  findById(id) {
    return findWhere(this.tracks, { id });
  }
  isCompilation() {
    return !!this._isCompilation;
  }
  isMultiple() {
    return !!this._isMultiple;
  }
  getTitle() {
    return this._title;
  }
  getArtistCount() {
    return this._artists.length;
  }
  getArtist() {
    return this._isCompilation ? AlbumConstants.VARIOUS_ARTISTS_LABEL : this._artists.join(', ');
  }
  getYear() {
    return this._year;
  }
  getStats() {
    return this.tracks.reduce((memo, track) => {
      if (!track.disabled) {
        return memo;
      }
      return {
        tracks: memo.tracks + 1,
        totalTime: memo.totalTime + track.duration,
      };
    }, { tracks: 0, totalTime: 0 });
  }
  missingTracksCount() {
    return this.tracks.filter(t => t.disabled).length;
  }
  getFolder() {
    return this._folder;
  }
  serializeForRemote() {
    return {
      id: this.id,
      disabled: this.disabled,
      title: this.getTitle(),
      artist: this.getArtist(),
      year: this.getYear(),
      tracks: this.tracks.map(x => x.serializeForRemote()),
    };
  }
}
