'use strict';

/**
 * @ngdoc function
 * @name openmrsNgresource.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the openmrsNgresource
 */
angular.module('ngEID')
  .controller('MainCtrl', function ($scope) {
    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
    $scope.patientIdentifiers = ['1691WB-sd7','035098891-1', '1691WB-sd7dsf', '1691WB-sd7dsfds'];
  });
