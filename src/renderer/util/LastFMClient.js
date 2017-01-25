'use babel';

import Promise from 'bluebird';
import { shell } from 'electron';
import { EventEmitter } from 'events';
import { LastFmNode } from 'lastfm';

module.exports = class LastFMClient extends EventEmitter {
  constructor(options) {
    super(options);
    this.key = options.key;
    this.secret = options.secret;
    this.sessionInfo = options.sessionInfo;
    this.authURL = options.authURL;
    this.useragent = options.useragent;
    this.lastfm = new LastFmNode({
      api_key: this.key,
      secret: this.secret,
      useragent: this.useragent,
    });
    this.token = null;

    if (this.sessionInfo) {
      this.session = this.lastfm.session({
        user: this.sessionInfo.user,
        key: this.sessionInfo.key,
      });
    } else {
      this.session = null;
    }
  }
  isAuthorised() {
    return this.session && this.session.isAuthorised();
  }
  signout() {
    this.session = null;
    this.emit('signout');
  }
  authorise() {
    return this.requestToken()
      .then((data) => {
        this.token = data.token;
        this.openAuthPage();
        this.session = this.lastfm.session({
          token: this.token,
          handlers: {
            success: () => this.emit('authorised'),
          },
        });
      })
      .catch(error => console.error(error, error.stack)) // eslint-disable-line
  }
  requestToken() {
    return new Promise((resolve, reject) => {
      this.lastfm.request('auth.getToken', {
        handlers: {
          success: resolve,
          error: reject,
        },
      });
    });
  }
  openAuthPage() {
    shell.openExternal(`${this.authURL}?api_key=${this.key}&token=${this.token}`);
  }
  scrobble(track) {
    if (!this.isAuthorised()) {
      return;
    }
    this.lastfm.update('scrobble', this.session, {
      track: track.metadata.title,
      artist: track.metadata.artist,
      album: track.metadata.album,
      timestamp: Math.floor((new Date()).getTime() / 1000),
      handlers: {
        success: () => this.emit('scrobbledTrack', track),
        error: error => console.error(error, error.stack) // eslint-disable-line
      },
    });
  }
};
