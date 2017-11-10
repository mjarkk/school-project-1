!function(e,t){"undefined"!=typeof exports?"undefined"!=typeof module&&module.exports&&(exports=module.exports=t(e,exports)):"function"==typeof define&&define.amd?define(["exports"],function(r){e.Lockr=t(e,r)}):e.Lockr=t(e,{})}(this,function(e,t){"use strict";return Array.prototype.indexOf||(Array.prototype.indexOf=function(e){var t=this.length>>>0,r=Number(arguments[1])||0;for((r=r<0?Math.ceil(r):Math.floor(r))<0&&(r+=t);r<t;r++)if(r in this&&this[r]===e)return r;return-1}),t.prefix="",t._getPrefixedKey=function(e,t){return(t=t||{}).noPrefix?e:this.prefix+e},t.set=function(e,t,r){var o=this._getPrefixedKey(e,r);try{localStorage.setItem(o,JSON.stringify({data:t}))}catch(r){console&&console.warn("Lockr didn't successfully save the '{"+e+": "+t+"}' pair, because the localStorage is full.")}},t.get=function(e,t,r){var o,n=this._getPrefixedKey(e,r);try{o=JSON.parse(localStorage.getItem(n))}catch(e){o=localStorage[n]?{data:localStorage.getItem(n)}:null}return o?"object"==typeof o&&void 0!==o.data?o.data:void 0:t},t.sadd=function(e,r,o){var n,a=this._getPrefixedKey(e,o),i=t.smembers(e);if(i.indexOf(r)>-1)return null;try{i.push(r),n=JSON.stringify({data:i}),localStorage.setItem(a,n)}catch(t){console.log(t),console&&console.warn("Lockr didn't successfully add the "+r+" to "+e+" set, because the localStorage is full.")}},t.smembers=function(e,t){var r,o=this._getPrefixedKey(e,t);try{r=JSON.parse(localStorage.getItem(o))}catch(e){r=null}return r&&r.data?r.data:[]},t.sismember=function(e,r,o){return t.smembers(e).indexOf(r)>-1},t.keys=function(){var e=[],r=Object.keys(localStorage);return 0===t.prefix.length?r:(r.forEach(function(r){-1!==r.indexOf(t.prefix)&&e.push(r.replace(t.prefix,""))}),e)},t.getAll=function(e){var r=t.keys();return e?r.reduce(function(e,r){var o={};return o[r]=t.get(r),e.push(o),e},[]):r.map(function(e){return t.get(e)})},t.srem=function(e,r,o){var n,a,i=this._getPrefixedKey(e,o),c=t.smembers(e,r);(a=c.indexOf(r))>-1&&c.splice(a,1),n=JSON.stringify({data:c});try{localStorage.setItem(i,n)}catch(t){console&&console.warn("Lockr couldn't remove the "+r+" from the set "+e)}},t.rm=function(e){var t=this._getPrefixedKey(e);localStorage.removeItem(t)},t.flush=function(){t.prefix.length?t.keys().forEach(function(e){localStorage.removeItem(t._getPrefixedKey(e))}):localStorage.clear()},t});

Lockr.prefix = 'lockr';
var fastlinks = new Vue({
  el: '.fast-links',
  data: {
    morelinksopen: false,
    morelinksopenCopy: false,
    links: [
      {
        "name": "Moodle",
        "icon": "moodle",
        "description": "Digitale Leeromgeving voor ICT-opleidingen (Moodle Learning Management System)",
        "link": "http://www.ict-alfa.nl/ict-gron/login/index.php"
      },{
        "name": "Rooster service",
        "icon": "xedule",
        "description": "Rooster Service. Hierin kan je alle roosters van alle klassen, lokalen en leraren bekijken.",
        "link": "https://roosters.xedule.nl/Attendee/ScheduleCurrent/14488?Code=B-ITM3-2a&attId=1&OreId=34"
      },{
        "name": "Actie",
        "icon": "alfa-logo1",
        "description": "Actie (portal) van het Alfa College.",
        "link": "https://actie.alfa-college.nl/CookieAuth.dll?GetLogon?curl=Z2F&reason=0&formdir=2"
      },{
        "name": "School Webmail",
        "icon": "email-icon",
        "description": "Hier kan je mensen vinden om mee te daten",
        "link": "https://login.microsoftonline.com/"
      }
    ],
    morelinks: [
      {
        "tabname": "Cijfer",
        "links": [
          {
            "name": "EduArte",
            "description": "Hier zijn alle school cijfers te vinden en je 60% aanwezighijt.",
            "link": "https://alfacollege-selfservice.educus.nl/app/login/Alfa-college?0"
          },{
            "name": "Alfa-online",
            "description": "Ik weet ook niet wat hier valt ze zien.",
            "link": "https://www.alfa-online.nl/ict-gron-05/"
          }
        ]
      },{
        "tabname": "ICT-Beheer",
        "links": [
          {
            "name": "OracleAcademy",
            "description": "Hier kan je oracles verslaan met ict krachten.",
            "link": "https://ilearning.oracle.com/ilearn/en/learner/jsp/login.jsp?site=OracleAcad"
          },{
            "name": "Microsoft Dreamspark",
            "description": "Hier kan je GRATIS stuff halen!",
            "link": "https://e5.onthehub.com/WebStore/ProductsByMajorVersionList.aspx?ws=02980f50-a58b-e011-969d-0030487d8897&vsro=8"
          }
        ]
      },{
        "tabname": "Net-Beheer",
        "links": [
          {
            "name": "CISCO Netacad",
            "description": "Hier staat al het lesmateriaal een toetsen van cisco.",
            "link": "https://www.netacad.com"
          },{
            "name": "Microsoft Dreamspark",
            "description": "Hier kan je GRATIS stuff halen!",
            "link": "https://e5.onthehub.com/WebStore/ProductsByMajorVersionList.aspx?ws=02980f50-a58b-e011-969d-0030487d8897&vsro=8"
          }
        ]
      },{
        "tabname": "APP-Ontwikkeling",
        "links": [
          {
            "name": "Codecademy.",
            "description": "Leer html, css, javascript, php, java, pyton en nog veel meer.",
            "link": "https://www.codecademy.com/"
          },{
            "name": "Codrops",
            "description": "Leuke web tutorials en ideeën",
            "link": "https://tympanus.net/codrops/"
          },{
            "name": "Google fonts",
            "description": "Font's voor je website en/of photoshop.",
            "link": "https://fonts.google.com/"
          },{
            "name": "Electron",
            "description": "Maak van je website een desktop app.",
            "link": "http://electron.atom.io/"
          }
        ]
      }
    ]
  },
  watch: {
    morelinksopen: function(newval) {
      var vm = this;
      if (typeof(newval) == 'number') {
        vm.morelinksopenCopy = newval;
      }
    }
  }
})

var fastlinks = new Vue({
  el: '.roosters',
  data: {
    search: '',
    showtimetable: false,
    schedulemenu: false,
    roosterdata: {
      monday: [],
      tuesday: [],
      wednsday: [],
      thursday: [],
      friday: []
    },
    timetableoptions: []
  },
  methods: {
    fetch: function(what, callback) {
      fetch(what).then(function(res) {
        return res.json()
      })
      .then(function(json) {
        callback(json)
      })
      .catch(function(error) {
        console.log('fetch error:',error)
      });
    }
  },
  created: function() {
    var vm = this;
    if (Lockr.get('savedrooster') == 'object') {

    } else {
      vm.fetch('/roosterlist',function(roosters) {
        vm.timetableoptions = roosters;
        vm.schedulemenu = true;
      })
    }
  }
})
