angular.module('gorillascode.resources.application', [
  'gorillascode.resource'
])

  .factory('Application', ['configuration', 'ResourceFactory',
    function (configuration, ResourceFactory) {
      return new ResourceFactory(configuration.apiUrl, 'app');
    }]
  )

;
