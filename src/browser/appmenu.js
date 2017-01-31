import { Menu } from 'electron';
import path from 'path';
import season from 'season';
import _ from 'underscore-plus';
import { EventEmitter } from 'events';

export default class ApplicationMenu extends EventEmitter {
  constructor(options) {
    super();
    const menuJson = season.resolve(
      path.join(__dirname, '../menus', `${process.platform}.json`)
    );
    const template = season.readFileSync(menuJson);
    this.template = this.translateTemplate(template.menu, options.pkg);
  }
  attachToWindow() {
    this.menu = Menu.buildFromTemplate(_.deepClone(this.template));
    return Menu.setApplicationMenu(this.menu);
  }
  translateTemplate(template, pkgJson) {
    for (const item of Array.from(template)) {
      if (item.metadata == null) {
        item.metadata = {};
      }
      if (item.label) {
        item.label = (_.template(item.label))(pkgJson);
      }
      if (item.command) {
        item.click = () => this.emit(item.command);
      }
      if (item.submenu) {
        this.translateTemplate(item.submenu, pkgJson);
      }
    }
    return template;
  }
}
