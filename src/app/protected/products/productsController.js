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

      self.brands = {
        varilux: null,
        kodak: null,
        crizal: null,
        itop: null,
        trans: null,
      };
      
      self.loading = {
        varilux: false,
        kodak: false,
        crizal: false,
        itop: false,
        trans: false
      };

      self.search = function () {
        self.loading.varilux = true;
        self.loading.kodak = true;
        self.loading.itop = true;
        self.loading.crizal = true;
        self.loading.trans = true;


        AbstractProductsService.getBrand(self.dateFilter, 'varilux').then(function (brand) {
          self.brands.varilux = brand;
          self.loading.varilux = false;          
        });

        AbstractProductsService.getBrand(self.dateFilter, 'kodak').then(function (brand) {
          self.brands.kodak = brand;
          self.loading.kodak = false;           
        });

        AbstractProductsService.getBrand(self.dateFilter, 'itop').then(function (brand) {
          self.brands.itop = brand;
          self.loading.itop = false;             
        });

        AbstractProductsService.getBrand(self.dateFilter, 'crizal').then(function (brand) {
          self.brands.crizal = brand;             
          self.loading.crizal = false;             
        });

        AbstractProductsService.getBrand(self.dateFilter, 'trans').then(function (brand) {
          self.brands.trans = brand;             
          self.loading.trans = false;             
        });

      };

      self.search();

    }
  ])

;
