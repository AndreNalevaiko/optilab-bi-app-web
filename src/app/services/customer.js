angular.module('gorillasauth.services.customer', [])
  
      .service('CustomerService', ['configuration', '$http',
          function (configuration, $http) {
            
            this.getAbstract = function (dateSelected) {
                var data = {
                        "month": String(dateSelected.month),
                        "year": String(dateSelected.year)
                };
                return $http.post(configuration.apiUrl + '/customers/_eval', data).then(function (response) {
                    return response.data;
                });
            };

            this.getAmounts = function (dateSelected) {
                var data = {
                        "month": String(dateSelected.month),
                        "year": String(dateSelected.year)
                };
                return $http.post(configuration.apiUrl + '/customers/_amount', data).then(function (response) {
                    return response.data;
                });
            };
  
          }
      ])
  ;
  
  