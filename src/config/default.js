export default {
  ffmpegPath: '/usr/local/bin/ffmpeg',
  ffprobePath: '/usr/local/bin/ffprobe',
  coverFolderName: 'Covers',
  waveformFolderName: 'Waveforms',
  playlistFolderName: 'Playlists',
  coverLoaderLog: false,
  waveformLoader: {
    log: false,
    wait: 300,
    'png-width': 1600,
    'png-height': 160,
    'png-color-bg': '00000000',
    'png-color-center': '505050FF',
    'png-color-outer': '505050FF',
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
