angular.module('gorillasauth.public')

.controller('PublicController', ['$mdSidenav', 'customConfigs',
  function ($mdSidenav, customConfigs) {
    var self = this;
    self.customConfigs = customConfigs;

    self.toggleMenu = function() {
      $mdSidenav('sidenav-left').toggle();
    };
  }
])

;