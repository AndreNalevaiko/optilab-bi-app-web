angular.module('gorillasauth.services.abstract-products', [])

    .service('AbstractProductsService', ['configuration', '$http',
        function (configuration, $http) {

            this.get = function (dateSelected) {
                var data = {
                    "products": [
                        {
                        "descriptions": ["VLX", "VARILUX"],
                        "process": "C",
                        "label": "VARILUX-TRAD"
                        },
                        {
                        "descriptions": ["VLX", "VARILUX"],
                        "process": "F",
                        "label": "VARILUX-DIG"
                        },
                        {
                        "descriptions": ["TRANS", "NG", "ACCLI", "PHOTO"],
                        "label": "TRANSITIONS"
                        },
                        {
                        "descriptions": ["CRIZAL", "CF UV", "C FORTE UV", "C/AR PRIME"],
                        "label": "CRIZAL"
                        },
                        {
                        "descriptions": ["KODAK"],
                        "label": "KODAK"
                        },
                        {
                        "descriptions": ["ITOP", "MULTILUX"],
                        "label": "ITOP"
                        }
                    ],
                    "period": {
                        "month": String(dateSelected.month),
                        "year": String(dateSelected.year)
                    }
                };

                return $http.post(configuration.apiUrl + '/abstract_products/', data).then(function (response) {
                    return response.data;
                });
            };

            this.getBrand = function (dateSelected, brand) {
                var data = {
                    "brands": [brand],
                    "period": {
                        "month": String(dateSelected.month),
                        "years": String(dateSelected.year -1) + ',' + String(dateSelected.year)
                    }
                };

                return $http.post(configuration.apiUrl + '/abstract_products/report_products', data).then(function (response) {
                    return response.data;
                });
            };

        }
    ])
    ;

