(function() {
  'use strict';

  angular
    .module('app.eid', [
      'angular-cache'
    ])
    .config(function() {

    })
    .constant('eidConfig', {
      servers: [
        {
          name:'Ampath',
          url: 'http://eid.ampath.or.ke:85/eid/',
          apiKey: '35243eba2'
        },
        {
          name:'Alupe',
          url: 'http://41.79.169.130:85/eid/',
          apiKey: '45243ebb8'
        }
      ]
    });
})();
