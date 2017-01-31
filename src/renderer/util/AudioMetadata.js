import Promise from 'bluebird';
import ffmpeg from 'fluent-ffmpeg';

Promise.promisifyAll(ffmpeg);

export default class AudioMetadata {
  constructor({ filename, ffprobePath }) {
    this.filename = filename;
    this.ffprobePath = ffprobePath;
    this.data = {};
  }
  load() {
    if (!this.filename) {
      return Promise.reject('No filename provided!');
    }
    ffmpeg.setFfprobePath(this.ffprobePath);
    return ffmpeg.ffprobeAsync(this.filename)
      .bind(this)
      .then(this._parseMetadata);
  }
  _parseMetadata(metadata) {
    this._rawData = metadata;
    const stream = metadata.streams[0] || {};
    this.data = {
      filename: this.filename,
      bit_rate: stream.bit_rate === 'N/A' ? 'N/A' : Math.floor(stream.bit_rate / 1000),
      sample_rate: stream.sample_rate,
      format: stream.codec_long_name,
      channels: stream.channels,
      channel_layout: stream.channel_layout,
    };
    return this;
  }
  toJSON() {
    return this.data;
  }
}
