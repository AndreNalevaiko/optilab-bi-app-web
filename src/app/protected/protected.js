angular.module('gorillasauth.protected', [
  'ui.router',
  'gorillasauth.protected.products',
  'gorillasauth.protected.billing',
  'gorillasauth.protected.customers',
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
        // resolve: {
        //   user: ['$q', '$location', 'UserService', function ($q, $location, UserService) {
        //     if ($location.search().force_login && $location.search().force_login.toLowerCase() == 'true') {
        //       return $q.reject({
        //         status: 'unauthorized'
        //       });
        //     }

        //     return UserService.me().then(function (user) {
        //       return user;
        //     }, function (error) {
        //       if (error.status == 401 || error.status == 403) {
        //         return $q.reject({
        //           status: 'unauthorized'
        //         });
        //       }
        //     });
        //   }]
        // }
      });
    }
  ])

;
