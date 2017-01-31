import path from 'path';
import Promise from 'bluebird';
import walkdir from 'walkdir';
import glob from 'glob';

Promise.promisifyAll(glob);

const loadFolder = function loadFolder(folder) {
  return new Promise((resolve, reject) => {
    const dirs = [];
    const emitter = walkdir(folder, {
      max_depth: 1,
    });
    emitter.on('directory', dir => dirs.push(dir));
    emitter.on('end', () => resolve(dirs));
    emitter.on('error', (_path, error) => reject(error));
    emitter.on('fail', (_path, error) => reject(error));
  });
};

const loadFiles = function loadFiles(folder, filter = '') {
  return glob.callAsync(null, path.join(folder, `*${filter}`));
};

export default {
  load(folder, filter = 'directory') {
    if (filter === 'directory') {
      return loadFolder(folder);
    }
    return loadFiles(folder, filter);
  },
};
