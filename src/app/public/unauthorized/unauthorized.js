angular.module('gorillasauth.public.unauthorized', [
  'ui.router'
])

.config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider.state('public.unauthorized', {
      url: '/unauthorized',
      templateUrl: 'public/unauthorized/unauthorized.tpl.html',
      data: {
        pageTitle: 'Acesso negado'
      }
    });
  }
])

;
