const path = require('path');
const appRootDir = require('app-root-dir').get();

export default {
  ffmpegPath: path.join(appRootDir, 'node_modules/ffmpeg/ffmpeg'),
  ffprobePath: path.join(appRootDir, 'node_modules/ffmpeg/ffprobe'),
  coverFolderName: 'Covers',
  playlistFolderName: 'Playlists',
  coverLoaderLog: false,
  wavesurfer: {
    waveColor: '#7f7f7f',
    progressColor: '#bfbfbf',
    height: 140,
  },
  fileExtensions: ['mp3', 'm4a', 'flac', 'ogg'],
  playlistExtension: '.yml',
  discogs: {
    apiRoot: 'https://api.discogs.com/database/search',
    throttle: 1000,
  },
  lastFM: {
    authURL: 'https://www.last.fm/api/auth/',
    scrobbleThreshold: {
      percent: 0.5,
      absolute: 4 * 60,
    },
  },
};
