import jetpack from 'fs-jetpack';

export default class SettingsBag {
  constructor({
    path,
    data = {},
    readOnly = false,
  }) {
    this.path = path;
    this.data = Object.assign({}, data);
    this.readOnly = readOnly;
  }
  load() {
    const data = jetpack.read(this.path, 'json');
    if (!data) {
      throw new Error(`Could not read from ${this.path}`);
    }
    this.data = data;
    return this;
  }
  save() {
    if (this.readOnly) {
      return this;
    }
    jetpack.write(this.path, this.data);
    return this;
  }
  set(key, value) {
    if (this.readOnly) {
      return this;
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
