angular.module('gorillasauth.protected.customer')

  .controller('CustomerController', ['$mdDialog', '$mdMedia', 'DateFilterService', 'CustomerService', '$scope', 'NotificationService',
    function ($mdDialog, $mdMedia, DateFilterService, CustomerService, $scope, NotificationService) {
      var self = this;

      self.orderTable = 'customer';
      self.sellerCodes = ['319','320','318','322','321','323'];

      self.filterOptions = DateFilterService.filterOptions();

      // self.dateFilter = DateFilterService.filterDateNow();
      self.dateFilter = DateFilterService.getDateNow();
      self.maxDate = self.dateFilter;

      $scope.selectedTab = 0;
      $scope.tabSeller = {
        0: '319',
        1: '320',
        2: '318',
        3: '322',
        4: '321',
        5: '323',
        6: 'Global',
        7: 'Others'
      };

      $scope.filterCustomers = function (param) {
        var tab = param;
        return function (customer) {
          if ($scope.tabSeller[tab] == 'Global') {
            return true;
          } else if ($scope.tabSeller[tab] == 'Others') {
            return self.sellerCodes.indexOf(customer.wallet) < 0;
          } else {
            return customer.wallet == $scope.tabSeller[tab];
          }
        };
      };

      self.abstract_customers = null;

      self.loading = false;

      self.generating = false;

      self.search = function () {
        self.amounts_customers = null;
        searchCustomerBilling();
        searchActive();
      };

      self.openCustomerDetail = function (ev, customer) {
        $mdDialog.show({
          controller: 'CustomerDetailDialogController as ctrl',
          fullscreen: true,
          locals: {
            date: self.dateFilter,
            customer: customer,
            products: CustomerService.searchCustomerProducts(self.dateFilter, customer.customer)
          },
          parent: angular.element(document.body),
          templateUrl: 'protected/customers/customerDetailDialog.tpl.html',
          targetEvent: ev,
          clickOutsideToClose: true
        }).then(function (result) {
          console.log('Dialog Confirmed');
        }, function (){
          console.log('Canceled Operation');
        });
      };

      function searchActive() {
        var filterActiveCustomers = createFilterSearchActiveCustomers();
        CustomerService.searchNumberActiveCustomers(filterActiveCustomers).then(function (response){
          var active_customers = {};
          if (response.objects.length) {
            angular.forEach(response.objects, function (obj) {
              var seller = obj.seller;
              if (obj.seller == 0) {
                seller = 'Global';
              }
              active_customers[seller] = obj;
            });
          } else {
            generateReports();
          }
          self.amounts_customers = active_customers;
        });
      }

      function searchCustomerBilling() {
        CustomerService.searchCustomerBillings(self.dateFilter).then(function (response){
            self.abstract_customers = response.map(function(obj) {
              obj.avg_month_qtd_current_year = parseInt(obj.avg_month_qtd_current_year);
              obj.avg_month_qtd_last_year = parseInt(obj.avg_month_qtd_last_year);
              obj.qtd_current_month = parseInt(obj.qtd_current_month);
              obj.avg_month_value_current_year = Number(obj.avg_month_value_current_year);
              obj.avg_month_value_last_year = Number(obj.avg_month_value_last_year);
              obj.value_current_month = Number(obj.value_current_month);

              obj.comparison_qtd = (obj.qtd_current_month / self.dateFilter.getDate()) / 
                (obj.avg_month_qtd_current_year / (self.dateFilter.getMonth() != 0 ? 30 : self.dateFilter.getDate()));

              obj.comparison_value = (obj.value_current_month / self.dateFilter.getDate()) /
                (obj.avg_month_value_current_year / (self.dateFilter.getMonth() != 0 ? 30 : self.dateFilter.getDate()));

              obj.comparison_qtd = obj.comparison_qtd == 0  || Number.isNaN(obj.comparison_qtd) ? -0.0001 : obj.comparison_qtd;
              obj.comparison_value = obj.comparison_value == 0 || Number.isNaN(obj.comparison_value) ? -0.0001 : obj.comparison_value;
                
              obj.comparison_qtd = obj.qtd_current_month == 0 && obj.avg_month_qtd_current_year != 0 ? -1 : obj.comparison_qtd;
              obj.comparison_value = obj.value_current_month == 0 && obj.avg_month_value_current_year != 0 ? -1 : obj.comparison_value;

              obj.comparison_qtd = obj.qtd_current_month != 0 && obj.avg_month_qtd_current_year == 0 ? 1 : obj.comparison_qtd;
              obj.comparison_value = obj.value_current_month != 0 && obj.avg_month_value_current_year == 0 ? 1 : obj.comparison_value;
              return obj;
            });
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
        "Others": {
          page: 0,
          pageSize: 20
        },
        "Global": {
          page: 0,
          pageSize: 20
        },
        "319": {
          page: 0,
          pageSize: 20
        },
        "320": {
          page: 0,
          pageSize: 20
        },
        "321": {
          page: 0,
          pageSize: 20
        },
        "322": {
          page: 0,
          pageSize: 20
        },
        "318": {
          page: 0,
          pageSize: 20
        },
        "323": {
          page: 0,
          pageSize: 20
        },
      };
    }
  ])

  .controller('CustomerDetailDialogController', ['$mdDialog', 'NotificationService', 'date', 'products',
  'customer',
    function ($mdDialog, NotificationService, date, products, customer) {
      var self = this;

      self.customer = customer;
      self.products = products.map(function(obj) {
        obj.product = obj.product.replace('_', ' ').toUpperCase();

        obj.avg_month_qtd_current_year = parseInt(obj.avg_month_qtd_current_year);
        obj.avg_month_qtd_last_year = parseInt(obj.avg_month_qtd_last_year);
        obj.qtd_current_month = parseInt(obj.qtd_current_month);
        obj.avg_month_value_current_year = Number(obj.avg_month_value_current_year);
        obj.avg_month_value_last_year = Number(obj.avg_month_value_last_year);
        obj.value_current_month = Number(obj.value_current_month);

        obj.comparison_qtd = (obj.qtd_current_month / date.getDate()) / 
          (obj.avg_month_qtd_current_year / (date.getMonth() != 0 ? 30 : date.getDate()));

        obj.comparison_value = (obj.value_current_month / date.getDate()) /
          (obj.avg_month_value_current_year / (date.getMonth() != 0 ? 30 : date.getDate()));

        obj.comparison_qtd = obj.comparison_qtd == 0  || Number.isNaN(obj.comparison_qtd) ? -0.0001 : obj.comparison_qtd;
        obj.comparison_value = obj.comparison_value == 0 || Number.isNaN(obj.comparison_value) ? -0.0001 : obj.comparison_value;
          
        obj.comparison_qtd = obj.qtd_current_month == 0 && obj.avg_month_qtd_current_year != 0 ? -1 : obj.comparison_qtd;
        obj.comparison_value = obj.value_current_month == 0 && obj.avg_month_value_current_year != 0 ? -1 : obj.comparison_value;

        obj.comparison_qtd = obj.qtd_current_month != 0 && obj.avg_month_qtd_current_year == 0 ? 1 : obj.comparison_qtd;
        obj.comparison_value = obj.value_current_month != 0 && obj.avg_month_value_current_year == 0 ? 1 : obj.comparison_value;
        return obj;
      });

      self.orderTable = 'product';

      self.confirm = function () {
        $mdDialog.hide();
      };

      self.cancel = function () {
        $mdDialog.cancel();
      };
    }
])

;
