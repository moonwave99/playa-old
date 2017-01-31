import path from 'path';
import { contains, find } from 'lodash';
import fs from 'fs-extra';
import async from 'async';
import musicmetadata from 'musicmetadata';
import Promise from 'bluebird';
import needle from 'needle';

Promise.promisifyAll(fs);
Promise.promisifyAll(needle);

export default class CoverLoader {
  constructor({ root, discogs = {}, enableLog = false }) {
    this.root = root;
    this.discogs = discogs;
    this.enableLog = enableLog;
    this.notFound = [];
    this.requestQueue = async.queue((album, callback) =>
      setTimeout(() =>
        this.loadCoverFromDiscogs(album)
          .then(() => callback())
          .catch(callback)
      , this.discogs.throttle)
    , 1);
  }
  load(album) {
    return new Promise((resolve, reject) => {
      const coverPath = this.getCached(album);
      if (coverPath) {
        resolve(coverPath);
      } else if (contains(this.notFound, album.id)) {
        this.log(`Skipping req for: ${album.title}`);
        reject(coverPath);
      } else {
        this.requestQueue.push(album, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(this.getAlbumCoverPath(album));
          }
        });
      }
    });
  }
  loadCoverFromMetadata(album) {
    return new Promise((resolve) => {
      const coverPath = this.getCached(album);
      if (coverPath) {
        resolve(coverPath);
      } else {
        async.detect(album.tracks, (item, cb) => {
          this.getCoverFromFile(album, item, cb);
        }, (result) => {
          resolve(result ? this.getAlbumCoverPath(album) : null);
        });
      }
    });
  }
  loadCoverFromDiscogs(album) {
    const title = album.getTitle();
    this.log(`Looking up for ${title}`);
    return needle.requestAsync('get', this.discogs.apiRoot, {
      q: `${album.getArtist()} ${title}`,
      key: this.discogs.key,
      secret: this.discogs.secret,
    }).then((response) => {
      this.log(`Successful request: ${response[0].req.path}`);
      if (!response[1].results.length) {
        throw new Error(`No results for: ${title}`);
      } else {
        this.log(`Found ${title}`, response);
        const thumbResult = find(response[1].results, result =>
          result.thumb.length > 0 && contains(['release', 'master'], result.type)
        );
        if (!thumbResult) {
          throw new Error(`No results for: ${title}`);
        }
        return needle.getAsync(thumbResult.thumb);
      }
    }).then(response => this.saveImageFromBuffer(response[1], 'jpg', album)
    ).catch((err) => {
      this.notFound.push(album.id);
      throw err;
    });
  }
  getCoverFromFile(album, file, callback) {
    const stream = fs.createReadStream(file.filename);
    musicmetadata(stream, (err, metadata) => {
      if (err) {
        throw err;
      }
      if (metadata.picture.length) {
        const pic = metadata.picture[0];
        this.saveImageFromBuffer(pic.data, pic.format, album)
          .then(callback)
          .catch(saveErr => console.error(`Error saving cover for ${album}`, saveErr.stack)); // eslint-disable-line
      } else {
        callback(false);
      }
    });
  }
  saveImageFromBuffer(buffer, format, album) {
    return new Promise((resolve, reject) => {
      const targetPath = this.getAlbumCoverPath(album, format);
      fs.writeFile(targetPath, buffer, (err) => {
        if (err) {
          reject(err);
        } else {
          this.log(`Saved ${targetPath} [${album.getArtist()} - ${album.getTitle()}]`);
          resolve(targetPath);
        }
      });
    });
  }
  getAlbumCoverPath(album, format = 'jpg') {
    return path.join(this.root, `${album.id}.${format}`);
  }
  getCached(album) {
    const coverPath = this.getAlbumCoverPath(album);
    try {
      fs.statSync(coverPath);
    } catch (e) {
      return false;
    }
    return coverPath;
  }
  log(message, response) {
    if (!this.enableLog) {
      return;
    }
    response ? console.info(message, response) : console.info(message); // eslint-disable-line
  }
}
