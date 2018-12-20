angular.module('gorillasauth.public')

.controller('PublicController', ['$mdSidenav',
  function ($mdSidenav) {
    var self = this;

    self.toggleMenu = function() {
      $mdSidenav('sidenav-left').toggle();
    };
  }
])

;