ipc = require 'ipc'
Playa = require '../playa'

window.playa = new Playa
  openPlaylists: ipc.sendSync 'request:session:settings', key: 'openPlaylists'

playa.init()
playa.render()
