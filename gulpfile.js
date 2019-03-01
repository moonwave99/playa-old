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
const ffbinaries = require('ffbinaries');
const path = require('path');

require('gulp-task-list')(gulp);

const pkg = jetpack.read('./package.json', 'json');
const bundle = require('./tasks/bundle');
const SRC_DIR = 'src';
const RELEASE_IGNORE_PKGS = Object.keys(pkg.devDependencies).join('|');
const RELEASE_IMAGE_ICON = __dirname + '/src/ui/images/app.icns';

const STYLUSOPTIONS = {
  compress: false,
  paths: ['src/styles', 'node_modules/bootstrap-styl/bootstrap'],
  urlfunc: 'embedurl',
};

const projectDir = jetpack;
const srcDir = jetpack.cwd('./src');
const destDir = jetpack.cwd('./build');
const buildPath = 'build';
const releasePath = 'release';

const _init = function _init(stream) {
  stream.setMaxListeners(0);
  return stream;
};

gulp.task('?', (next) => {
  sh.exec('gulp task-list');
  next();
});

gulp.task('clean', (next) => {
  sh.rm('-rf', buildPath);
  sh.rm('-rf', releasePath);
  next();
});

gulp.task('bundle', () => {
  return Promise.all([
    bundle(srcDir.path('browser/main.js'), destDir.path('browser.js'), pkg),
    bundle(srcDir.path('renderer/main.js'), destDir.path('renderer.js'), pkg),
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

gulp.task('ffmpeg', (next) => {
  const destination = path.join(__dirname, 'node_modules', 'ffmpeg');
  console.log(`Downloading ffplay and ffprobe binaries for osx to ${destination}`);
  ffbinaries.downloadFiles(
    ['ffmpeg', 'ffprobe'],
    {
      platform: 'osx',
      destination,
    }, (err, data) => {
      if (err) {
        console.error(err);
        throw(err);
      }
      console.log(`Downloaded ffplay and ffprobe binaries for osx to ${destination}`);
      next();
    });
});

gulp.task('electron-settings', () => {
  return gulp.src('./node_modules/electron-settings/**')
    .pipe(gulp.dest(releasePath + '/Playa-darwin-x64/Playa.app/Contents/Resources/app/node_modules/electron-settings'));
});

gulp.task('fonts', () => {
  return gulp.src('./fonts.list')
    .pipe(googleWebFonts({}))
    .pipe(gulp.dest('src/ui/fonts'));
});

gulp.task('font-awesome', () => {
  return gulp.src('./node_modules/font-awesome/**')
    .pipe(gulp.dest('src/ui/vendor/font-awesome'));
});

gulp.task('assets', () => {
  return gulp.src('src/ui/**')
    .pipe(gulp.dest(buildPath + '/ui'));
});

gulp.task('pkg', () => {
  return gulp.src('package.json')
    .pipe(gulp.dest(buildPath));
});


gulp.task('lib', () => {
  return gulp.src('src/lib/**')
    .pipe(gulp.dest(buildPath + '/lib'));
});

gulp.task('pre-release', (next) => {
  runSequence('build', 'prod-sym-links', next);
});

gulp.task('release-electron', ['pre-release'], (next) => {
  const env = Object.assign({}, process.env);
  env.NODE_ENV = 'production';
  const packageArgs = [
    '.',
    pkg.productName,
    '--out',
    releasePath,
    '--platform',
    'darwin',
    '--arch',
    'x64',
    '--electron-version',
    pkg.devDependencies.electron,
    '--ignore', ('node_modules/(' + RELEASE_IGNORE_PKGS + ')'),
    '--icon',
    RELEASE_IMAGE_ICON,
    '--appPath',
    'build/browser.js'
  ];
  const child = childProcess.spawn('./node_modules/.bin/electron-packager', packageArgs, {
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

gulp.task('release', (next) => {
  runSequence('release-electron', 'electron-settings', next);
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

gulp.task('build', ['clean', 'fonts', 'font-awesome', 'css', 'ffmpeg', 'bundle', 'dev-sym-links', 'lib', 'pkg', 'assets']);

gulp.task('watch', () => {
  gulp.watch(SRC_DIR + '/styles/*.styl', ['css']);
  gulp.watch([
    SRC_DIR + '/**/*.js',
    SRC_DIR + '/**/*.jsx'
  ], ['bundle']);
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
    if (exitCode === 1) {
      return next(new Error('Error running serve task'));
    }
    process.exit(0);
  });
});

gulp.task('default', ['serve']);
