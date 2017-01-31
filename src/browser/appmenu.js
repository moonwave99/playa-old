import { Menu } from 'electron';
import path from 'path';
import season from 'season';
import _ from 'underscore-plus';
import { EventEmitter } from 'events';

export default class AppMenu extends EventEmitter {
  constructor() {
    super();
    const menuJson = season.resolve(
      path.join(__dirname, '../menus', `${process.platform}.json`)
    );
    const template = season.readFileSync(menuJson);
    this.template = this.translateTemplate(template.menu);
  }
  attachToWindow() {
    this.menu = Menu.buildFromTemplate(_.deepClone(this.template));
    return Menu.setApplicationMenu(this.menu);
  }
  translateTemplate(template) {
    for (const item of Array.from(template)) {
      if (item.metadata == null) {
        item.metadata = {};
      }
      if (item.label) {
        item.label = (_.template(item.label))();
      }
      if (item.command) {
        item.click = () => this.emit(item.command);
      }
      if (item.submenu) {
        this.translateTemplate(item.submenu);
      }
    }
    return template;
  }
}
