'use strict';

var ipc = require('ipc')
var Playa = require('../playa')

window.playa = new Playa({
  userDataFolder: ipc.sendSync('request:app:path', { key: 'userData' }),
  sessionInfo:    ipc.sendSync('request:session:settings'  )
})

playa.init()
playa.render()
