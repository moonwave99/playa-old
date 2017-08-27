import _, { find, findIndex, uniq, findWhere } from 'lodash';
import path from 'path';
import AlbumConstants from '../../constants/AlbumConstants';

export const isCompilation = function isCompilation(album) {
  return (
    album.tracks[0].metadata.albumartist
    && album.tracks[0].metadata.albumartist.match(/various/i)
  ) || album._artists.length > AlbumConstants.VARIOUS_ARTISTS_THRESHOLD;
};

export const isMultiple = function isMultiple(album) {
  return uniq(album.tracks.map(t => t.getDiscNumber())).length > 1;
};

export const findValue = function findValue(tracks, key, defaultValue) {
  const foundTrack = find(tracks, t => t.metadata[key]);
  if (foundTrack) {
    return foundTrack.metadata[key];
  }
  return defaultValue;
};

export default class Album {
  constructor({ id, tracks = [], disabled = false }) {
    this.id = id;
    this.tracks = tracks;
    this._folder = this.tracks.length && path.dirname(this.tracks[0].filename);
    this.disabled = disabled;
    this._artists = [];
    if (this.disabled) {
      return;
    }
    this._title = findValue(this.tracks, 'album', AlbumConstants.NO_ALBUM);
    this._year = findValue(this.tracks, 'year', 0);
    this._artists = _(this.tracks.map(t => t.metadata.artist))
      .uniq(a => (a || '').toLowerCase())
      .compact()
      .value();
    this._isCompilation = isCompilation(this);
    this._isMultiple = isMultiple(this);
    this._isSplit = this.getArtistCount() > 1 && !this.isCompilation();
  }
  contains(id) {
    return this.tracks.map(i => i.id).indexOf(id) > -1;
  }
  findById(id) {
    return findWhere(this.tracks, { id });
  }
  findNextById(id) {
    const currentIndex = findIndex(this.tracks, { id });
    if (currentIndex === this.tracks.length - 1) {
      return null;
    }
    return this.tracks[currentIndex + 1];
  }
  findPrevById(id) {
    const currentIndex = findIndex(this.tracks, { id });
    if (currentIndex === 0) {
      return null;
    }
    return this.tracks[currentIndex - 1];
  }
  isCompilation() {
    return this._isCompilation;
  }
  isMultiple() {
    return this._isMultiple;
  }
  getTitle() {
    return this._title;
  }
  getArtistCount() {
    return this._artists.length;
  }
  getArtist() {
    return this._isCompilation
      ? AlbumConstants.VARIOUS_ARTISTS_LABEL
      : this._artists.join(', ');
  }
  getYear() {
    return this._year;
  }
  getStats() {
    return this.tracks.reduce(({ tracks, totalTime }, track) => {
      if (track.disabled) {
        return { tracks, totalTime };
      }
      return {
        tracks: tracks + 1,
        totalTime: totalTime + track.duration,
      };
    }, {
      tracks: 0,
      totalTime: 0,
    });
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
