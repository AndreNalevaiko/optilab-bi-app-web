angular.module('gorillasauth.services.billing', [])

    .service('BillingService', ['configuration', '$http',
        function (configuration, $http) {
            var wallets = [];
            angular.forEach(configuration.wallets, function (w) {
                var key = Object.keys(w)[0];
                self.wallets.push(key);
            });

            this.get = function (dateSelected) {
                var data = {
                    date: dateSelected,
                    wallets: wallets
                };
                return $http.post(configuration.apiUrl + '/billings/', data).then(function (response) {
                    return response.data;
                });
            };

            this.getAllYear = function (dateSelected) {
                var data = {
                    date: dateSelected,
                    wallets: wallets
                };
                return $http.post(configuration.apiUrl + '/billings/all_year', data).then(function (response) {
                    return response.data;
                });
            };

        }
    ])
;

