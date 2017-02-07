import proxyquire from 'proxyquire';
import { BITRATE_NOT_AVAILABLE } from '../AudioMetadata';

export const stubAudioMetaData = {
  'path/to/file_1.mp3': {
    streams: [
      {
        bit_rate: 192000,
        sample_rate: 44100,
        codec_long_name: 'MP3 (MPEG audio layer 3)',
        channels: 2,
        channel_layout: 'stereo',
      },
    ],
  },
  'path/to/file_no_bitrate.mp3': {
    streams: [
      {
        bit_rate: BITRATE_NOT_AVAILABLE,
        sample_rate: 44100,
        codec_long_name: 'MP3 (MPEG audio layer 3)',
        channels: 2,
        channel_layout: 'stereo',
      },
    ],
  },
};

export const AudioMetadata = proxyquire('../AudioMetadata', {
  __esModule: true,
  'fluent-ffmpeg': {
    ffprobe: (filename, callback) => callback(null, stubAudioMetaData[filename]),
  },
});

export default {
  AudioMetadata,
  stubAudioMetaData,
};
