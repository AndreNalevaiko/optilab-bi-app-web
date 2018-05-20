angular.module('gorillasauth.protected.customers')

  .controller('customersController', [ 'BillingService', 'AbstractcustomersService',
    function (BillingService, AbstractcustomersService) {
      var self = this;

      self.dateNow = new Date();

      self.dateFilter = {
        day: self.dateNow.getDay(),
        //month: self.dateNow.getMonth(),
        month: 2,
        year: self.dateNow.getFullYear(),
      };

      self.abstract_customers = null;
      self.loading = {
        billing: false,
        abstract_brands: false,
        abstract_customers: false
      };

      self.search = function () {
        return {};
      };

      self.search();

    }
  ])

;
