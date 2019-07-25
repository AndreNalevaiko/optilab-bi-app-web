angular.module('gorillasauth.services.product', [])

    .service('ProductService', ['configuration', '$http',
        function (configuration, $http) {
 
            this.searchProductBillings = function (dateSelected) {
                var data = {
                    "date": dateSelected
                };
                return $http.post(configuration.apiUrl + '/product/billings', data).then(function (response) {
                    return response.data;
                });
            };

        }
    ])
;