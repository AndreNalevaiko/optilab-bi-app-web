angular.module('gorillasauth.services.filters', [])

.service('FiltersService', ['configuration', '$http',
function (configuration, $http) {

    this.get = function () {
        return $http.get(configuration.apiUrl + '/filters').then(function (response) {
            return response;
        });
    };

}
])
;

