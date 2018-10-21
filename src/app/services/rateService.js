angular.module('gorillasauth.services.rate-service', [
    'gorillascode.resources.rate-service'
])

    .service('RateServiceService', ['configuration', '$http', 'RateService', '$cookies',
        function (configuration, $http, RateService, $cookies) {

            var COOKIE_AGREED_DATE_GROUP = 'agreed_dates_groups';
            var cookieExpirationDate = new Date();
            cookieExpirationDate.setDate(cookieExpirationDate.getDate() + 365);

            var defaultAgreedDate = {
                finished: 2,
                simpleSurf: 2,
                advancedSurf: 2,
                tratementSurf: 3,
                digitalSurf: 3,
                variluxX: 3
            };

            // $cookies.remove(COOKIE_AGREED_DATE_GROUP);
            var agreedDates = $cookies.getObject(COOKIE_AGREED_DATE_GROUP) || {1: null, 2: null, 6: null};
 
            this.search = function (searchParameters) {
    
              if (!searchParameters) {
                searchParameters = {};
              }
    
              return RateService.get(searchParameters).$promise;
            };
    
            this.get = function (id) {
              return $http.get(configuration.apiUrl + '/rate_service/_generate').then(function (response) {
                  return response.data;
              });
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

            this.getAgreedDate = function (business_code) {
                if (agreedDates[business_code] == null) {
                    agreedDates[business_code] = defaultAgreedDate;
                    $cookies.putObject(COOKIE_AGREED_DATE_GROUP, agreedDates, {
                        expires: cookieExpirationDate,
                    });
                }
                return agreedDates[business_code];
            };

            this.setAgreedDate = function (business_code, agreedDate) {
                agreedDates[business_code] = agreedDate;
                $cookies.putObject(COOKIE_AGREED_DATE_GROUP, agreedDates, {
                    expires: cookieExpirationDate,
                });

                return agreedDates;
            };

        }
    ])
    ;

