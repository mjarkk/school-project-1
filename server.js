'use strict';

const express = require('express')
const bodyParser = require('body-parser')
const fs = require('fs-extra')
const shell = require('shelljs')
const watch = require('node-watch')
const sass = require('npm-sass')
const fetch = require('node-fetch')
const app = express()

app.use(express.static('./www/'))
app.use(bodyParser.json(true));
app.use(bodyParser.urlencoded({extended: true}));

var messages = []

app.get("/stopscript", function(req,res) {
  process.exit()
  setTimeout(function () {
    res.send('OK');
  }, 10);
})

const port = 7777;

fetch('http://127.0.0.1:' + port + '/')
.then(function(res) {
  if (res.ok) {
    fetch('http://127.0.0.1:' + port + '/stopscript')
    .then(function(res) {
      return res.text();
    }).then(function(body) {

    }).catch(function(err) {
      console.log(' ');
      console.log('---------------------------------');
      console.log('Port: ' + port + ' already in use!');
      console.log('Try to start the webserver again');
      console.log('---------------------------------');
      process.exit()
    });
    setTimeout(function () {
      console.log(' ');
      console.log('---------------------------------');
      console.log('Port: ' + port + ' already in use!');
      console.log('Try to start the webserver again');
      console.log('---------------------------------');
      process.exit()
    }, 1000);
  } else {
    startserv()
  }
}).catch(function(err) {
  startserv()
});
function startserv() {
  app.listen(port);
  console.log('Started server on port:' + port);
}

watch('./www/css/', { recursive: true }, function(evt, name) {
  if (evt == 'update' && name.endsWith('.sass')) {
    sass('./' + name, function (err, result) {
      if (!err) {
        console.log('compiled sass file: ' + result.stats.entry);
        fs.writeFile(result.stats.entry.replace('.sass','.css'),result.css)
      }
    });
  }
});

fs.readdir('./www/css/', function(err, items) {
  for (var i = 0; i < items.length; i++) {
    var name = 'www/css/' + items[i]
    if (name.endsWith('.sass')) {
      sass('./' + name, function (err, result) {
        if (!err) {
          console.log('compiled sass file: ' + result.stats.entry);
          fs.writeFile(result.stats.entry.replace('.sass','.css'),result.css)
        }
      });
    }
  }
});
