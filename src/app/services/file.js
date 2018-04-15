angular.module('gorillasauth.services.file', [
  'gorillascode.resources.file'
])

  .service('FileService', ['$q', 'File',
    function ($q, File) {

      /*
        Cria uma referencia de arquivo.
       */
       this.create = function (folders, fileName, contentType, size, acl) {
        var fileData = {
          folders: folders,
          original_name: fileName,
          content_type: contentType,
          size: size
        };

        var params = {};

        if (acl != null) {
          params.acl = acl;
        }

        return File.save(params, fileData).$promise;
      };

    }
  ])
;

