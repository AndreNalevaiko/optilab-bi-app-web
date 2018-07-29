angular.module('gorillascode.resources.customer', [
  'gorillascode.resource'
])

  .factory('CustomerBillingReport', ['configuration', 'ResourceFactory',
    function (configuration, ResourceFactory) {
      return new ResourceFactory(configuration.apiUrl, 'v1/customer_billing_report');
    }]
  )

  .factory('NumberActiveCustomers', ['configuration', 'ResourceFactory',
    function (configuration, ResourceFactory) {
      return new ResourceFactory(configuration.apiUrl, 'v1/number_active_customers');
    }]
  )

;
