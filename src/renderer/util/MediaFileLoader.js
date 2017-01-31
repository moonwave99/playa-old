import { isArray, flatten } from 'lodash';
import fs from 'fs-extra';
import md5 from 'md5';
import path from 'path';
import mm from 'musicmetadata';
import glob from 'glob';
import Promise from 'bluebird';

import MetaDoctor from './MetaDoctor';

export default class MediaFileLoader {
  constructor({ fileExtensions, fileAmountThreshold = 0 }) {
    this.fileExtensions = fileExtensions;
    this.fileAmountThreshold = fileAmountThreshold;
    this.cache = {};
  }
  loadFiles(files, opts) {
    return Promise.settle(files.map(
      f => this.openFile(f, opts))
    );
  }
  loadFolder(folder) {
    const normalisedFolder = isArray(folder) ? folder : [folder];
    return Promise.all(normalisedFolder.map(f =>
      new Promise((resolve, reject) => {
        const pattern = `**/*.{${this.fileExtensions.join(',')}}`;
        glob(pattern, { cwd: f, nocase: true }, (err, files) => {
          if (err) {
            reject(err);
          } else {
            resolve(files.map(file => path.join(f, file)));
          }
        });
      })
    ))
    .then(files => Promise.settle(
      flatten(files).map(f => this.openFile(f)))
    )
    .catch(err => console.error(err, err.stack)); // eslint-disable-line
  }
  openFile(filename, opts = {}) {
    let stream = null;
    return new Promise((resolve, reject) => {
      const hash = md5(filename);
      if (this.cache[hash] && !opts.force) {
        resolve(this.cache[hash]);
      } else {
        stream = fs.createReadStream(filename);
        stream.on('error', reject.bind(null, filename));
        mm(stream, { duration: true }, (error, metadata) => {
          if (error) {
            stream.close();
            reject(filename);
          } else {
            this.cache[hash] = {
              filename,
              metadata: error ? {} : MetaDoctor.normalise(metadata),
              duration: metadata.duration,
            };
            stream.close();
            resolve(this.cache[hash]);
          }
        });
      }
    });
  }
  getFromPool(filename) {
    return this.cache[md5(filename)];
  }
  invalidate(ids) {
    ids.forEach(id => delete this.cache[md5(id)]);
  }
}
