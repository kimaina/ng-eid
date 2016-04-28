/*jshint -W003, -W098, -W033 */
(function() {
  'use strict';

  /**
   * @ngdoc function
   * @name ngAmrsApp.controller:MainCtrl
   * @description
   * # MainCtrl
   * Controller of the ngAmrsApp
   */
  angular
    .module('app.eid')
    .controller('EIDController', EIDCtrl);
  EIDCtrl.$nject = ['$scope','EIDRestService', 'eldConfig'];

  function EIDCtrl($scope,EIDRestService, eldConfig) {
    var params = {
      apikey: '35243eba2',
      startDate: '2015-01-01',
      endDate: '2015-02-01',
      currentpage: '3',
      test : '2'
    };
    EIDRestService.getTestResults(params,eldConfig.servers[0].url).then(function(response) {
        console.log(response)
        $scope.results = response.posts;
      })
      .catch(function(error) {
        console.error(error);
      });
  }
})();
