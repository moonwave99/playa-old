/* eslint class-methods-use-this: 0 */

import path from 'path';
import FileTreeNode from './FileTreeNode';
import fileBrowser from './FileBrowser';

export default class FileTree {
  constructor({ rootFolder, rootName = '/', filter = 'directory' }) {
    this.rootFolder = rootFolder;
    this.rootNode = null;
    this.filter = filter;
    this.rootNode = new FileTreeNode({
      name: rootName,
      path: rootFolder,
      relativePath: '',
      depth: 0,
    });
  }
  loadRoot() {
    return this.expand([this.rootNode]);
  }
  expandSingleNode(node) {
    return fileBrowser.load(node.path, this.filter)
      .then((content) => {
        const children = content.sort().map((folder) => {
          const relativePath = path.relative(this.rootFolder, folder);
          const extension = this.filter === 'directory' ? '' : path.extname(relativePath);
          return new FileTreeNode({
            name: path.basename(relativePath, extension),
            path: folder,
            extension,
            relativePath,
            parentNode: node,
            depth: node.depth + 1,
          });
        });
        node.setChildren(children);
      });
  }
  expand(nodes) {
    return Promise.all(nodes.map(n => this.expandSingleNode(n)));
  }
  collapse(nodes) {
    nodes.forEach(n => n.collapse());
  }
  flatten() {
    const memo = [];
    const _flatten = function _flatten(node) {
      memo.push(node);
      node.children.forEach(i => _flatten(i));
    };
    _flatten(this.rootNode);
    return memo;
  }
}
