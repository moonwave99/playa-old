import { EventEmitter } from 'events';
import Promise from 'bluebird';
import groove from 'groove';
import md5 from 'md5';
import { find, findIndex } from 'lodash';

groove.setLogging(groove.LOG_ERROR);

const formatTrackId = function formatTrackId(filename) {
  return `t_${md5(filename)}`;
};

const closeFile = function closeFile(file) {
  return new Promise((resolve, reject) => {
    const filename = file.filename;
    file.close((err) => {
      if (err) {
        reject(err);
      } else {
        resolve(filename);
      }
    });
  });
};

const openTrack = function openTrack(filename) {
  return new Promise((resolve, reject) =>
    groove.open(filename, (err, file) => {
      if (err) {
        reject(err);
      } else {
        resolve(file);
      }
    })
  );
};

export default class Player extends EventEmitter {
  constructor({
    mediaFileLoader,
    resolution = 1000,
    scrobbleThreshold,
  }) {
    super();
    this.mediaFileLoader = mediaFileLoader;
    this.resolution = resolution;
    this.scrobbleThreshold = scrobbleThreshold;
    this.player = groove.createPlayer();
    this.player.useExactAudioFormat = true;
    this.player.on('nowplaying', this.onNowplaying.bind(this));
    this.groovePlaylist = groove.createPlaylist();
    this.timer = null;
    this.attached = false;
    this.loading = false;
    this.playing = false;
    this.alreadyScrobbled = false;
    this.currentPlaylist = null;
    this.currentAlbum = null;
    this.currentTrack = null;
    this.lastPlayedTrack = null;
    this.lastAction = null;
    this.playbackDirection = 0;
    this.currentTrackPlayedAmount = 0;
  }
  startTimer() {
    if (this.timer) {
      return;
    }
    this.timer = setInterval(() => {
      this.checkScrobble();
      this.emit('playerTick');
    }, this.resolution);
  }
  clearTimer() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.currentTrackPlayedAmount = 0;
    this.alreadyScrobbled = false;
    this.timer = null;
  }
  checkScrobble() {
    if (!this.currentTrack || this.alreadyScrobbled) {
      return;
    }
    const amount = this.currentTrackPlayedAmount += (this.resolution * 0.001);
    const absoluteScrobbled = amount > this.scrobbleThreshold.absolute;
    const relativeScrobbled = amount / this.currentTrack.duration > this.scrobbleThreshold.percent;
    if (absoluteScrobbled || relativeScrobbled) {
      this.emit('scrobbleTrack', this.currentTrack, this.currentTrackPlayedAmount);
      this.alreadyScrobbled = true;
    }
  }
  attach() {
    return new Promise((resolve, reject) => {
      if (this.attached) {
        resolve(true);
      } else if (!this.groovePlaylist) {
        reject(new Error('No playlist set!'));
      } else {
        this.player.attach(this.groovePlaylist, (err) => {
          if (err) {
            reject(err);
          } else {
            this.attached = true;
            resolve(true);
          }
        });
      }
    });
  }
  detach() {
    return new Promise((resolve, reject) => {
      if (!this.attached) {
        resolve(true);
      } else if (!this.groovePlaylist) {
        reject(new Error('No playlist to detach!'));
      } else {
        this.player.detach((err) => {
          if (err) {
            reject(err);
          } else {
            this.attached = false;
            resolve(true);
          }
        });
      }
    });
  }
  onNowplaying() {
    if (this.loading) {
      return;
    }
    const current = this.groovePlaylist.position();
    if (current.item) {
      this.alreadyScrobbled = false;
      if (!this.lastPlayedTrack) {
        this.lastPlayedTrack = current.item.file.metadata();
      } else {
        const _lastPlayedTrack = current.item.file.metadata();
        this.playbackDirection = this.lastPlayedTrack.track <= _lastPlayedTrack.track ? 1 : -1;
        this.lastPlayedTrack = _lastPlayedTrack;
      }
      if (!this.timer) {
        this.startTimer();
      }
      this.currentTrack = this.currentAlbum.findById(formatTrackId(current.item.file.filename));
      this.emit('nowplaying');
    } else if (this.playbackDirection === 0) {
      if (this.lastAction === 'prev') {
        this.prevAlbum();
      } else {
        this.nextAlbum();
      }
    } else if (this.playbackDirection > 0) {
      this.prevAlbum();
    } else {
      this.nextAlbum();
    }
  }
  playbackInfo() {
    if (!this.groovePlaylist) {
      return null;
    }
    const info = this.groovePlaylist.position();
    return {
      position: info.pos,
      playing: this.playing,
      currentTrack: this.currentTrack,
      currentAlbum: this.currentAlbum,
    };
  }
  play() {
    this.attach().then(() => {
      if (this.groovePlaylist.count() === 0) {
        return false;
      }
      this.startTimer();
      this.playing = true;
      this.groovePlaylist.play();
      return true;
    });
  }
  pause() {
    this.groovePlaylist.pause();
    this.playing = false;
    this.clearTimer();
  }
  nextTrack() {
    this.lastAction = 'next';
    const items = this.groovePlaylist.items();
    const current = this.groovePlaylist.position();
    const currentIndex = findIndex(items, item => item.id === current.item.id);
    if (currentIndex < items.length - 1) {
      this.clearTimer();
      this.groovePlaylist.seek(items[currentIndex + 1], 0);
      return true;
    }
    return this.nextAlbum();
  }
  prevTrack() {
    this.lastAction = 'prev';
    const items = this.groovePlaylist.items();
    const current = this.groovePlaylist.position();
    const currentIndex = findIndex(items, item => item.id === current.item.id);
    if (currentIndex > 0) {
      this.clearTimer();
      this.groovePlaylist.seek(items[currentIndex - 1], 0);
      return true;
    }
    return this.prevAlbum();
  }
  gotoTrack(id = this.currentAlbum.tracks[0].id) {
    const item = find(
      this.groovePlaylist.items(),
      _item => id === formatTrackId(_item.file.filename),
    );
    if (!item) {
      return;
    }
    this.clearTimer();
    this.currentTrack = this.currentAlbum.findById(id);
    this.emit('trackChange');
    this.groovePlaylist.seek(item, 0);
    if (!this.groovePlaylist.playing()) {
      this.play();
    }
  }
  seek(to) {
    if (!this.groovePlaylist) {
      return;
    }
    this.currentTrackPlayedAmount = 0;
    const current = this.groovePlaylist.position();
    const seekToSecond = current.item.file.duration() * to;
    if (current.item) {
      this.groovePlaylist.seek(current.item, seekToSecond);
    }
  }
  nextAlbum() {
    const nextAlbum = this.currentPlaylist.getNext(this.currentAlbum);
    if (!nextAlbum) {
      return false;
    }
    return this.loadAlbum(nextAlbum);
  }
  prevAlbum() {
    const prevAlbum = this.currentPlaylist.getPrevious(this.currentAlbum);
    if (!prevAlbum) {
      return false;
    }
    return this.loadAlbum(prevAlbum);
  }
  insert(file) {
    this.groovePlaylist.insert(file);
    if (this.playing && !this.attached) {
      this.groovePlaylist.pause();
    }
  }
  remove(file) {
    this.groovePlaylist.remove(file);
  }
  clearPlaylist() {
    const filesToClose = this.groovePlaylist.items().map(i => i.file);
    this.groovePlaylist.clear();
    return Promise.all(filesToClose.map(closeFile));
  }
  append(files) {
    files.forEach((file) => {
      if (!file) {
        return;
      }
      this.groovePlaylist.insert(file);
    });
  }
  loadAlbum(album) {
    const isNewAlbum = !this.currentAlbum || (this.currentAlbum.id !== album.id);
    if (!isNewAlbum) {
      this.emit('trackChange');
      return Promise.resolve(this.currentAlbum);
    }
    this.loading = true;
    return this.clearPlaylist()
      .then(() => Promise.settle(
        album.tracks.map(({ filename }) => openTrack(filename))
      ))
      .then((files) => {
        this.currentAlbum = album;
        const resolvedFiles = files.filter(f => f.isFulfilled()).map(f => f.value());
        return this.append(resolvedFiles);
      })
      .then(() => {
        this.loading = false;
        this.clearTimer();
        this.emit('trackChange');
        return album;
      });
  }
}
