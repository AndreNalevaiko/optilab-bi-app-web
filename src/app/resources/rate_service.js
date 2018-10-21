angular.module('gorillascode.resources.rate-service', [
  'gorillascode.resource'
])

  .factory('RateService', ['configuration', 'ResourceFactory',
    function (configuration, ResourceFactory) {
      return new ResourceFactory(configuration.apiUrl, 'v1/rate_service');
    }]
  )

;
