var shell = require('shell')
var pkgJson = require('../../package.json')

document.addEventListener("DOMContentLoaded", function() {
  document.body.classList.toggle('loaded')
  document.querySelector('.description').innerHTML = pkgJson.description
  document.querySelector('.version').innerHTML = 'Version <strong>' + pkgJson.version + '</strong>'
  var links = document.querySelectorAll('a')
  for(var i = 0; i < links.length; i++){
    links[i].addEventListener('click', function(e){
      shell.openExternal(e.target.href)
    })
  }
})
