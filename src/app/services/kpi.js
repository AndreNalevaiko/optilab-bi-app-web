angular.module('gorillasauth.services.kpi', [
    'gorillascode.resources.kpi'
])

.service('KpiService', ['configuration', 'Kpi', '$http',
function (configuration, Kpi, $http) {

    this.save = function (kpi) {
        if (kpi.id) {
          return Kpi.patch(kpi).$promise;
        }
        else {
          return Kpi.save(kpi).$promise;
        }
      };

    this.search = function (searchParameters) {

      if (!searchParameters) {
        searchParameters = {};
      }

      return Kpi.get(searchParameters).$promise;
    };

    this.generate = function (dateSelected) {
      var data = {
            "day": String(dateSelected.day),
            "month": String(dateSelected.month),
            "year": String(dateSelected.year)
      };

      return $http.post(configuration.apiUrl + '/kpi/_generate', data).then(function (response) {
          return response.data;
      });
  };

}
])
;

