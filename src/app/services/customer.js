angular.module('gorillasauth.services.customer', [
    'gorillascode.resources.customer'
])
  
      .service('CustomerService', ['configuration', '$http', 'CustomerBillingReport', 'NumberActiveCustomers',
          function (configuration, $http, CustomerBillingReport, NumberActiveCustomers) {
            
            this.searchCustomerBillingReport = function (searchParameters) {
    
                if (!searchParameters) {
                    searchParameters = {};
                }
        
                return CustomerBillingReport.get(searchParameters).$promise;
            };
            
            this.searchNumberActiveCustomers = function (searchParameters) {
    
                if (!searchParameters) {
                    searchParameters = {};
                }
        
                return NumberActiveCustomers.get(searchParameters).$promise;
            };

            this.generate = function (dateSelected) {
                var data = {
                        "date": dateSelected
                };
                return $http.post(configuration.apiUrl + '/customers/_generate', data).then(function (response) {
                    return response.data;
                });
            };
  
          }
      ])
  ;
  
  