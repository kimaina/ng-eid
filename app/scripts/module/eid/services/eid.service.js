/*jshint -W003, -W098, -W117, -W026 */
(function() {
  'use strict';

  angular
    .module('app.eid')
    .service('EIDRestService', EIDRestService);

  EIDRestService.$inject = [
    'eldConfig',
    '$resource',
    'CacheFactory',
    '$q'
  ];

  function EIDRestService(eldConfig, $resource, CacheFactory, $q) {
    var defaultCachingProperty =
      CacheFactory(Math.random() + 'cache', {
        maxAge: 5 * 60 * 1000, // Items added to this cache expire after 15 minutes
        cacheFlushInterval: 5 * 60 * 1000, // This cache will clear itself every hour
        deleteOnExpire: 'aggressive' // Items will be deleted from this cache when they expire
      });
    var serviceDefinition;
    serviceDefinition = {
      getResource: getResource,
      getOrders: getOrders
    };
    return serviceDefinition;

    function getResource(path, cacheProperty) {
      var caching = defaultCachingProperty;
      if (!_.isEmpty(cacheProperty)) {
        caching = cacheProperty;
      }
      return $resource(path, {
        uuid: '@uuid'
      }, {
        get: {
          method: 'GET',
          cache: caching
        }
      });
    }

    function getTestResults(params,server) {
      var resource = getResource('mockeid.json');
      //var resource = getResource(server+'orders/api.php');
      return resource.get(params).$promise;
    }
  }
})();
