import { uniq } from 'lodash';
import fs from 'fs-extra';
import Promise from 'bluebird';
import { ipcRenderer as ipc } from 'electron';
import md5 from 'md5';
import path from 'path';
import yaml from 'js-yaml';
import glob from 'glob';
import i18n from 'i18next';

Promise.promisifyAll(fs);
Promise.promisifyAll(yaml);
Promise.promisifyAll(glob);

export default class PlaylistLoader {
  constructor({ root, playlistExtension }) {
    this.root = root;
    this.playlistExtension = playlistExtension;
    this.treeCache = [];
  }
  parse(playlistPath) {
    return fs.readFileAsync(playlistPath, 'utf8')
      .bind(this)
      .then(yaml.safeLoad)
      .catch(err => console.error(err, err.stack)); // eslint-disable-line
  }
  load(playlist, opts) {
    if (playlist.isNew()) {
      return Promise.resolve(playlist);
    }
    return this.parse(playlist.path).then(data =>
      playlist.hydrate(data).load(uniq(data.tracklist), opts),
    );
  }
  save(playlist) {
    let targetPath;
    if (playlist.isNew()) {
      targetPath = ipc.sendSync('request:save:dialog', {
        title: i18n.t('playlist.save'),
        defaultPath: this.root,
        filters: [
          {
            name: 'Playlist files',
            extensions: [this.playlistExtension.replace('.', '')],
          },
        ],
      });
      if (!targetPath) {
        return Promise.reject('Cancel save');
      }
      playlist.setTitle(path.basename(
        targetPath.replace(this.root, ''),
        this.playlistExtension,
      ));
    } else {
      targetPath = path.join(this.root, playlist.title + this.playlistExtension);
    }
    return fs.outputFileAsync(
      targetPath,
      yaml.safeDump(playlist.serialize()),
    ).then(() => {
      playlist.setPath(targetPath);
      playlist.setId(md5(targetPath));
      return playlist;
    }).catch(error => console.error(error, error.stack)); // eslint-disable-line
  }
}
