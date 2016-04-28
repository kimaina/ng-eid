(function() {
  'use strict';

  angular
    .module('app.eid', []).constant('eldConfig', {
      servers: [
        {
          name:'Ampath',
          url: 'http://eid.ampath.or.ke:85/eid/'
        }
      ]
    });
})();
