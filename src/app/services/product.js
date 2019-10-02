angular.module('gorillasauth.services.product', [])

    .service('ProductService', ['configuration', '$http',
        function (configuration, $http) {
 
            this.searchProductBillings = function (dateSelected, wallets, date_type) {
                var data = {
                    "date": dateSelected,
                    "wallets": wallets,
                    "date_type": date_type,
                };
                return $http.post(configuration.apiUrl + '/product/billings', data).then(function (response) {
                    return response.data;
                });
            };
            
            this.searchProductBillingsPerMonth = function (dateSelected, wallet, product_group) {
                var data = {
                    "date": dateSelected,
                    "wallet": wallet,
                    "product_group": product_group
                };
                return $http.post(configuration.apiUrl + '/product/bills_per_month', data).then(function (response) {
                    return response.data;
                });
            };

            this.searchProductBillingsAllYear = function (dateSelected, wallets, date_type) {
                var data = {
                    "date": dateSelected,
                    "wallets": wallets,
                    "date_type": date_type,
                };
                return $http.post(configuration.apiUrl + '/product/pillars/all_year', data).then(function (response) {
                    return response.data;
                });
            };

        }
    ])
;