document.addEventListener("DOMContentLoaded", function() {
  var socket = io.connect()
  riot.mount('remote', { socket: socket })
  document.body.classList.toggle('loaded')
})
