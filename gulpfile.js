/* =========================================================================
 * Dependencies
 * ========================================================================= */
const gulp = require('gulp');
const jshint = require('gulp-jshint');
const sh = require('shelljs');
const runSequence = require('run-sequence');
const _ = require('lodash');
const childProcess = require('child_process');
const babel = require('gulp-babel');
const stylus = require('gulp-stylus');
const autoprefixer = require('gulp-autoprefixer');
const coffee = require('gulp-coffee');
const merge = require('merge-stream');
const googleWebFonts = require('gulp-google-webfonts');

const appConfig = require('./src/config/appConfig');

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
  "gulp-babel",
  "gulp-coffee",
  "gulp-google-webfonts",
  "gulp-jshint",
  "gulp-spawn-mocha",
  "gulp-stylus",
  "gulp-task-list",
  "jasmine",
  "jasmine-core",
  "jshint-stylish",
  "karma",
  "karma-electron-launcher",
  "karma-jasmine",
  "karma-phantomjs-launcher",
  "karma-sinon",
  "karma-spec-reporter",
  "merge-stream",
  "run-sequence",
  "shelljs",
  "should",
  "sinon",
  "sinon-as-promised",
  "supertest"
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

gulp.task('coffee', () => {
  return gulp.src(SRC_DIR + '/**/*.coffee')
    .pipe(coffee({ bare: true }))
    .pipe(gulp.dest(appConfig.buildPath));
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

gulp.task('jshint', () => {
  return _init(gulp.src(['src/**/*.js', '!src/ui/vendor/**/*.js', '!src/ui/riot-tags/**/*.js']))
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
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
    'build/browser/main.js'
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
  // run babel to compile ES6 => ES5
  // run prod-sym-links to change symlinks in node_modules that point to src dir to the build dir (which will contain the compiled ES5 code)
  //-------------------------------------
  runSequence('build', 'babel', 'prod-sym-links', next);
});

gulp.task('babel', () => {
  return gulp.src(['./src/**/*.js', './src/**/*.jsx'])
    .pipe(babel({
      presets: ['es2015', 'react'],
      ignore: ['src/ui/vendor/*', 'src/ui/riot-tags/*'],
    }))
    .pipe(gulp.dest(appConfig.buildPath));
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

gulp.task('build', ['clean', 'fonts', 'font-awesome', 'css', 'coffee', 'dev-sym-links']);

gulp.task('watch', () => {
  gulp.watch(SRC_DIR + '/styles/*.styl', ['css']);
});

gulp.task('serve', ['watch', 'build'], (next) => {

  var env = _.extend({}, process.env);
  var child = childProcess.spawn('./node_modules/.bin/electron', ['./'], {
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
