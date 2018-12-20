angular.module('gorillasauth.protected', [
  'ui.router',
  'gorillasauth.protected.products',
  'gorillasauth.protected.rate-service',
  'gorillasauth.protected.billing',
  'gorillasauth.protected.customer',
  'gorillasauth.protected.oauthconfirm',
  'gorillasauth.protected.user-management',
  'gorillasauth.protected.profile-photo',
  'gorillasauth.protected.profile',
  'gorillasauth.protected.change-password'
])

  .config(['$stateProvider',
    function ($stateProvider) {
      $stateProvider.state('protected', {
        abstract: true,
        controller: 'ProtectedController as protectedCtrl',
        url: '',
        templateUrl: 'protected/protected.tpl.html',
        resolve: {
          user: ['$q', 'UserService', function ($q, UserService) {
            return UserService.me().then(function (user) {
              return user;
            }, function (error) {
              if (error.status == 401 || error.status == 403 || error.status == 404) {
                return $q.reject({
                  status: 'unauthorized'
                });
              }
            });
          }]
        }
      });
    }
  ])

;
