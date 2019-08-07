angular.module('gorillasauth.protected')

  .controller('ProtectedController', ['$rootScope', '$mdSidenav', '$state', '$mdDialog', 'AuthService', 'user',
  '$cookies',
    function ($rootScope, $mdSidenav, $state, $mdDialog, AuthService, user, $cookies) {
      var self = this;

      $rootScope.loggedUser = user;
      self.loggedUser = user;
      self.viewMini = $cookies.get('viewMiniSidenav') == 'true' ? true : false;

      self.userIsAdmin = user.roles.filter( function (role) { return role.name == 'admin'; }).length;

      self.selectProfilePhoto = function (file, event) {
        if (!file) {
          return;
        }

        $mdDialog.show({
          controller: 'ProfilePhotoController as profilePhotoCtrl',
          templateUrl: 'protected/user/profile-photo/profile-photo.tpl.html',
          parent: angular.element(document.body),
          fullscreen: true,
          targetEvent: event,
          locals: {
            file: file
          },
          resolve: {
            user: [function () {
              return self.user;
            }]
          }
        });
      };

      self.toggleViewMini = function () {
        self.viewMini = !self.viewMini;
        $cookies.put('viewMiniSidenav', self.viewMini ? 'true' : 'false');
      };

      self.logout = function () {
        AuthService.logout().then(function () {
          $rootScope.continueTo = null;
          $state.go('public.login');
        });
      };

      self.toggleMenu = function () {
        $mdSidenav('sidenav-left').toggle();
      };
    }
  ])

;