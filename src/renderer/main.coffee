ipc = require 'ipc'
Playa = require '../playa'

window.playa = new Playa
  userDataFolder: ipc.sendSync 'request:app:path', key: 'userData'
  openPlaylists:  ipc.sendSync 'request:session:settings', key: 'openPlaylists'

playa.init()
playa.render()
