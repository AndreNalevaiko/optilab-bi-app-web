angular.module('gorillasauth.protected.dashboard')

  .controller('DashboardController', [ 'BillingService', 'AbstractProductsService',
    function (BillingService, AbstractProductsService) {
      var self = this;

      self.billing = null;
      self.abstract_products = null;
      self.loading = {
        billing: false,
        abstract_products: false,
        abstract_customers: false
      };

      self.search = function () {
        self.loading.billing = true;
        self.loading.abstract_products = true;
        self.loading.abstract_customers = true;

        BillingService.get().then(function (response) {
          self.billing = response;
          self.loading.billing = false;          
        });

        AbstractProductsService.get().then(function (response) {
          console.log(response);
          self.abstract_products = response;
          self.loading.abstract_products = false;          
        });
      };

      self.search();

    }
  ])

;
