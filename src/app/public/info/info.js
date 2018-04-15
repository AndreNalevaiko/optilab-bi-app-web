angular.module('gorillasauth.public.info', [
  'ui.router'
])

.config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider.state('public.info', {
      url: '/info',
      templateUrl: 'public/info/info.tpl.html',
      data: {
        pageTitle: 'Informações'
      }
    });
  }
])

;
