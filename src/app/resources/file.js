angular.module('gorillascode.resources.file', [
  'gorillascode.resource'
])

  .factory('File', ['configuration', 'ResourceFactory',
    function (configuration, ResourceFactory) {
      return new ResourceFactory(configuration.apiUrl, 'api/file');
    }]
  )

;
