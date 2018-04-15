angular.module('gorillasauth.services.billing', [])

    .service('BillingService', ['configuration', '$http',
        function (configuration, $http) {

            this.get = function (app_id) {
                var data = {
                    "period":{
                        "date_start": "01/01/2017",
                        "date_end": "31/12/2017"	
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

