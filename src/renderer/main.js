'use strict';

var ipc = require('electron').ipcRenderer
var Playa = require('../playa')

window.playa = new Playa({
  userDataFolder: ipc.sendSync('request:app:path', { key: 'userData' }),
  sessionInfo:    ipc.sendSync('request:session:settings'  )
})

playa.init()
playa.render()
