const fs = require('fs-extra');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

fetch('https://roosters.xedule.nl/OrganisatorischeEenheid/Attendees/34?Code=Boumaboulevard').then(function(res) {
  return res.text();
}).then(function(body) {
  const $ = cheerio.load(body);
  let roosteroptions = []
  $('body').find('a').each(function() {
    var href = $(this).attr('href');
    var basicurl = '/Attendee/ScheduleCurrent/'
    if (href.startsWith(basicurl)) {
      var snippit = href.replace(basicurl, '')
      snippit = snippit.slice(snippit.indexOf('?Code=') + 6, snippit.length)
      snippit = snippit.slice(0, snippit.indexOf('&'))
      roosteroptions.push({
        classname: snippit,
        url: href
      })
    }
  });
  console.log('all rooster links have been updated');
});
