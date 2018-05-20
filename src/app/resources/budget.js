angular.module('gorillascode.resources.budget', [
  'gorillascode.resource'
])

  .factory('Budget', ['configuration', 'ResourceFactory',
    function (configuration, ResourceFactory) {
      return new ResourceFactory(configuration.apiUrl, 'v1/budget');
    }]
  )

;
