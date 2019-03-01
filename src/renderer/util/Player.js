import { EventEmitter } from 'events';
import Promise from 'bluebird';
import { encodePath } from '../util/helpers/url';

export default class Player extends EventEmitter {
  constructor({
    mediaFileLoader,
    resolution = 1000,
    scrobbleThreshold,
    audioElement,
  }) {
    super();
    this.mediaFileLoader = mediaFileLoader;
    this.resolution = resolution;
    this.scrobbleThreshold = scrobbleThreshold;
    this.timer = null;
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
    this.player = audioElement;
    this.player.onplaying = this.onPlaying.bind(this);
    this.player.onpause = this.onPause.bind(this);
    this.player.onended = this.onEnded.bind(this);
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
  onPause() {
    this.playing = false;
    this.clearTimer();
    this.emit('nowplaying');
  }
  onPlaying() {
    if (!this.timer) {
      this.startTimer();
    }
    this.playing = true;
    this.emit('nowplaying');
  }
  onEnded() {
    this.nextTrack();
  }
  playbackInfo() {
    return {
      position: this.player.currentTime,
      playing: this.playing,
      currentTrack: this.currentTrack,
      currentAlbum: this.currentAlbum,
    };
  }
  play() {
    this.player.play();
  }
  pause() {
    this.player.pause();
  }
  nextTrack() {
    this.lastAction = 'next';
    const nextTrack = this.currentAlbum.findNextById(this.currentTrack.id);
    if (!nextTrack) {
      return this.nextAlbum().then(() => {
        this.gotoTrack(this.currentAlbum.tracks[0].id);
      });
    }
    this.gotoTrack(nextTrack.id);
    return true;
  }
  prevTrack() {
    this.lastAction = 'prev';
    const prevTrack = this.currentAlbum.findPrevById(this.currentTrack.id);
    if (!prevTrack) {
      return this.prevAlbum().then(() => {
        this.gotoTrack(this.currentAlbum.tracks[0].id);
      });
    }
    this.gotoTrack(prevTrack.id);
    return true;
  }
  gotoTrack(id = this.currentAlbum.tracks[0].id) {
    const currentTrack = this.currentAlbum.findById(id);
    if (!currentTrack) {
      return;
    }
    this.currentTrack = currentTrack;
    this.player.src = encodePath(this.currentTrack.filename);
    this.play();
    this.emit('trackChange');
  }
  seek(to) {
    this.player.currentTime = this.player.duration * to;
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
  loadAlbum(album) {
    const isNewAlbum = !this.currentAlbum || (this.currentAlbum.id !== album.id);
    if (!isNewAlbum) {
      this.emit('trackChange');
      return Promise.resolve(this.currentAlbum);
    }
    this.currentAlbum = album;
    this.clearTimer();
    this.emit('trackChange');
    return Promise.resolve(album);
  }
}
