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

            this.searchCustomerBillings = function (dateSelected) {
                var data = {
                    "date": dateSelected
                };
                return $http.post(configuration.apiUrl + '/customer/billings', data).then(function (response) {
                    return response.data;
                });
            };

            this.searchCustomerBillsPerMonth = function (dateSelected, customer, period) {
                var data = {
                    "date": dateSelected,
                    "customer": customer,
                    "period": period
                };
                return $http.post(configuration.apiUrl + '/customer/bills_per_month', data).then(function (response) {
                    return response.data;
                });
            };

            this.searchCustomerProducts = function (dateSelected, customer) {
                var data = {
                    "date": dateSelected,
                    "customer": customer
                };
                return $http.post(configuration.apiUrl + '/customer/products', data).then(function (response) {
                    return response.data;
                });
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

            this.getTabsPrices = function (clicodigo) {
                var data = {
                        "clicodigo": clicodigo
                };
                return $http.post(configuration.apiUrl + '/customers/_tabs_prices', data).then(function (response) {
                    return response.data;
                });
            };

            this.getIsOverdue = function (clicodigo, date) {
                var data = {
                        "clicodigo": clicodigo,
                        "date": date
                };
                return $http.post(configuration.apiUrl + '/customers/_overdue', data).then(function (response) {
                    return response.data;
                });
            };
  
          }
      ])
  ;
  
  