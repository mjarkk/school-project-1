const fs = require('fs-extra')
const colors = require('colors');
let configfile = './config.json';

if (!fs.pathExistsSync(configfile)) {
  console.log(colors.red.bold('---------------------------------------------'));
  console.log(colors.red.bold('config file does not exsist, creating one....'));
  fs.outputJsonSync(configfile, {
    DiscordToken: ' --- BOT TOKEN HERE --- '
  })
  console.log(' ');
  console.log(colors.red.bold('Place a discord token inside of: config.json'));
  console.log(colors.red.bold('---------------------------------------------'));
  process.exit()
}
var config = fs.readJsonSync(configfile)
if (config.DiscordToken != " --- BOT TOKEN HERE --- ") {
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
  app.use('/node', express.static('./node_modules/'))
  app.use(bodyParser.json(true));
  app.use(bodyParser.urlencoded({extended: true}));

  // check sha256 of config.json
  if (sha256(config.DiscordToken) != '52a67300203195fb42651c221199ecff43269ee5bc755f7b58d582682369304e') {
    console.log(colors.red("not matching discord token sha256 checksum, token is probably wrong"));
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
        console.log(colors.red.bold('---------------------------------'));
        console.log(colors.red.bold('Port: ' + port + ' already in use!'));
        console.log(colors.red.bold('Try to start the webserver again'));
        console.log(colors.red.bold('---------------------------------'));
        process.exit()
      });
      setTimeout(function () {
        console.log(' ');
        console.log(colors.red.bold('---------------------------------'));
        console.log(colors.red.bold('Port: ' + port + ' already in use!'));
        console.log(colors.red.bold('Try to start the webserver again'));
        console.log(colors.red.bold('---------------------------------'));
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
      message.reply('pong')
    }
  });

  client.login(config.DiscordToken);
} else {
  console.log(colors.red.bold('No discord token inside config.json'));
}
