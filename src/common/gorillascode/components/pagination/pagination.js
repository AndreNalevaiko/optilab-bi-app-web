/**
 * @ngdoc module
 * @name gorillascode.components.pagination
 *
 * @description
 * Componente para fazer a paginação em uma lista.
 */
angular.module('gorillascode.components.pagination', [])

/**
 * @ngdoc directive
 * @name gorillascodePagination
 * @module gorillascode.components.pagination
 * @restrict E
 *
 * @description
 * Cria um botão para carregar mais resultados em uma lista.
 *
 * @param {string} gorillascode-controller o nome do controller da view.
 *
 * @example
 * <gorillascode-pagination gorillascode-controller="listCtrl"></gorillascode-pagination>
 */
.directive('gorillascodePagination', [
  function() {
    return {
      restrict: 'E',
      templateUrl: 'gorillascode/components/pagination/pagination.tpl.html',
      link: function ($scope, element, attrs) {
        if (!attrs.gorillascodeController) {
          throw new Error('gorillascode-pagination: o atributo "gorillascodeController" não foi ' +
            'informado');
        }

        $scope.paginationCtrl = $scope[attrs.gorillascodeController];
      }
    };
  }
])

/**
 * @ngdoc controller
 * @name PaginationController
 * @module gorillascode.components.pagination
 *
 * @description
 * Controller base para telas que possuem paginação.
 */
.controller('PaginationController', ['NotificationService', '$scope', 'self', 'list',
  'searchService',

  function(NotificationService, $scope, self, list, searchService) {
    self.list = list;

    // Indica se estão sendo carregados mais resultados do serviço
    self.loading = false;

    // Indica se todos os resultados já foram carregados
    self.allLoaded = (list.result && list.result.length >= list.limit);

    /**
     * Carrega a próxima página de resultados.
     */
    self.loadMore = function() {
      if (self.allLoaded || self.loading) {
        return;
      }

      self.loading = true;

      var parameters = {
        page: list.offset + 1,
        results_per_page: 20
      };

      return searchService(parameters).then(function(response) {
        var result = list.result.concat(response.result);

        list.limit = response.limit;
        list.offset = response.offset;
        list.pages = response.pages;
        list.result = result;

        self.allLoaded = (list.result.length >= list.limit);
      }, function(error) {
        NotificationService.error('Não foi possível carregar mais resultados', error);
      }).finally(function() {
        self.loading = false;
      });
    };

    if (!list.result) {
      list.offset = 0;
      list.result = [];
    }

    $scope.$on('scrollBottomEvent', self.loadMore);
  }
])

;
