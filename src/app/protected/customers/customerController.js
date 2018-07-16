angular.module('gorillasauth.protected.customer')

  .controller('CustomerController', [ 'DateFilterService', 'CustomerService', '$scope',
    function (DateFilterService, CustomerService, $scope) {
      var self = this;

      self.dateNow = new Date();

      self.orderTable = 'cli_nome_fan';

      self.filterOptions = DateFilterService.filterOptions();

      self.dateFilter = DateFilterService.filterDateNow();

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

      $scope.pagination = {
        "1": {
          page: 0,
          pageSize: 20
        },
        "2": {
          page: 0,
          pageSize: 20
        },
        "5": {
          page: 0,
          pageSize: 20
        },
        "6": {
          page: 0,
          pageSize: 20
        }
      };
 
    }
  ])

;
