angular.module('gorillasauth.public', [
  'ui.router',
  'gorillasauth.public.info',
  'gorillasauth.public.login',
  'gorillasauth.public.error',
  'gorillasauth.public.unauthorized'
])

  .config(['$stateProvider',
    function ($stateProvider) {
      $stateProvider.state('public', {
        abstract: true,
        url: '',
        controller: 'PublicController as publicCtrl',
        templateUrl: 'public/public.tpl.html',
        resolve: {
          customConfigs: ['$location', '$rootScope', 'ApplicationService', function ($location, $rootScope, ApplicationService) {
            if (!$location.search().client_id) {
              return {};
            }

            $rootScope.client_id = $location.search().client_id;
            return ApplicationService.getConfigurations($location.search().client_id).then(function (configs) {
              return configs;
            }, function (error) {
              return {};
            });
          }]
        }
      })
      ;
    }
  ])
;
