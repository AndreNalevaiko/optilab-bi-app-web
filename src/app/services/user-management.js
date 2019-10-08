angular.module('gorillasauth.services.user-management', [])

  .service('UserManagementService', ['$q', 'User', '$http', 'configuration',
    function ($q, User, $http, configuration) {

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
            q: {filters: filters},
            results_per_page: '999'
        };

        var url = configuration.apiUrl + '/v1/user';
        var request = {
          method: 'GET',
          url: url,
          params: parameters
        };
        
        // var promise = User.get(parameters).$promise.then(function (response) {
        var promise = $http(request).then(function (response) {
            return response.data.objects;
        });

        return promise;
      }

      /*
       Busca todos os usuários, menos o usuário logado.
       */
      this.getAllUsersLessMe = function (me) {
        var filters = [{
          name: 'id',
          op: 'neq',
          val: me.id
        }];

        return _get(filters);
      };

    }
  ])
;

