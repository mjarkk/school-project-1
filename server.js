const fs = require('fs-extra')
let configfile = './config.json';

if (!fs.pathExistsSync(configfile)) {
  console.log('---------------------------------------------');
  console.log('config file does not exsist, creating one....');
  fs.outputJsonSync(configfile, {
    DiscordToken: ' --- BOT TOKEN HERE --- '
  })
  console.log(' ');
  console.log('Place a discord token inside of: config.json');
  console.log('---------------------------------------------');
  process.exit()
}
var config = fs.readJsonSync(configfile)
if (config.DiscordToken != " --- BOT TOKEN HERE --- ") {
  console.log();
  const express = require('express')
  const sha256 = require('sha256')
  const bodyParser = require('body-parser')
  const shell = require('shelljs')
  const watch = require('node-watch')
  const sass = require('npm-sass')
  const fetch = require('node-fetch')
  const Discord = require("discord.js")
  const client = new Discord.Client()
  const app = express()

  app.use(express.static('./www/'))
  app.use(bodyParser.json(true));
  app.use(bodyParser.urlencoded({extended: true}));

  // check sha256 of config.json
  if (sha256(config.DiscordToken) != '2cf46a37d7d246c6f44e0f1f818424d27c31fefbe7397904572ed81d8ec9cafe') {
    console.log("not matching discord token sha256 checksum, token is probably wrong");
  }

  // a route to stop the script
  app.get("/stopscript", function(req,res) {
    process.exit()
    setTimeout(function () {
      res.send('OK');
    }, 10);
  })

  const port = 7777;

  // test if there is already a server running if so stop it and ask the user to run the script again
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

  // sass compiler
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

  client.on('ready', () => {
    console.log('I am ready!');
  });

  client.on('message', message => {
    if (message.content === 'ping') {
      message.reply('pong');
    }
  });

  client.login(config.DiscordToken);
} else {
  console.log('No discord token inside config.json');
}
