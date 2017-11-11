const fs = require('fs-extra')
const colors = require('colors')
const cheerio = require('cheerio')
let configfile = './config.json';
const port = 7777;

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

var timetabledata = {
  links: []
}
const express = require('express')
const sha256 = require('sha256')
const bodyParser = require('body-parser')
const shell = require('shelljs')
const watch = require('node-watch')
const sass = require('npm-sass')
const fetch = require('node-fetch')
const request = require('request')
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

// routs
app.get("/stopscript", function(req,res) {
  process.exit()
  setTimeout(function () {
    res.send('OK');
  }, 10);
})

app.get("/roosterlist",function(req,res) {
  res.json(timetabledata.links)
})

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

// fetch rooster links from the network
function UpdateTimeTableLinks() {
  fetch('https://roosters.xedule.nl/OrganisatorischeEenheid/Attendees/34?Code=Boumaboulevard').then(function(res) {
    return res.text();
  }).then(function(body) {
    const $ = cheerio.load(body);
    let roosteroptions = []
    $('body').find('.AttendeeTypeBlock').each(function() {
      var titletext = $(this).children("strong").text();
      var apitext = titletext;
      if (titletext == 'Studentgroep') {
        apitext = 'student';
      } else if (titletext == 'Medewerker') {
        apitext = 'teacher';
      } else if (titletext == 'Faciliteit') {
        apitext = 'class';
      }
      $(this).find('a').each(function() {
        var href = $(this).attr('href');
        var basicurl = '/Attendee/ScheduleCurrent/'
        if (href.startsWith(basicurl)) {
          var snippit = href.replace(basicurl, '')
          snippit = snippit.slice(snippit.indexOf('?Code=') + 6, snippit.length)
          snippit = snippit.slice(0, snippit.indexOf('&'))
          roosteroptions.push({
            classname: snippit,
            url: href,
            type: apitext
          })
        }
      });
    });
    timetabledata.links = roosteroptions;
    console.log('all rooster links have been updated');
  });
}
UpdateTimeTableLinks()

// discord bot
client.on('ready', () => {
  console.log('I am ready!');
});

client.on('message', message => {
  var message = message;
  if (message.content === 'ping') {
    message.reply('pong')
  } else if (message.content.startsWith('!rooster')) {
    // fetch('http://localhost:' + port + '/t/student/https%3A%2F%2Froosters.xedule.nl%2FAttendee%2FScheduleCurrent%2F83419%3FCode%3DB-ITB4-1e%26attId%3D1%26OreId%3D34').then(function(res) {
    //   return res.text();
    // }).then(function(body) {
    //   message.reply(body)
    // });
    message.reply('can\'t do')
  }
});

client.login(config.DiscordToken);

// rooster api from: https://github.com/mjarkk/node-xedule-web-api
app.get('/t/:type/:timetableurl', givetimetable);
function givetimetable(req, res) {
  var url = req.params['timetableurl'];
  var type = req.params['type'];
  if (url.substring(0, 26) == "https://roosters.xedule.nl") {
    request({
      uri: url,
    }, function(error, response, body) {
      res.json({
        status: true,
        requrl: url,
        type: type,
        weekdata: GetXedule(body,type)
      });
    })
  } else {
    res.json({
      status: false,
      why: "not xedule url"
    });
  }
}

} else {
  console.log(colors.red.bold('No discord token inside config.json'));
}

// rooster api from: https://github.com/mjarkk/node-xedule-web-api
function GetXedule (timetablehtml,type) {
  var type = type;
  const $ = cheerio.load(timetablehtml);
  var output = {
    monday: [],
    tuesday: [],
    wednsday: [],
    thursday: [],
    friday: []
  }
  $('body').find('.Les').each(function() {
    var ToAdd = {
      time: {
        HourseEnd: "",
        HourseStart: "",
        MinutesEnd: "",
        MinutesStart: ""
      }
    }
    $(this).find('.LesCode').each(function() {
      ToAdd['subject'] = $(this).text().replace(/\s/g, '')
    })
    $(this).find('.LesTijden').each(function() {
      var fulltime = $(this).text().replace(/\s/g, '');
      ToAdd.time.HourseStart = fulltime.slice(0,2)
      ToAdd.time.MinutesStart = fulltime.slice(3,5)
      ToAdd.time.HourseEnd = fulltime.slice(6,8)
      ToAdd.time.MinutesEnd = fulltime.slice(9,11)
    })
    $(this).find('.AttendeeBlockColumn_1 div a').each(function() {
      var item = $(this).text().replace(/\s/g, '')
      if (type == 'student') {
        ToAdd['place'] = item
      } else if (type == 'class') {
        ToAdd['teacher'] = item
      } else if (type == 'teacher') {
        ToAdd['students'] = item
      }
    })
    $(this).find('.AttendeeBlockColumn_2 div a').each(function() {
      var item = $(this).text().replace(/\s/g, '')
      if (type == 'student') {
        ToAdd['teacher'] = item
      } else if (type == 'teacher') {
        ToAdd['local'] = item
      }
    })
    if ($(this).css('left') == '160px') {
      output.monday.push(ToAdd)
    } else if ($(this).css('left') == '318px') {
      output.tuesday.push(ToAdd)
    } else if ($(this).css('left') == '476px') {
      output.wednsday.push(ToAdd)
    } else if ($(this).css('left') == '634px') {
      output.thursday.push(ToAdd)
    } else if ($(this).css('left') == '792px') {
      output.friday.push(ToAdd)
    }
  });
  return output;
}
