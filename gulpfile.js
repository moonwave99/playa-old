/* =========================================================================
 * Dependencies
 * ========================================================================= */
const gulp = require('gulp');
const sh = require('shelljs');
const runSequence = require('run-sequence');
const _ = require('lodash');
const childProcess = require('child_process');
const jetpack = require('fs-jetpack');
const stylus = require('gulp-stylus');
const autoprefixer = require('gulp-autoprefixer');
const merge = require('merge-stream');
const googleWebFonts = require('gulp-google-webfonts');

const appConfig = require('./src/config/appConfig');
const bundle = require('./tasks/bundle');

require('gulp-task-list')(gulp);

/* =========================================================================
 * Constants
 * ========================================================================= */
const SRC_DIR = 'src';
const DOCS_DIR = 'docs';
const RELEASE_IGNORE_PKGS = [ //any npm packages that should not be included in the release
  "electron-packager",
  "electron-prebuilt",
  "gulp",
  "gulp-autoprefixer",
  "gulp-google-webfonts",
  "gulp-stylus",
  "gulp-task-list",
  "rollup",
  "fs-jetpack",
  "merge-stream",
  "run-sequence",
  "shelljs",
].join('|');

const RELEASE_IMAGE_ICON = __dirname + '/src/ui/images/app.icns';

const STYLUSOPTIONS = {
  compress: false,
  paths: ['src/styles', 'node_modules/bootstrap-styl/bootstrap'],
  urlfunc: 'embedurl',
};

const MOCHA_SETTINGS = {
  reporter: 'spec',
  growl: true,
  env: {
    NODE_ENV: 'test'
  }
};

const projectDir = jetpack;
const srcDir = jetpack.cwd('./src');
const destDir = jetpack.cwd('./build');

/* =========================================================================
 * Tasks
 * ========================================================================= */
/**
 * List gulp tasks
 */
gulp.task('?', (next) => {
  sh.exec('gulp task-list');
  next();
});

gulp.task('clean', (next) => {
  sh.rm('-rf', appConfig.releasePath);
  sh.rm('-rf', appConfig.buildPath);
  next();
});

gulp.task('bundle', function () {
  return Promise.all([
    bundle(srcDir.path('browser/main.js'), destDir.path('browser.js')),
    bundle(srcDir.path('renderer/main.js'), destDir.path('renderer.js')),
  ]);
});

gulp.task('css', () => {
  return merge(['application', 'bootstrap', 'remote'].map((x)=>{
    return gulp.src(SRC_DIR + '/styles/' + x + '.styl')
      .pipe(stylus(STYLUSOPTIONS))
      .pipe(autoprefixer({
        browsers: ['last 1 version']
      }))
      .pipe(gulp.dest(SRC_DIR + '/ui/css'));
  }));
});

gulp.task('fonts', function () {
  return gulp.src('./fonts.list')
    .pipe(googleWebFonts({}))
    .pipe(gulp.dest('src/ui/fonts'));
});

gulp.task('font-awesome', function () {
  return gulp.src('./node_modules/font-awesome/**')
    .pipe(gulp.dest('src/ui/vendor/font-awesome'));
});

gulp.task('assets', function () {
  return gulp.src('src/ui/**')
    .pipe(gulp.dest(appConfig.buildPath + '/ui'));
});

gulp.task('release', ['pre-release'], (next) => {
  var env = _.extend({}, process.env);
  env.NODE_ENV = 'production';
  var child = childProcess.spawn('./node_modules/.bin/electron-packager', [
    '.',
    appConfig.productName,
    '--out',
    appConfig.releasePath,
    '--platform',
    'darwin',
    '--arch',
    'x64',
    '--version',
    '0.36.7',
    '--ignore', ('node_modules/(' + RELEASE_IGNORE_PKGS + ')'),
    '--icon',
    RELEASE_IMAGE_ICON,
    '--appPath',
    'build/browser.js'
  ], {
    env: env
  });

  child.stdout.on('data', (data) => {
    console.log('tail output: ' + data);
  });

  child.on('exit', (exitCode) => {
    console.log('Child exited with code: ' + exitCode);
    return next(exitCode === 1 ? new Error('Error running release task') : null);
  });
});

gulp.task('pre-release', (next) => {
  // Build Steps:
  //-------------------------------------
  // run build to cleanup dirs and compile stylus
  // run prod-sym-links to change symlinks in node_modules that point to src dir to the build dir (which will contain the compiled ES5 code)
  //-------------------------------------
  runSequence('build', 'prod-sym-links', next);
});

gulp.task('prod-sym-links', (next) => {
  childProcess.exec('make createProductionSymLinks', (err, stdout, stderr) => {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (err !== null) {
      console.log('exec error: ' + err);
    }
    return next(err);
  });
});

gulp.task('dev-sym-links', () => {
  childProcess.exec('make createDevelopmentSymLinks', (error, stdout, stderr) => {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
      console.log('exec error: ' + error);
    }
  });
});

gulp.task('build', ['clean', 'fonts', 'font-awesome', 'css', 'bundle', 'dev-sym-links', 'assets']);

gulp.task('watch', () => {
  gulp.watch(SRC_DIR + '/styles/*.styl', ['css']);
});

gulp.task('serve', ['watch', 'build'], (next) => {
  const env = Object.assign({}, process.env);
  const child = childProcess.spawn('./node_modules/.bin/electron', ['./'], {
    env: env
  });

  child.stdout.on('data', (data) => {
    console.log('tail output: ' + data);
  });

  child.on('exit', (exitCode) => {
    console.log('Child exited with code: ' + exitCode);
    return next(exitCode === 1 ? new Error('Error running serve task') : null);
  });
});

gulp.task('default', ['serve']);

/* =========================================================================
 * Helper Functions
 * ========================================================================= */
function _init(stream) {
  stream.setMaxListeners(0);
  return stream;
}
