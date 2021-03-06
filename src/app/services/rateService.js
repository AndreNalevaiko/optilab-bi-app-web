angular.module('gorillasauth.services.rate-service', [
    'gorillascode.resources.rate-service'
])

    .service('RateServiceService', ['configuration', '$http', 'RateService', '$cookies',
        function (configuration, $http, RateService, $cookies) {

            var COOKIE_AGREED_DATE_GROUP = 'agreed_dates_groups';
            var COOKIE_PARAMS_DC = 'params_dc';
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

            var defaultParamsDc = {
                qtdDcMore: 5,
                qtdDcLess: -1,
                maxDaysConsidered: 10,
                cuttingTime: 14
            };

            // $cookies.remove(COOKIE_PARAMS_DC);
            var agreedDates = $cookies.getObject(COOKIE_AGREED_DATE_GROUP) || {1: null, 2: null, 6: null, 0: null};
            var paramsDc = $cookies.getObject(COOKIE_PARAMS_DC) || {1: null, 2: null, 6: null, 0: null};
 
            this.search = function (searchParameters) {
    
              if (!searchParameters) {
                searchParameters = {};
              }
    
              return RateService.get(searchParameters).$promise;
            };
    
            this.get = function (params) {
              return $http({
                    url: configuration.apiUrl + '/rate_service/_generate', 
                    method: "GET",
                    params: params
                }).then(function (response) {
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
                return angular.copy(agreedDates[business_code]);
            };

            this.setAgreedDate = function (business_code, agreedDate) {
                agreedDates[business_code] = agreedDate;
                $cookies.putObject(COOKIE_AGREED_DATE_GROUP, agreedDates, {
                    expires: cookieExpirationDate,
                });

                return agreedDates;
            };

            this.getParamsDc = function (business_code) {
                if (paramsDc[business_code] == null) {
                    paramsDc[business_code] = defaultParamsDc;
                    $cookies.putObject(COOKIE_PARAMS_DC, paramsDc, {
                        expires: cookieExpirationDate,
                    });
                }
                return angular.copy(paramsDc[business_code]);
            };

            this.setParamsDc = function (business_code, paramDc) {
                paramsDc[business_code] = paramDc;
                $cookies.putObject(COOKIE_PARAMS_DC, paramDc, {
                    expires: cookieExpirationDate,
                });

                return paramsDc;
            };

        }
    ])
    ;

