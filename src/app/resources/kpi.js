angular.module('gorillascode.resources.kpi', [
  'gorillascode.resource'
])

  .factory('Kpi', ['configuration', 'ResourceFactory',
    function (configuration, ResourceFactory) {
      return new ResourceFactory(configuration.apiUrl, 'v1/kpi');
    }]
  )

;
