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

            this.search = function (filters) {
                return $http.get(configuration.apiUrl + '/customer/search', {params: filters}).then(function (response) {
                    return response.data;
                });
            };

            this.searchCustomerBillings = function (dateSelected, customer_code, date_type, searchFilters, view_type) {
                var data = {
                    "date": dateSelected,
                    "customer_code": customer_code,
                    "date_type": date_type,
                    "view_type": view_type,
                    "searchFilters": searchFilters,
                };
                return $http.post(configuration.apiUrl + '/customer/billings', data).then(function (response) {
                    return response.data;
                });
            };

            this.searchCustomersByProduct = function (dateSelected, date_type, product_group) {
                var data = {
                    "date": dateSelected,
                    "date_type": date_type,
                    "product_group": product_group
                };
                return $http.post(configuration.apiUrl + '/customer/billings_by_product', data).then(function (response) {
                    return response.data;
                });
            };

            this.searchCustomerBillsPerMonth = function (dateSelected, customer_code, period) {
                var data = {
                    "date": dateSelected,
                    "customer_code": customer_code,
                    "period": period
                };
                return $http.post(configuration.apiUrl + '/customer/bills_per_month', data).then(function (response) {
                    return response.data;
                });
            };

            this.searchCustomerProducts = function (dateSelected, customer_code, date_type) {
                var data = {
                    "date": dateSelected,
                    "customer_code": customer_code,
                    "date_type": date_type,
                };
                return $http.post(configuration.apiUrl + '/customer/products', data).then(function (response) {
                    return response.data;
                });
            };

            this.searchCustomerProductsAllYear = function (dateSelected, customer_code, type, date_type) {
                var data = {
                    "date": dateSelected,
                    "customer_code": customer_code,
                    "type": type,
                    "date_type": date_type,
                };
                return $http.post(configuration.apiUrl + '/customer/products_all_year', data).then(function (response) {
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

            this.getInfos = function (customer_code) {
                return $http.get(configuration.apiUrl + '/customers/'+customer_code+'/_info').then(function (response) {
                    return response.data;
                });
            };

            this.getIsOverdue = function (code, date, type) {
                var data = {
                        "code": code,
                        "date": date,
                        "type": type,
                };
                return $http.post(configuration.apiUrl + '/customers/_overdue', data).then(function (response) {
                    return response.data;
                });
            };

            this.getBrokes = function (clicodigo, date) {
                var data = {
                        "clicodigo": clicodigo,
                        "date": date
                };
                return $http.post(configuration.apiUrl + '/customers/_brokes', data).then(function (response) {
                    return response.data;
                });
            };
  
          }
      ])
  ;
  
  