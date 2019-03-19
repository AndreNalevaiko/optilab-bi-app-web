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
                    "date": dateSelected
                };

                return $http.post(configuration.apiUrl + '/report_products/_generate', data).then(function (response) {
                    return response.data;
                });
            };

            this.export = function (dateSelected, seller) {
                var params = {
                    "month": String(dateSelected.month),
                    "year": String(dateSelected.year),
                    "seller": String(seller)
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

