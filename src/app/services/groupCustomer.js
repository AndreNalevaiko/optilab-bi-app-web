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

        }
    ])
;