angular.module('gorillasauth.protected.customer')

  .controller('CustomerController', [ 'DateFilterService', 'CustomerService', '$scope',
    function (DateFilterService, CustomerService, $scope) {
      var self = this;

      self.orderTable = 'cli_nome_fan';

      self.filterOptions = DateFilterService.filterOptions();

      self.dateFilter = DateFilterService.filterDateNow();

      self.abstract_customers = null;

      self.loading = false;

      self.search = function () {
        var filterCustomerBilling = createFilterSearchCustomerBilling();
        CustomerService.searchCustomerBillingReport(filterCustomerBilling).then(function (response){
          self.abstract_customers = response.objects;
        });
        
        var filterActiveCustomers = createFilterSearchActiveCustomers();
        CustomerService.searchNumberActiveCustomers(filterActiveCustomers).then(function (response){
          var active_customers = {};
          if (response.objects.length) {
            angular.forEach(response.objects, function (obj) {
              active_customers[obj.business_code] = obj;
            });
          }
          self.amounts_customers = active_customers;
        });
      };

      function createFilterSearchCustomerBilling() {
        return {
          q: {
            filters: [
              {name: 'month', op: 'eq', val: self.dateFilter.month},
              {name: 'year', op: 'eq', val: self.dateFilter.year},
            ]
          }
        };
      }
      
      function createFilterSearchActiveCustomers() {
        var dateFormated = self.dateFilter.year + '-' + self.dateFilter.month + '-' + self.dateFilter.day;
        return {
          q: {
            filters: [
              {name: 'date', op: 'eq', val: dateFormated}
            ]
          }
        };
      }

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
