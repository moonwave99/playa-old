import { BrowserWindow } from 'electron';
import path from 'path';
import url from 'url';
import { EventEmitter } from 'events';

export default class AboutWindow extends EventEmitter {
  constructor() {
    super();
    const windowOpts = {
      width: 400,
      height: 400,
      x: 100,
      y: 100,
      title: '',
      resizable: false,
      'web-preferences': {
        'subpixel-font-scaling': true,
      },
    };
    this.window = new BrowserWindow(windowOpts);
  }
  show() {
    const targetUrl = url.format({
      protocol: 'file',
      pathname: path.resolve(__dirname, '..', 'src', 'ui', 'about.html'),
      slashes: true,
    });
    this.window.loadURL(targetUrl);
    this.window.show();
  }
}
