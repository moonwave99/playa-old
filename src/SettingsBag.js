'use babel';

import fs from 'fs-plus';

export default class SettingsBag {
  constructor({
    path,
    data = {},
    readOnly = false,
  }) {
    this.path = path;
    this.data = data;
    this.readOnly = readOnly;
  }
  load() {
    if (!fs.existsSync(this.path)) {
      return;
    }
    this.data = JSON.parse(
      fs.readFileSync(this.path, 'utf-8'),
    );
    return this;
  }
  save() {
    if (this.readOnly) {
      return;
    }
    fs.writeFileSync(this.path, JSON.stringify(this.data));
    return this;
  }
  set(key, value) {
    if (this.readOnly) {
      return;
    }
    this.data[key] = value;
    return this;
  }
  get(key) {
    return this.data[key];
  }
  all() {
    return this.data;
  }
}
