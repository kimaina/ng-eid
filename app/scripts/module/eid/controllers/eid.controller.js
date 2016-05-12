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
  }
})();
