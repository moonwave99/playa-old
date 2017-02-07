import Promise from 'bluebird';
import ffmpeg from 'fluent-ffmpeg';

Promise.promisifyAll(ffmpeg);

export const BITRATE_NOT_AVAILABLE = 'N/A';

const parseMetaData = function parseMetaData(metadata, filename) {
  const stream = metadata.streams[0] || {};
  return {
    filename,
    bit_rate: stream.bit_rate === BITRATE_NOT_AVAILABLE
      ? BITRATE_NOT_AVAILABLE
      : Math.floor(stream.bit_rate / 1000),
    sample_rate: stream.sample_rate,
    format: stream.codec_long_name,
    channels: stream.channels,
    channel_layout: stream.channel_layout,
  };
};

export const load = function load(filename) {
  if (!filename) {
    throw new Error('No filename provided!');
  }
  return ffmpeg.ffprobeAsync(filename).then(
    metadata => parseMetaData(metadata, filename),
  );
};

export default {
  BITRATE_NOT_AVAILABLE,
  load,
};
