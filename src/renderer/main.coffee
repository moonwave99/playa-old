ipc = require 'ipc'
Playa = require '../playa'
SettingsBag = require '../SettingsBag'

session = ipc.sendSync 'request:session:settings'

window.playa = new Playa
  userDataFolder:   ipc.sendSync 'request:app:path', key: 'userData'
  sessionSettings:  new SettingsBag
    data: session.data
    path: session.path

playa.init()
playa.render()
