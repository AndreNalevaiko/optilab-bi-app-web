angular.module('gorillasauth.protected.customer')

  .controller('CustomerController', [ 'DateFilterService', 'CustomerService',
    function (DateFilterService, CustomerService) {
      var self = this;

      self.dateNow = new Date();

      self.orderTable = 'cli_nome_fan';

      self.filterOptions = DateFilterService.filterOptions();

      self.dateFilter = {
        day: self.dateNow.getDay(),
        //month: self.dateNow.getMonth(),
        month: 2,
        year: self.dateNow.getFullYear(),
      };

      self.abstract_customers = null;

      self.loading = false;

      self.search = function () {
        CustomerService.getAbstract(self.dateFilter).then(function (response){
          self.abstract_customers = response;
        });

        // TODO retirar
        var dateToAmounts = angular.copy(self.dateFilter);
        dateToAmounts.day = 6;
        CustomerService.getAmounts(dateToAmounts).then(function (response){
          self.amounts_customers = response;
        });
      };

      self.search();
 
    }
  ])

;
