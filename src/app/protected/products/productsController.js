angular.module('gorillasauth.protected.products')

  .controller('productsController', [ 'BillingService', 'AbstractProductsService',
    function (BillingService, AbstractProductsService) {
      var self = this;

      self.dateNow = new Date();

      self.dateFilter = {
        day: self.dateNow.getDay(),
        //month: self.dateNow.getMonth(),
        month: 2,
        year: self.dateNow.getFullYear(),
      };

      self.brands = null;
      
      self.loading = false;

      self.search = function () {
        self.loading = true;

        // var productsfilter = ['varilux', 'kodak', 'crizal', 'itop', 'trans'];
        var productsfilter = ['varilux'];


        AbstractProductsService.getBrand(self.dateFilter, productsfilter).then(function (response) {
          self.brands = response;
          self.loading = false;          
        });

        // AbstractProductsService.getBrand(self.dateFilter, 'kodak').then(function (brand) {
        //   self.brands.kodak = brand;
        //   self.loading.kodak = false;           
        // });

        // AbstractProductsService.getBrand(self.dateFilter, 'itop').then(function (brand) {
        //   self.brands.itop = brand;
        //   self.loading.itop = false;             
        // });

        // AbstractProductsService.getBrand(self.dateFilter, 'crizal').then(function (brand) {
        //   self.brands.crizal = brand;             
        //   self.loading.crizal = false;             
        // });

        // AbstractProductsService.getBrand(self.dateFilter, 'trans').then(function (brand) {
        //   self.brands.trans = brand;             
        //   self.loading.trans = false;             
        // });

      };

      self.search();

    }
  ])

;
