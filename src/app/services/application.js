angular.module('gorillasauth.services.application', [
    'gorillascode.resources.application'
])

    .service('ApplicationService', ['$q', 'Application', 'configuration', '$http',
        function ($q, Application, configuration, $http) {


            /*
             Busca somente as aplicações que o usuário logado tem premissões.
             */
            this.myApplications = function () {
                return Application.get({id: 'my'}).$promise.then(function (response) {
                    return response.response;
                });
            };
            params = {
                'page[size]': 0,
            sort: "name",
            include: "roles"
            };
            this.getAll = function () {
                return Application.get(params).$promise.then(function (response) {
                    return response.result;
                });
                // return $http.get("http://localhost:5001/app?include=roles").then(function (response) {
                //     return tratament_json_api(response.data);
                // });
            };

            this.getConfigurations = function (app_id) {
                return $http.get(configuration.apiUrl + '/configuration/' + app_id).then(function (response) {
                    return response.data;
                });
            };

        }
    ])
;

