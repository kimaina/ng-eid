/*jshint -W026, -W030 */
(function() {
  'use strict';

  describe('Open MRS Form Resource Service Unit Tests', function() {
    beforeEach(function() {
      module('openmrs-ngresource.restServices');
      module('mock.data');
    });

    var callbacks;

    var httpBackend;
    var formResourceService;
    var settingsService;
    var mockData;
    beforeEach(inject(function($injector) {
      httpBackend = $injector.get('$httpBackend');
      formResourceService = $injector.get('FormResourceService');
      settingsService = $injector.get('OpenmrsSettings');
      mockData = $injector.get('mockData');
    }));

    beforeEach(inject(function() {
      callbacks = {
        onSuccessCalled: false,
        onFailedCalled: false,
        message: null,
        onSuccess: function() {
          callbacks.onSuccessCalled = true;
        },

        onFailure: function(message) {
          callbacks.onFailedCalled = true;
          callbacks.message = message;
        }
      };
    }));

    afterEach(function() {
      httpBackend.verifyNoOutstandingExpectation();

      // httpBackend.verifyNoOutstandingRequest (); //expectation is sufficient for now
    });

    it('should have FormResourceService service defined', function() {
      expect(formResourceService).to.exist;
    });

    it('should make an api call to the form resource when getResourcesByFormUuid is called with a uuid',
      function() {
        httpBackend.expectGET(settingsService.getCurrentRestUrlBase().trim() +
          'form/passed-uuid/resource').respond(mockData.getResourcesMock());
        httpBackend.expectGET(settingsService.getCurrentRestUrlBase().trim() +
          'form/bc552ab9-1a16-4618-9672-ff1f689ba0e1/resource/f81227d6-ada0-4443-8650-f0645cc8eba1/value').
        respond({});
        formResourceService.getResourcesByFormUuid('passed-uuid', function() {}, function() {});
        httpBackend.flush();
      });
  });
})();
