angular.module('gorillascode.resources.role', [
  'gorillascode.resource'
])

  .factory('Role', ['configuration', 'ResourceFactory',
    function (configuration, ResourceFactory) {
      return new ResourceFactory(configuration.apiUrl, 'v1/role');
    }]
  )

;
