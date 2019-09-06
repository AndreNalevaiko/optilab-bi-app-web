angular.module('gorillasauth.services.product', [])

    .service('ProductService', ['configuration', '$http',
        function (configuration, $http) {
 
            this.searchProductBillings = function (dateSelected, wallets) {
                var data = {
                    "date": dateSelected,
                    "wallets": wallets
                };
                return $http.post(configuration.apiUrl + '/product/billings', data).then(function (response) {
                    return response.data;
                });
            };

            this.searchProductBillingsAllYear = function (dateSelected, wallets) {
                var data = {
                    "date": dateSelected,
                    "wallets": wallets
                };
                return $http.post(configuration.apiUrl + '/product/pillars/all_year', data).then(function (response) {
                    return response.data;
                });
            };

        }
    ])
;