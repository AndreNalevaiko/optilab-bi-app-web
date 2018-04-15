angular.module('gorillascode.services.upload', [])

.factory('UploadService', ['$log', 'Upload',
  function($log, Upload) {
    var service = {
      upload: function(file, _storage, dataUrl) {
        var upload = null;
        var dataToUpload = null;

        if (!file || !_storage) {
          return;
        }

        $log.info('Fazendo upload do arquivo ' + file.name);

        dataToUpload = dataUrl ? Upload.dataUrltoBlob(dataUrl, file.name) : file;

        upload = Upload.upload({
          url: _storage.url,
          method: 'POST',
          data: {
            key: _storage.fields.key,
            AWSAccessKeyId: _storage.fields.AWSAccessKeyId,
            acl: _storage.fields.acl,
            policy: _storage.fields.policy,
            signature: _storage.fields.signature,
            'Content-Type': _storage.fields['Content-Type'],
            file: dataToUpload
          }
        });

        upload.then(function() {
          $log.info('Upload finalizado para o arquivo ' + file.name);
        });

        upload.progress(function(evt) {
          file.uploadProgress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
        });

        return upload;
      }
    };

    return service;
  }
])

;
