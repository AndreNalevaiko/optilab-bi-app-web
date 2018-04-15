angular.module('gorillasauth.protected.dashboard')

  .controller('DashboardController', [ 'billing',
    function (billing) {
      var self = this;

      self.billing = billing;
      console.log(billing);

    }
  ])

;
