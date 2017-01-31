import { ipcRenderer as ipc } from 'electron';
import Playa from '../playa';

window.playa = new Playa({
  userDataFolder: ipc.sendSync('request:app:path', { key: 'userData' }),
  sessionInfo: ipc.sendSync('request:session:settings'),
});

window.playa.init();
window.playa.render();
