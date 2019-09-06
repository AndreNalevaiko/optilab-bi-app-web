angular.module('gorillasauth.protected.customer', [
  'ui.router'
])

  .config(['$stateProvider',
    function ($stateProvider) {
      $stateProvider.state('protected.customer', {
        url: '/customer?wallet&customer',
        templateUrl: 'protected/customers/customer.tpl.html',
        controller: 'CustomerController as customerCtrl',
        data: {
          pageTitle: 'Clientes'
        }
      });
    }
  ])

;
