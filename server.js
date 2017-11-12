const fs = require('fs-extra')
const colors = require('colors')
const cheerio = require('cheerio')
let configfile = './config.json';
const port = 7777;

if (!fs.pathExistsSync(configfile)) {
  console.log(colors.red.bold('---------------------------------------------'));
  console.log(colors.red.bold('config file does not exsist, creating one....'));
  fs.outputJsonSync(configfile, {
    DiscordToken: ' --- BOT TOKEN HERE --- ',
    groupname: {}
  })
  console.log(' ');
  console.log(colors.red.bold('Place a discord token inside of: config.json and group name'));
  console.log(colors.red.bold('---------------------------------------------'));
  process.exit()
}
var config = fs.readJsonSync(configfile)
if (config.DiscordToken != " --- BOT TOKEN HERE --- ") {

var timetabledata = {
  links: [],
  LinksByIndex: {}
}
const puppeteer = require('puppeteer')
const express = require('express')
const sha256 = require('sha256')
const bodyParser = require('body-parser')
const shell = require('shelljs')
const watch = require('node-watch')
const sass = require('npm-sass')
const fetch = require('node-fetch')
const request = require('request')
const Discord = require("discord.js")
const ejs = require('ejs')
const path = require('path');
const app = express()

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/www'));
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

app.get('/',function(req,res) {
  res.render('index.ejs', {
    fullpage: true
  });
})

app.get('/api',function(req,res) {
  res.render('api.ejs');
})

app.get('/roosterinf/:class',function(req,res) {
  var selected = req.params.class;
  if (timetabledata.LinksByIndex[selected]) {
    res.json({
      status: true,
      data: timetabledata.LinksByIndex[selected]
    })
  } else {
    res.json({
      status: false
    })
  }
})

app.get('/rooster/:class',function(req,res) {
  res.render('index.ejs', {
    fullpage: false
  });
})

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

app.get('*', function(req, res){
  res.render('404.ejs');
});

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
    for (var i = 0; i < roosteroptions.length; i++) {
      timetabledata.LinksByIndex[roosteroptions[i].classname] = {
        url: roosteroptions[i].url,
        type: roosteroptions[i].type
      }

    }
    console.log('all rooster links have been updated');
  });
}
UpdateTimeTableLinks()

function addgroupe(data) {
  var data = data;
  fs.readJson(configfile, (err, output) => {
    config = output;
    config.groupname[data.serverid] = data;
    fs.outputJson(configfile, config, err => {
      console.log('updated config');
    })
  })
}

// discord bot
class Discordbot {
  constructor(data) {
    var vm = this;
    if (data.token) {
      vm.client = new Discord.Client()
      vm.client.on('ready', () => {
        vm.client.user.setGame('niks doen -_-')
        console.log('I am ready!');
      });
      vm.client.on('message', message => {
        var message = message;
        var content = message.content;
        if (content === 'ping') {
          message.reply('pong')
        } else if (content === '!rooster') {
          // console.log(message.channel.guild.name); // server name
          var serverid = message.channel.guild.id;
          var rooster = config.groupname[serverid]
          if (typeof(rooster) == "object") {
            timetablescreenshot(rooster.classname,function() {
              setTimeout(function () {
                message.channel.send("Het rooster van: " + rooster.classname, {
                  file: './discord-bot-content/screenshot.png'
                });
              }, 500);
            })
          } else {
            message.channel.send("Deze discord server heeft nog geen rooster voeg, type: !setrooster {klas/leeraar/locaal}")
          }
        } else if (content.startsWith('!setrooster ')){
          var classname = content.replace('!setrooster ','');
          if (timetabledata.LinksByIndex[classname]) {
            addgroupe({
              servername: message.channel.guild.name,
              serverid: message.channel.guild.id,
              classname: classname
            })
            message.channel.send("Oke het standaart rooster voor deze klas is nu " + classname)
          } else {
            message.channel.send("Hmmm dit rooster bestaad niet :(")
          }
        } else if (content.startsWith('!rooster ') && timetabledata.LinksByIndex[content.replace('!rooster ','')]) {
          var classname = content.replace('!rooster ','');
          timetablescreenshot(classname,function() {
            setTimeout(function () {
              message.channel.send("Het rooster van: " + classname, {
                file: './discord-bot-content/screenshot.png'
              });
            }, 500);
          })
        } else if (content.startsWith('!rooster ')) {
          message.reply('Geen rooster gevonden :(')
        } else if (content === '!help' || content === 'help') {
          message.channel.send(`Dingen die ik kan doen:
!rooster = het standaart ingestelde rooster tonen
!rooster { klas/leeraar/locaal } = een rooster voor het opgevraagde onderwerp
!botinfo = botinfo dhaa
!setrooster { klas/leeraar/locaal } = set het standaart rooster van de discord`)
        } else if (content === '!botinfo' || content === 'botinfo') {
          var ChannelHasStandaartRooster = typeof(config.groupname[message.channel.guild.id]) == "object";
          message.channel.send(
            'Rooster bot info: \n' +
            '- Standaart rooster: ' + (ChannelHasStandaartRooster ? config.groupname[message.channel.guild.id].classname : "nog niks ingesteld")
          )
        } else if (content === 'test') {
          // just for testing things :D
          message.channel.send(`boring response :(`)
        }
      });
      vm.client.login(data.token);
    } else {
      console.log('error: no discord token');
    }
  }
}

new Discordbot({
  token: config.DiscordToken
})

// function for creating a screenshot of a spesific timetable
function timetablescreenshot(timetablename, callback) {
  (async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 555, height: 925 });
    await page.goto('http://localhost:' + port + '/rooster/' + timetablename, {waitUntil: 'networkidle2'});
    await page.screenshot({
      path: './discord-bot-content/screenshot.png',
      clip: {
        x: 10,
        y: 170,
        width: 535,
        height: 700
      }
    });
    await browser.close();
    callback()
  })();
}

// automaticly create a screenshot of the page for readme.md
setTimeout(function () {
  (async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 1300, height: 750 });
    await page.goto('http://localhost:' + port + '/', {waitUntil: 'networkidle2'});
    await page.screenshot({
      path: './pagescreenshot.png'
    });
    await browser.close();
  })();
}, 10000);

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
