import path from 'path';
import http from 'http';
import os from 'os';
import express from 'express';
import io from 'socket.io';
import { EventEmitter } from 'events';

export default class RemoteController extends EventEmitter {
  constructor(options = {}) {
    super();
    this.isActive = this.isActive.bind(this);
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
    this.getAddress = this.getAddress.bind(this);
    this.update = this.update.bind(this);
    this._initIO = this._initIO.bind(this);
    this._initExpress = this._initExpress.bind(this);
    this.started = false;
    this.defaultPort = 1337;
    this.port = options.port || this.defaultPort;
    this.data = {
      selectedPlaylist: {},
      playlists: [],
      playbackInfo: {},
    };
    this.serverOpts = {
      root: path.join(__dirname, 'ui'),
    };
    this.staticOpts = {
      index: 'remote.html',
    };
    this.window = options.window;
    this.coverPath = options.coverPath;
  }
  isActive() {
    return this.started;
  }
  start() {
    this.app = this._initExpress();
    if (!this.http) {
      this.http = http.createServer(this.app);
    }
    this.io = this._initIO(this.http);
    this.http.listen(this.port, () => {
      console.info(`Remote control listening at: ${this.getAddress()}`);  // eslint-disable-line
    });
    this.started = true;
    return this;
  }
  stop() {
    this.http.close(() => console.info('Remote control stopped.')); // eslint-disable-line
    this.started = false;
    return this;
  }
  // SEE: http://stackoverflow.com/a/9542157/1073758
  getAddress() {
    const ifaces = os.networkInterfaces();
    let ipAddress = '';
    Object.keys(ifaces)
      .forEach((ifname) => {
        const addresses = ifaces[ifname]
          .filter(iface => (iface.family === 'IPv4') && !iface.internal)
          .map(x => x.address);
        if (addresses.length) {
          ipAddress = addresses[0];
        }
      });
    return `http://${ipAddress}:${this.port}`;
  }
  update(data) {
    return Object.keys(this.data).forEach((key) => {
      if (data[key]) {
        this.data[key] = data[key];
        this.io.sockets.emit(key, this.data[key]);
      }
    });
  }
  _initIO(server) {
    if (this.io) {
      return this.io;
    }
    const socketIO = io(server);
    socketIO.on('connection', (socket) => {
      console.log('New incoming connection'); // eslint-disable-line
      Object.keys(this.data).forEach(key =>
        socket.emit(key, this.data[key])
      );
      return socket.on('control:playback', (data) => {
        switch (data.action) {
          case 'toggle': this.window.togglePlayback(); break;
          case 'prev': this.window.prevTrack(); break;
          case 'next': this.window.nextTrack(); break;
          case 'gotoAlbum': this.window.gotoAlbum(data); break;
          case 'gotoTrack': this.window.gotoTrack(data); break;
          case 'seekTo': this.window.seekTo(data); break;
          case 'selectPlaylist': this.window.selectPlaylist(data); break;
          default: break;
        }
      });
    });
    return socketIO;
  }
  _initExpress() {
    if (this.app) {
      return this.app;
    }
    const app = express();
    app.use(express.static(this.serverOpts.root, this.staticOpts));
    app.get('/', (req, res) => res.sendFile('remote.html', this.serverOpts));
    app.get('/js/:file(*)', (req, res) =>
      res.sendFile(path.resolve(__dirname, '../node_modules/', req.params.file))
    );
    app.get('/covers/:cover', (req, res) =>
      res.sendFile(path.resolve(this.coverPath, req.params.cover))
    );
    return app;
  }
}
