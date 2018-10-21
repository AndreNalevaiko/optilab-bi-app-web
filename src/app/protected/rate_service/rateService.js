angular.module('gorillasauth.protected.rate-service', [
  'gorillasauth.services.billing',
  'ui.router'
])

  .config(['$stateProvider',
    function ($stateProvider) {
      $stateProvider.state('protected.rate-service', {
        url: '/rate_service',
        templateUrl: 'protected/rate_service/rateService.tpl.html',
        controller: 'RateServiceController as rateServiceCtrl',
        data: {
          pageTitle: 'Taxa de serviço'
        }
      });
    }
  ])

;
