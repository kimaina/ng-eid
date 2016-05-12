/*jshint -W003, -W098, -W117, -W026 */
(function () {
  'use strict';

  angular
    .module('app.eid')
    .service('EIDRestService', EIDRestService);

  EIDRestService.$inject = [
    'eidConfig',
    '$resource',
    'CacheFactory',
    '$q'
  ];

  function EIDRestService(eidConfig, $resource, CacheFactory, $q) {
    var defaultCachingProperty =
      CacheFactory(Math.random() + 'cache', {
        maxAge: 5 * 60 * 1000, // Items added to this cache expire after 15 minutes
        cacheFlushInterval: 5 * 60 * 1000, // This cache will clear itself every hour
        deleteOnExpire: 'aggressive' // Items will be deleted from this cache when they expire
      });
    var noOfServers=eidConfig.servers.length||0;
    var serviceDefinition;

    serviceDefinition = {
      getResource: getResource,
      getLabTests: getLabTests
    };
    return serviceDefinition;

    function getResource(path, serverId, cacheProperty) {
      var caching = defaultCachingProperty;
      if (!_.isEmpty(cacheProperty)) {
        caching = cacheProperty;
      }
      if (!_.isEmpty(serverId)) {
        serverId = 0;
      }
      return $resource(eidConfig.servers[serverId].url + path, {
        uuid: '@uuid'
      }, {
        get: {
          method: 'GET',
          cache: caching
        }
      });
    }
    function iterateThroughEachServer(path, params, serverIndex, callback, failback){
      if(serverIndex<noOfServers) {
        var resource = getResource(path, serverIndex);
        params.apikey=eidConfig.servers[serverIndex].apiKey;
        resource.get(params).$promise.then(function (response) {
          console.log(response);
          if (response.posts.length > 0) {
            callback(response.posts);
          } else {
            serverIndex++;
            iterateThroughEachServer(path, params, serverIndex, callback, failback);
          }

        }).catch(function (error) {
          console.error(error);
          failback(error)
        });
      } else {
        callback([]);
      }
    }

    function getLabTests(params, callback, failback) {
      var path = 'orders/api.php';
      iterateThroughEachServer(path, params, 0, function(result){
        callback(result);
      }, function(error){
        failback(error);
      });
    }

    function getTestResults(params, server) {
      var resource = getResource('mockeid.json');
      //var resource = getResource(server+'orders/api.php');
      return resource.get(params).$promise;
    }
  }
})();
