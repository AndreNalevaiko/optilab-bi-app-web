angular.module('gorillasauth.services.billing', [])

    .service('BillingService', ['configuration', '$http',
        function (configuration, $http) {

            this.get = function (dateSelected) {
                var data = {
                    "period": {
                        "month": String(dateSelected.month),
                        "year": String(dateSelected.year)
                    }
                };
                return $http.post(configuration.apiUrl + '/billing/', data).then(function (response) {
                    angular.forEach(response.data, function(bil){
                        bil.business_alias = configuration.business_alias[bil.business];
                    });
                    return response.data;
                });
            };

        }
    ])
;

