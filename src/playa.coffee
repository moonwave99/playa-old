Player = require('./renderer/util/Player')
PlayerCache = require('./renderer/util/PlayerCache')

Playa =
  player: new Player()
  playerCache: new PlayerCache()

Playa.player.playerCache = Playa.playerCache
module.exports = Playa