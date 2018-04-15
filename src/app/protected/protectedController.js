angular.module('gorillasauth.protected')

  .controller('ProtectedController', ['$rootScope', '$mdSidenav', '$state', '$mdDialog', 'AuthService',
    function ($rootScope, $mdSidenav, $state, $mdDialog, AuthService) {
      var self = this;

      

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