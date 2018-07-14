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

            this.generate = function (dateSelected) {
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

            this.export = function (dateSelected, business_code) {
                var params = {
                    "month": String(dateSelected.month),
                    "year": String(dateSelected.year),
                    "emp_code": String(business_code)
                };

                var http = {
                    url: configuration.apiUrl + '/report_products/_export_xlsx', 
                    method: "GET",
                    params: params,
                    responseType: "arraybuffer"
                };

                return $http(http).then(function (response) {
                    return response;
                });
            };

        }
    ])
    ;

