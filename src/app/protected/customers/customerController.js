angular.module('gorillasauth.protected.customer')

  .controller('CustomerController', [ 'DateFilterService', 'CustomerService', '$scope', 'NotificationService',
    function (DateFilterService, CustomerService, $scope, NotificationService) {
      var self = this;

      self.orderTable = 'cli_nome_fan';

      self.dateFilter = new Date();
      self.dateFilter.setDate(self.dateFilter.getDate()-1);
      self.abstract_customers = null;

      self.loading = false;

      self.generating = false;

      self.search = function () {
        self.amounts_customers = null;
        searchCustomerBilling();
        searchActive();
      };

      function searchActive() {
        var filterActiveCustomers = createFilterSearchActiveCustomers();
        CustomerService.searchNumberActiveCustomers(filterActiveCustomers).then(function (response){
          var active_customers = {};
          if (response.objects.length) {
            angular.forEach(response.objects, function (obj) {
              active_customers[obj.business_code] = obj;
            });
          } else {
            generateReports();
          }
          self.amounts_customers = active_customers;
        });
      }

      function searchCustomerBilling() {
        var filterCustomerBilling = createFilterSearchCustomerBilling();
        CustomerService.searchCustomerBillingReport(filterCustomerBilling).then(function (response){
          if (response.objects.length) {
            self.abstract_customers = response.objects;
          } else {
            generateReports();
          }
          
        });
      }

      function generateReports() {
        if (!self.generating) {
          self.generating = true;

          NotificationService.success('Gerando os dados!');
          CustomerService.generate(self.dateFilter).then(function (response) {
            self.generating = false;
            self.search();
          }, function (error) {
            NotificationService.error('Ocorreu um erro ao gerar os dados!');
          });
        }
      }

      function createFilterSearchCustomerBilling() {
        return {
          q: {
            filters: [
              {name: 'date', op: 'eq', val: self.dateFilter}
            ]
          }
        };
      }
      
      function createFilterSearchActiveCustomers() {
        var month = self.dateFilter.getMonth() + 1;
        var dateFormated = self.dateFilter.getFullYear() + '-' + month + '-' + self.dateFilter.getDate();
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
        "0": {
          page: 0,
          pageSize: 20
        },
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
