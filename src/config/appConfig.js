/* =========================================================================
 * Dependencies
 * ========================================================================= */
var _ = require('underscore-plus');
var path = require('path-extra');

var packageJson = require('../../package.json');

/* =========================================================================
 * App Config Settings
 * ========================================================================= */
var defaultSettings = {
  version: packageJson.version,
  name: packageJson.name,
  productName: packageJson.productName,
  description: packageJson.description,
  repository: packageJson.repository.url,
  authorUrl: packageJson.author.url,
  authorName: packageJson.author.name,
  logLevel: 'debug',
  buildPath: 'build',
  releasePath: 'release',
  ffmpegPath: '/usr/local/bin/ffmpeg',
  ffprobePath: '/usr/local/bin/ffprobe',
  coverFolderName: 'Covers',
  waveformFolderName: 'Waveforms',
  playlistFolderName: 'Playlists',
  coverLoaderLog: false,
  waveformLoaderLog: false
};

var production = _.extend(_.extend({}, defaultSettings), {
  env: 'production'
});

var development = _.extend(_.extend({}, defaultSettings), {
  env: 'development'
});

var local = _.extend(_.extend({}, defaultSettings), {
  env: 'local'
});

var test = _.extend(_.extend({}, defaultSettings), {
  env: 'test'
});

var configs = {
  production: production,
  development: development,
  local: local,
  test: test
};

function getConfig(env) {
  var envConfig = configs[env];

  if (!envConfig) throw new Error(env + ' is not a valid environment');

  console.log('\nENVIRONMENT\n------------------');
  console.log(envConfig);
  console.log('\n');

  return envConfig;
}

// exports
module.exports = getConfig(process.env.WERCKER_GIT_BRANCH || process.env.NODE_ENV || 'development');
