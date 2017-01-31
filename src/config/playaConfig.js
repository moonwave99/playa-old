import jetpack from 'fs-jetpack';

const pkg = jetpack.read('./package.json', 'json');

export default {
  version: pkg.version,
  name: pkg.name,
  productName: pkg.productName,
  description: pkg.description,
  repository: pkg.repository.url,
  authorUrl: pkg.author.url,
  authorName: pkg.author.name,
  logLevel: 'debug',
  buildPath: 'build',
  releasePath: 'release',
  ffmpegPath: '/usr/local/bin/ffmpeg',
  ffprobePath: '/usr/local/bin/ffprobe',
  coverFolderName: 'Covers',
  waveformFolderName: 'Waveforms',
  playlistFolderName: 'Playlists',
  coverLoaderLog: false,
  waveformLoaderLog: false,
  discogsApiRoot: 'https://api.discogs.com/database/search',
  lastfmAuthURL: 'https://www.last.fm/api/auth/',
};
