angular.module('gorillasauth.protected.home', [
    'ui.router'
  ])
  
    .config(['$stateProvider',
      function ($stateProvider) {
        $stateProvider.state('protected.home', {
          url: '/home',
          templateUrl: 'protected/home/home.tpl.html',
          controller: 'HomeController as homeCtrl',
          data: {
            pageTitle: 'Busca'
          }
        });
      }
    ])
  
  ;
  