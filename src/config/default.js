export default {
  ffmpegPath: '/usr/local/bin/ffmpeg',
  ffprobePath: '/usr/local/bin/ffprobe',
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
