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
      })
      ;
    }
  ])
;
