angular.module('gorillasauth.services.billing', [])

    .service('BillingService', ['configuration', '$http',
        function (configuration, $http) {

            this.get = function (dateSelected) {
                var data = {
                    date: dateSelected,
                    wallets: Object.keys(configuration.wallets)
                };
                return $http.post(configuration.apiUrl + '/billings/', data).then(function (response) {
                    return response.data;
                });
            };

            this.getAllYear = function (dateSelected) {
                var data = {
                    date: dateSelected,
                    wallets: Object.keys(configuration.wallets)
                };
                return $http.post(configuration.apiUrl + '/billings/all_year', data).then(function (response) {
                    return response.data;
                });
            };

        }
    ])
;

