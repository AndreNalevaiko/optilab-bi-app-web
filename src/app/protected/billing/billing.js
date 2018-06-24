angular.module('gorillasauth.protected.billing', [
  'gorillasauth.services.billing',
  'ui.router'
])

  .config(['$stateProvider',
    function ($stateProvider) {
      $stateProvider.state('protected.billing', {
        url: '/billing',
        templateUrl: 'protected/billing/billing.tpl.html',
        controller: 'billingController as billingCtrl',
        data: {
          pageTitle: 'Faturamento'
        }
      });
    }
  ])

;
