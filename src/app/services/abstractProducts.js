angular.module('gorillasauth.services.abstract-products', [])

    .service('AbstractProductsService', ['configuration', '$http',
        function (configuration, $http) {

            this.get = function () {
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
                        "date_start": "01/01/2017",
                        "date_end": "31/12/2017"
                    }
                };

                return $http.post(configuration.apiUrl + '/abstract_products/', data).then(function (response) {
                    return response.data;
                });
            };

            this.getBrands = function () {
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
                    "period":{
                        "date_start": "01/01/2017",
                        "date_end": "31/12/2018"
                    }
                };

                return $http.post(configuration.apiUrl + '/abstract_products/brands', data).then(function (response) {
                    return response.data;
                });
            };

        }
    ])
    ;

