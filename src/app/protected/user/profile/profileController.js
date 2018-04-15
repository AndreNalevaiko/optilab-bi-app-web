angular.module('gorillasauth.protected.profile')

  .controller('ProfileController', ['$scope', '$mdDialog', 'user', 'UserService', 'NotificationService',
    function ($scope, $mdDialog, user, UserService, NotificationService) {
      var self = this;
      self.originalUser = user;
      self.user = angular.copy(user);

      self.save = function () {
        var userToSave = {
          id: 'me',
          name: self.user.name,
          email: self.user.email
        };

        UserService.save(userToSave).then(function (userSaved) {
          angular.copy(userSaved, self.originalUser);
          NotificationService.success('Dados salvos com sucesso!');
        });
      };

    }
  ])

;
