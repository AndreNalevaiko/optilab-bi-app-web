angular.module('gorillasauth.services.group-customer', [])

    .service('GroupCustomerService', ['configuration', '$http',
        function (configuration, $http) {
 
            this.searchCustomersBillings = function (dateSelected, group, date_type) {
                var data = {
                    "date": dateSelected,
                    "group": group,
                    "date_type": date_type,
                };
                return $http.post(configuration.apiUrl + '/group_customer/customers', data).then(function (response) {
                    return response.data;
                });
            };

            this.searchGroupProducts = function (dateSelected, group, date_type) {
                var data = {
                    "date": dateSelected,
                    "group": group,
                    "date_type": date_type,
                };
                return $http.post(configuration.apiUrl + '/group_customer/products', data).then(function (response) {
                    return response.data;
                });
            };

            this.searchGroupBillings = function (dateSelected, searchFilters, date_type, view_type) {
                var data = {
                    "date": dateSelected,
                    "date_type": date_type,
                    "view_type": view_type,
                    "searchFilters": searchFilters
                };
                return $http.post(configuration.apiUrl + '/group_customer/billings', data).then(function (response) {
                    return response.data;
                });
            };

            this.searchGroupCustomerBillsPerMonth = function (dateSelected, group_customer, period, date_type) {
                var data = {
                    "date": dateSelected,
                    "group_customer": group_customer,
                    "period": period,
                    "date_type": date_type,
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