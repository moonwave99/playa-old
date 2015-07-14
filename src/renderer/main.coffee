ipc = require 'ipc'
Playa = require '../playa'

window.playa = new Playa
  userDataFolder:   ipc.sendSync 'request:app:path', key: 'userData'
  sessionSettings:  ipc.sendSync 'request:session:settings'

playa.init()
playa.render()
