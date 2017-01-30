'use babel';

import path from 'path';
import fs from 'fs-plus';
import waveform from 'waveform';
import { omit } from 'lodash';

const OUTPUT_EXT = '.png';

export default class WaveformLoader {
  constructor({ root, config = {}, enableLog = false }) {
    this.root = root;
    this.config = config;
    this.enableLog = enableLog;
  }
  load(track) {
    return new Promise((resolve, reject) => {
      let waveformPath = this.getCached(track);
      if (waveformPath) {
        setTimeout(
          () => resolve(waveformPath),
          this.config.wait,
        );
      } else {
        waveformPath = this.getWaveformPath(track);
        const waveformOptions = Object.assign({
          scan: false,
          png: waveformPath,
        }, omit(this.config, 'wait'));
        waveform(track.filename, waveformOptions, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(waveformPath);
          }
        });
      }
    });
  }
  getCached(track) {
    const waveformPath = this.getWaveformPath(track);
    return fs.existsSync(waveformPath) ? waveformPath : false;
  }
  getWaveformPath(track) {
    return path.join(
      this.root,
      [
        track.id,
        this.config['png-width'],
        this.config['png-height'],
        this.config['png-color-bg'],
        this.config['png-color-center'],
        this.config['png-color-outer'],
      ].join('_') + OUTPUT_EXT,
    );
  }
  log(message, response) {
    if (!this.enableLog) {
      return;
    }
    response ? console.info(message, response) : console.info(message); // eslint-disable-line
  }
}
