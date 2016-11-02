var shell = require('shell')
var appConfig = require('../config/appConfig')

document.addEventListener("DOMContentLoaded", function() {
  document.body.classList.toggle('loaded')
  document.querySelector('h1').innerHTML = appConfig.productName
  document.querySelector('.description').innerHTML = appConfig.description
  document.querySelector('.website').innerHTML = appConfig.repository
  document.querySelector('.website').href = appConfig.repository
  document.querySelector('.author').innerHTML = appConfig.authorName
  document.querySelector('.author').href = appConfig.authorUrl
  document.querySelector('.version').innerHTML = 'Version <strong>' + appConfig.version + '</strong>'
  var links = document.querySelectorAll('a')
  for(var i = 0; i < links.length; i++){
    links[i].addEventListener('click', function(event){
      event.preventDefault()
      shell.openExternal(e.target.href)
    })
  }
})
