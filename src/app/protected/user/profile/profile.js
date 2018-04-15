angular.module('gorillasauth.protected.profile', [
  'ui.router'
])

  .config(['$stateProvider',
    function ($stateProvider) {
      $stateProvider.state('protected.profile', {
        url: '/profile',
        templateUrl: 'protected/user/profile/profile.tpl.html',
        controller: 'ProfileController as profileCtrl',
        data: {
          pageTitle: 'Minha conta'
        }
      });
    }
  ])

;
