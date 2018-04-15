angular.module('gorillasauth.protected.profile-photo', [])

  .controller('ProfilePhotoController', ['$rootScope', '$log', '$mdDialog', 'NotificationService',
    'FileService', 'UserService', 'UploadService', 'file', 'user',

    function ($rootScope, $log, $mdDialog, NotificationService, FileService, UserService,
              UploadService, file, user) {

      var self = this;

      self.fileCroppedData = '';
      self.file = file;

      self.cancel = function () {
        $mdDialog.cancel();
      };

      self.save = function () {
        var profilePhoto = null;

        var folders = ['profile', 'photo'];
        var content_type = self.file.type;
        var size = self.file.size;
        var fileName = file.name;

        FileService.create(folders, fileName, content_type, size).then(function (photo) {
          profilePhoto = photo;
          return UploadService.upload(self.file, profilePhoto._storage, self.fileCroppedData);
        }).then(function (response) {
          $log.info('O upload do arquivo com a foto foi finalizado.');

          var userToSave = {
            id: 'me',
            profile_photo_id: profilePhoto.id
          };

          return UserService.save(userToSave);
        }).then(function (userSaved) {
          // Atualiza a URL da foto do usuário autenticado
          angular.copy(userSaved, user);
          NotificationService.success('Foto alterada');
          $mdDialog.hide();
        }, function (error) {
          NotificationService.error('Não foi possível salvar a foto', error);
        });
      };
    }
  ]);