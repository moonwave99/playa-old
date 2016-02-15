document.addEventListener("DOMContentLoaded", function() {
  var socket = io.connect()
  riot.mount('playbackBar', { socket: socket })
  riot.mount('playlist', { socket: socket })
  document.body.classList.toggle('loaded')
})
