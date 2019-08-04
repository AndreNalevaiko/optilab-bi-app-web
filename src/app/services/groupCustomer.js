angular.module('gorillasauth.services.group-customer', [])

    .service('GroupCustomerService', ['configuration', '$http',
        function (configuration, $http) {
 
            this.searchCustomersBillings = function (dateSelected, group) {
                var data = {
                    "date": dateSelected,
                    "group": group,
                };
                return $http.post(configuration.apiUrl + '/group_customer/customers', data).then(function (response) {
                    return response.data;
                });
            };

            this.searchGroupProducts = function (dateSelected, group) {
                var data = {
                    "date": dateSelected,
                    "group": group,
                };
                return $http.post(configuration.apiUrl + '/group_customer/products', data).then(function (response) {
                    return response.data;
                });
            };

            this.searchGroupCustomerBillsPerMonth = function (dateSelected, group_customer, period) {
                var data = {
                    "date": dateSelected,
                    "group_customer": group_customer,
                    "period": period
                };
                return $http.post(configuration.apiUrl + '/group_customer/bills_per_month', data).then(function (response) {
                    return response.data.map(function(item) {
                        item.customer = item.group_customer;
                        return item;
                    });
                });
            };

        }
    ])
;