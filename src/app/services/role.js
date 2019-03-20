angular.module('gorillasauth.services.role', [
    'gorillascode.resources.role'
])

    .service('RoleService', ['$q', 'Role',
        function ($q, Role) {

            /*
             Busca apenas as roles relativas ao gorilassauth
             */
            this.getRoles = function () {
                var promise = Role.get().$promise.then(function (response) {
                    return response.objects;
                });

                return promise;

            };

        }
    ])
;

