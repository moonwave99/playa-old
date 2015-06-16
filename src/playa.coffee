Player = require('./renderer/util/Player')
Loader = require('./renderer/util/Loader')

Playa =
  player: new Player()
  loader: new Loader()

Playa.player.loader = Playa.loader
module.exports = Playa