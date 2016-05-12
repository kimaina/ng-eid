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
