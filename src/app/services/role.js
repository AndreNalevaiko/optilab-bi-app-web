angular.module('gorillasauth.services.role', [
    'gorillascode.resources.role'
])

    .service('RoleService', ['$q', 'Role',
        function ($q, Role) {

            /*
             Busca apenas as roles relativas ao gorilassauth
             */
            this.gorillasauthRoles = function () {
                var parameters = {
                    filter: [[{
                        name: "app_id",
                        op: "is_",
                        val: null
                    }]],
                    include: 'app,users'
                };

                var promise = Role.get(parameters).$promise.then(function (response) {
                    return response.result;
                });

                return promise;

            };

        }
    ])
;

