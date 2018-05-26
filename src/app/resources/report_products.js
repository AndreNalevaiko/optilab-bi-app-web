angular.module('gorillascode.resources.report-products', [
  'gorillascode.resource'
])

  .factory('ReportProducts', ['configuration', 'ResourceFactory',
    function (configuration, ResourceFactory) {
      return new ResourceFactory(configuration.apiUrl, 'v1/report_products');
    }]
  )

;
