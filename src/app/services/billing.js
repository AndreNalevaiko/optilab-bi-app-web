angular.module('gorillasauth.services.billing', [])

    .service('BillingService', ['configuration', '$http',
        function (configuration, $http) {

            this.get = function (dateSelected) {
                var data = {
                    "date": dateSelected
                };
                return $http.post(configuration.apiUrl + '/billing/', data).then(function (response) {
                    return response.data;
                });
            };

        }
    ])
;

