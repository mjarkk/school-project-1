Vue.component('rooster', {
  template: '#timetable-component',
  data: function() {
    return ({
      search: '',
      timetabletype: 'student',
      timetableclassname: '',
      fromofflinestorage: true,
      showtimetable: false,
      schedulemenu: false,
      timetablefound: true,
      dayhours: [9,10,11,12,13,14,15,16],
      roosterdata: {
        monday: [],
        tuesday: [],
        wednsday: [],
        thursday: [],
        friday: []
      },
      timetableoptions: []
    })
  },
  methods: {
    backtosearch: function() {
      var vm = this;
      vm.fetch('/roosterlist',function(roosters) {
        vm.timetableoptions = roosters;
        vm.showtimetable = false;
        vm.schedulemenu = true;
      })
    },
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
    },
    loadtimetable: function(url,type,classname,isnew) {
      var url = url;
      var type = type;
      var classname = classname;
      var vm = this;
      vm.fetch('/t/' + type + '/' + encodeURIComponent('https://roosters.xedule.nl' + url),function(timetable) {
        if (timetable.status) {
          vm.roosterdata = timetable.weekdata;
          vm.schedulemenu = false;
          vm.showtimetable = true;
          if (isnew) {
            if (!location.pathname.startsWith('/rooster/')) {
              Lockr.set('timetabletype', type)
              Lockr.set('timetableurl', url)
              Lockr.set('timetableclassname', classname)
            }
            vm.timetabletype = type;
            vm.timetableclassname = classname;
          }
          if (!location.pathname.startsWith('/rooster/')) {
            Lockr.set('savedtimetable', timetable.weekdata)
          } else {
            vm.timetableclassname = classname;
          }
          vm.fromofflinestorage = false;
        }
      })
    }
  },
  created: function() {
    var vm = this;
    if (location.pathname.startsWith('/rooster/')) {
      vm.showtimetable = true;
      var classname = location.pathname.replace('/rooster/','');
      vm.fetch('/roosterinf/' + classname ,function(inf) {
        if (inf.status) {
          vm.loadtimetable(inf.data.url,inf.data.type,classname,false)
        } else {
          vm.timetablefound = false;
        }
      })
    } else {
      var offlinedata = Lockr.get('savedtimetable');
      if (typeof(offlinedata) == 'object') {
        vm.roosterdata = offlinedata;
        vm.showtimetable = true;
        vm.timetabletype = Lockr.get('timetabletype');
        vm.timetableclassname = Lockr.get('timetableclassname');
        vm.loadtimetable(Lockr.get('timetableurl'),vm.timetabletype,vm.timetableclassname,false)
      } else {
        vm.fetch('/roosterlist',function(roosters) {
          vm.timetableoptions = roosters;
          vm.schedulemenu = true;
        })
      }
    }
  }
});

new Vue({
  el: '.roosterholder'
})
