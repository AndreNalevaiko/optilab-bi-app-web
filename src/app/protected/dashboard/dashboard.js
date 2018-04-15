angular.module('gorillasauth.protected.dashboard', [
  'gorillasauth.services.billing',
  'ui.router'
])

  .config(['$stateProvider',
    function ($stateProvider) {
      $stateProvider.state('protected.dashboard', {
        url: '/dashboard',
        templateUrl: 'protected/dashboard/dashboard.tpl.html',
        controller: 'DashboardController as dashboardCtrl',
        data: {
          pageTitle: 'Dashboards'
        },
        resolve: {
          billing: ['BillingService', function (BillingService) {
            return BillingService.get().then(function (response) {
              return response;
            });
          }]
        }
      });
    }
  ])

;
