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
const cheerio = require('cheerio')
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
  if (message.content === 'ping') {
    message.reply('pong')
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
  var schoolweek = {
    monday: [],
    tuesday: [],
    wednsday: [],
    thursday: [],
    friday: []
  };
  var timetable = "";
  timetable = timetablehtml.replace(/(\r\n|\n|\r)/gm,"");
  rawhtmltojson();
  function isNumber(n) { return /^-?[\d.]+(?:e-?\d+)?$/.test(n); };
  function rawhtmltojson() {
    if (timetable.search(/<div class="Les"/i) != -1) {
      timetable = timetable.substr(timetable.search(/<div class="Les"/i), timetable.length);
      if (timetable.search(/<\/div>                <div class="Les"/i) != -1) {
        CW = timetable.substr(0, timetable.search(/<\/div>                <div class="Les"/i) + 6);
      } else {
        CW = timetable;
      }
      timetable = timetable.substr(CW.length, timetable.length);
      CW = CW.substr(CW.search(/eft:/i) + 4, CW.length);
      CWday = CW.substr(0, CW.search(/">/i));
      CW = CW.substr(CW.search(/title="/i) + 7, CW.length);
      CWsubject = CW.substr(0, CW.search(/">/i));
      CW = CW.substr(CW.search(/title="/i) + 7, CW.length);
      CWtime = CW.substr(0, CW.search(/">/i));
      CW = CW.substr(CW.search(/title="/i) + 7, CW.length);
      CWplace = CW.substr(0, CW.search(/">/i));
      CW = CW.substr(CW.search(/title="/i) + 7, CW.length);
      CWteacher = CW.substr(0, CW.search(/">/i));
      if (isNumber(CWplace.substr(0,1))) {
        CWplace = "none";
      }
      if (CWteacher == "" || false || 0 || NaN || null || undefined) {
        CWteacher = "none";
      }
      CWTimeStartHours = CWtime.substr(0,2);
      CWTimeStartMinutes = CWtime.substr(3,2);
      CWTimeEndHourse = CWtime.substr(6,2);
      CWTimeEndMinutes = CWtime.substr(9,2);
      if (type == "student" || type == "studentgroep") {
        var CWJSON = {
          subject: CWsubject,
          time: {
            HourseStart: CWTimeStartHours,
            MinutesStart: CWTimeStartMinutes,
            HourseEnd: CWTimeEndHourse,
            MinutesEnd: CWTimeEndMinutes
          },
          place: CWplace,
          teacher: CWteacher
        };
      } else if (type == "teacher" || type == "medewerker") {
        var CWJSON = {
          subject: CWsubject,
          time: {
            HourseStart: CWTimeStartHours,
            MinutesStart: CWTimeStartMinutes,
            HourseEnd: CWTimeEndHourse,
            MinutesEnd: CWTimeEndMinutes
          },
          students: CWplace,
          local: CWteacher
        };
      } else if (type == "class" || type == "faciliteit") {
        var CWJSON = {
          subject: CWsubject,
          time: {
            HourseStart: CWTimeStartHours,
            MinutesStart: CWTimeStartMinutes,
            HourseEnd: CWTimeEndHourse,
            MinutesEnd: CWTimeEndMinutes
          },
          place: CWplace,
          class: "---"
        };
      } else {
        var CWJSON = {
          subject: CWsubject,
          time: {
            HourseStart: CWTimeStartHours,
            MinutesStart: CWTimeStartMinutes,
            HourseEnd: CWTimeEndHourse,
            MinutesEnd: CWTimeEndMinutes
          },
          place: CWplace,
          teacher: CWteacher
        };
      }
      if (CWday == " 160px;") {
        schoolweek.monday.push(CWJSON);
      } else if (CWday == " 318px;") {
        schoolweek.tuesday.push(CWJSON);
      } else if (CWday == " 476px;") {
        schoolweek.wednsday.push(CWJSON);
      } else if (CWday == " 634px;") {
        schoolweek.thursday.push(CWJSON);
      } else if (CWday == " 792px;") {
        schoolweek.friday.push(CWJSON);
      } else {}
      rawhtmltojson();
    }
  }
  return schoolweek;
}
