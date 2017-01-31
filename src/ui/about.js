const shell = require('electron').shell;
const config = require('../../package.json');
const repo = config.repository.url.replace('.git', '');

document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.toggle('loaded');
  document.querySelector('h1').innerHTML = config.productName;
  document.querySelector('.description').innerHTML = config.description;
  document.querySelector('.website').innerHTML = repo;
  document.querySelector('.website').href = repo;
  document.querySelector('.author').innerHTML = config.author.name;
  document.querySelector('.author').href = config.author.url;
  document.querySelector('.version').innerHTML = `Version <strong>${config.version}</strong>`;
  const links = document.querySelectorAll('a');
  for(let i = 0; i < links.length; i++){
    links[i].addEventListener('click', (event) => {
      event.preventDefault();
      shell.openExternal(event.target.href);
    });
  }
});
