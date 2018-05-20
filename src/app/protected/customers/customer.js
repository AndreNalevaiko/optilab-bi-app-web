angular.module('gorillasauth.protected.customers', [
  'ui.router'
])

  .config(['$stateProvider',
    function ($stateProvider) {
      $stateProvider.state('protected.customers', {
        url: '/customers',
        templateUrl: 'protected/customers/customers.tpl.html',
        controller: 'customersController as customersCtrl',
        data: {
          pageTitle: 'Clientes'
        }
      });
    }
  ])

;
