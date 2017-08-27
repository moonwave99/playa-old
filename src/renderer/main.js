import { ipcRenderer as ipc } from 'electron';
import Playa from '../playa';
import config from '../config';

window.playa = new Playa({
  userDataFolder: ipc.sendSync('request:app:path', { key: 'userData' }),
  sessionInfo: ipc.sendSync('request:session:settings'),
  config: config(process.NODE_ENV),
  audioElement: document.getElementById('audio'),
});

window.playa.init();
window.playa.render();
