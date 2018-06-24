angular.module('gorillasauth.services.report-products', [
    'gorillascode.resources.report-products'
])

    .service('ReportProductsService', ['configuration', '$http', 'ReportProducts',
        function (configuration, $http, ReportProducts) {
 
            this.search = function (searchParameters) {
    
              if (!searchParameters) {
                searchParameters = {};
              }
    
              return ReportProducts.get(searchParameters).$promise;
            };
    
            this.get = function (id) {
              return ReportProducts.get({id: id}).$promise;
            };

            this.refreshReport = function (dateSelected) {
                var data = {
                    "period": {
                        "month": String(dateSelected.month),
                        "years": String(dateSelected.year -1) + ',' + String(dateSelected.year)
                    }
                };

                return $http.post(configuration.apiUrl + '/report_products/_generate', data).then(function (response) {
                    return response.data;
                });
            };

            this.export = function (dateSelected) {
                var data = {
                    "month": String(dateSelected.month),
                    "current_year": String(dateSelected.year)
                };

                return $http.post(configuration.apiUrl + '/report_products/_export_xlsx', data).then(function (response) {
                    return response;
                });
            };

        }
    ])
    ;

