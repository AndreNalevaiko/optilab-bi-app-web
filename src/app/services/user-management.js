angular.module('gorillasauth.services.user-management', [])

  .service('UserManagementService', ['$q', 'User', '$http',
    function ($q, User, $http) {

      /*
       Função auxilizar que realiza um GET /user passando os filtros passados por parâmetro.
       */
      function _get(filters, orderBy) {
        if (orderBy == null) {
          orderBy = [{
            field: 'name',
            direction: 'asc'
          }];
        }

        var parameters = {
          'page[size]': 0,
            filter: [filters],
            sort: "name",
            include: "roles"
        };


        var promise = User.get(parameters).$promise.then(function (response) {
            return response.result;
        });

        return promise;
      }

      /*
       Busca todos os usuários, menos o usuário logado.
       */
      this.getAllUsersLessMe = function (me) {
        var filters = [{
          name: 'id',
          op: 'ne',
          val: me.id
        }];

        return _get(filters);
      };

    }
  ])
;

