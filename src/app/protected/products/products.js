angular.module('gorillasauth.protected.products', [
  'gorillasauth.services.billing',
  'ui.router'
])

  .config(['$stateProvider',
    function ($stateProvider) {
      $stateProvider.state('protected.products', {
        url: '/products',
        templateUrl: 'protected/products/products.tpl.html',
        controller: 'productsController as productsCtrl',
        data: {
          pageTitle: 'Produtos'
        }
      });
    }
  ])

;
