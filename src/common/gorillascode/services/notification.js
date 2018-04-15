/**
 * @ngdoc module
 * @name gorillascode.services.notification
 * @description
 * Permite exibir notificações na tela.
 */
angular.module('gorillascode.services.notification', [])
.factory('NotificationService', [ '$log', '$mdToast', NotificationService ]);

function NotificationService($log, $mdToast) {
  var service = {
    error: function(message, data) {
      $log.error(message, data);
      showMessage(message);
    },
    success: function(message) {
      showMessage(message);
    },
    warning: function(message) {
      showMessage(message);
    }
  };

  function showMessage(message) {
    $mdToast.show(
      $mdToast
          .simple()
          .textContent(message)
    );
  }

  return service;
}