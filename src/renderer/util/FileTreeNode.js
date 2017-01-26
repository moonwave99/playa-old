'use babel';

import { findWhere } from 'lodash';
import fs from 'fs-extra';
import md5 from 'md5';

module.exports = class FileTreeNode {
  constructor({
    name,
    path,
    extension,
    parentNode,
    depth = 0,
    children = [],
  }) {
    Object.assign(this, {
      name,
      path,
      extension,
      parentNode,
      depth,
      children,
      id: md5(path),
    });
  }
  setChildren(children = []) {
    this.children = children;
  }
  isRoot() {
    return !this.parentNode;
  }
  isLeaf() {
    return this.children.length === 0;
  }
  isDirectory() {
    return !this.extension;
  }
  findByName(key = 'id', value) {
    return findWhere(this.children, {
      [key]: value,
    });
  }
  collapse() {
    this.children = [];
  }
  delete() {
    return new Promise((resolve, reject) => {
      fs.remove(this.path, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve(this);
        }
      });
    });
  }
};
