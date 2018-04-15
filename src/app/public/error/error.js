angular.module('gorillasauth.public.error', [
  'ui.router'
])

.config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider.state('public.error', {
      url: '/error',
      templateUrl: 'public/error/error.tpl.html',
      data: {
        pageTitle: 'Erro'
      }
    });
  }
])

;
