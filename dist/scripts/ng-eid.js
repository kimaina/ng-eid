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

/*jshint -W098, -W030 */
(function() {
  'use strict';

  angular
    .module('app.eid')
      .filter('titlecase', titleCaseFilter);

  function titleCaseFilter() {
    return function(s) {
        s = ( s === undefined || s === null ) ? '' : s;
        return s.toString().toLowerCase().replace( /\b([a-z])/g, function(ch) {
            return ch.toUpperCase();
        });
    };
  }
})();

/* global angular */
/*
 jshint -W003, -W026
 */
(function () {
  'use strict';

  angular
    .module('app.eid')
    .directive('eidLabTests', eidLabTests);

  function eidLabTests() {
    return {
      restrict: "E",
      scope: {
        patientIdentifiers: "=",
        isBusy: "=",
        eidLabTests: "="
      },
      controller: eidLabTestsController,
      link: eidLabTestsLink,
      templateUrl: "views/eid/eid-labs-summary.html"
    };
  }

  eidLabTestsController.$inject = ['$scope', 'EIDRestService', '$filter'];
  function eidLabTestsController($scope, EIDRestService, $filter) {

    $scope.eidLabTests = [];
    $scope.isBusy = false;
    $scope.pageSize = 100;
    $scope.currentPage = 1;
    $scope.loadMoreLabTests = loadMoreLabTests;
    $scope.allDataLoaded = false;
    $scope.experiencedLoadingError = false;
    $scope.nextPatientIdIndex = $scope.patientIdentifiers.length - 1;

    function loadMoreLabTests() {
      if ($scope.isBusy === true) return;
      $scope.isBusy = true;
      $scope.experiencedLoadingError = false;
      var params = {
        patientID: $scope.patientIdentifiers[$scope.nextPatientIdIndex],
        currentpage: $scope.currentPage,
        test: 2
      };
      EIDRestService.getLabTests(params, onFetchLabTestsSuccess, onFetchLabTestsFailed);
    }

    function onFetchLabTestsSuccess(eidLabTestsData) {
      $scope.isBusy = false;
      $scope.eidLabTests = eidLabTestsData;
      updatePaging(eidLabTestsData.length);
      if (eidLabTestsData.length === 0)tryFetchingUsingDifferentId();
    }

    function onFetchLabTestsFailed(error) {
      $scope.experiencedLoadingError = true;
      $scope.isBusy = false;
    }

    function updatePaging(size) {
      if (size >= $scope.pageSize) {
        $scope.currentPage++;
        $scope.allDataLoaded = false;
      } else {
        $scope.allDataLoaded = true;
      }
    }

    function tryFetchingUsingDifferentId() {
      if ($scope.nextPatientIdIndex > -1) {
        $scope.allDataLoaded = false;
        $scope.nextPatientIdIndex--;
        loadMoreLabTests();
      } else {
        $scope.allDataLoaded = true;
      }
    }
  }

  function eidLabTestsLink(scope, element, attrs, vm) {
    attrs.$observe('patientIdentifiers', onPatientUuidChanged);

    function onPatientUuidChanged(newVal, oldVal) {
      if (newVal && newVal != "") {
        scope.isBusy = false;
        scope.allDataLoaded = false;
        scope.currentPage = 0;
        scope.eidLabTests = [];
        scope.loadMoreLabTests();
      }
    }
  }

})();

angular.module('app.eid').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('views/eid/eid-labs-summary.html',
    "<div ng-disabled=\"isBusy\"> <table class=\"table table-hover table-striped table-responsive\"> <thead> <tr> <th>Lab ID</th> <th>Provider ID</th> <th>MFL Code</th> <th>Patient ID</th> <th>Patient Names</th> <th>Location</th> <th>Date Collected</th> <th>Date Received</th> <th>Date Tested</th> <th>Date Dispatched</th> <th>Result</th> <th>Final Result</th> </tr> </thead> <tr ng-repeat=\"eidLabTest in eidLabTests\"> <td>{{eidLabTest.LabID}}</td> <td>{{eidLabTest.ProviderID}}</td> <td>{{eidLabTest.MFLCode}}</td> <td>{{eidLabTest.PatientID}}</td> <td>{{eidLabTest.PatientNames}}</td> <td>{{eidLabTest.AMRslocation}}</td> <td>{{eidLabTest.DateCollected}}</td> <td>{{eidLabTest.DateReceived}}</td> <td>{{eidLabTest.DateTested}}</td> <td>{{eidLabTest.DateDispatched}}</td> <td>{{eidLabTest.Result}}</td> <td>{{eidLabTest.FinalResult}}</td> </tr> </table> <div ng-show=\"experiencedLoadingError\"> <p class=\"bg-danger\" style=\"padding:4px\"> <b> <span style=\"color:red\" class=\"glyphicon glyphicon-exclamation-sign\"></span>An error occured while loading. Please try again.</b> </p><p> </p></div> <div ng-show=\"!isBusy && !allDataLoaded\"> <button class=\"btn btn-info\" ng-click=\"loadMoreLabTests()\"> <span class=\"glyphicon glyphicon-refresh\"></span>Load More</button> </div> <div ng-show=\"isBusy && !allDataLoaded\"> <img ng-show=\"isBusy\" src=\"images/ajax-loader.gif\" autofocus> <b>Loading data...</b> </div> <div ng-show=\"allDataLoaded\"> <p class=\"bg-info\" style=\"padding:4px\"> <b> <span style=\"color:green\" class=\"glyphicon glyphicon-ok\">All lab tests loaded {{'[ ' + eidLabTests.length + ' ]'}}</b> </p><p> </p></div> </div>"
  );


  $templateCache.put('views/eid/eid.html',
    "<table class=\"table\"> <thead> <tr> <th> LabID </th> <th> PatientID </th> <th> ProviderID </th> <th> MFLCode </th> <th> AMRslocationID </th> <th> PatientNames </th> <th> DateCollected </th> <th> DateReceived </th> <th> DateTested </th> <th> Result </th> <th> FinalResult </th><th> DateDispatched </th> </tr> </thead> <tbody> <tr ng-repeat=\"result in results\"> <td> {{result.LabID}} </td> <td> {{result.PatientID}} </td> <td> {{result.ProviderID}} </td> <td> {{result.MFLCode}} </td> <td> {{result.AMRslocationID}} </td> <td> {{result.PatientNames}} </td> <td> {{result.DateCollected}} </td> <td> {{result.DateReceived}} </td> <td> {{result.DateTested}} </td> <td> {{result.Result}} </td> <td> {{result.FinalResult}} </td> <td> {{result.DateDispatched}} </td> </tr> </tbody> </table>"
  );


  $templateCache.put('views/main.html',
    "<eid-lab-tests patient-identifiers=\"patientIdentifiers\"></eid-lab-tests>"
  );

}]);
