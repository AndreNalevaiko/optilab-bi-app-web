angular.module('gorillasauth.protected.customer')

  .controller('CustomerController', ['$mdDialog', 'configuration', 'DateFilterService', 'CustomerService', 
    '$scope', 'NotificationService', 'GroupCustomerService',
    function ($mdDialog, configuration, DateFilterService, CustomerService, $scope, NotificationService,
      GroupCustomerService) {
      var self = this;

      self.filterName = '';
      self.filterNameGroup = '';

      self.orderTable = 'customer';
      self.orderTableGroup = 'customer';

      self.sellerCodes = Object.keys(configuration.wallets);
      self.sellerCodes.push('Global');
      self.sellerCodes.push('Others');

      $scope.tabSeller = {};
      self.sellerCodes.forEach(function (value, i) {
        $scope.tabSeller[i] = value;
      });
      $scope.tabSeller[6] = 'Global';
      $scope.tabSeller[7] = 'Others';

      self.filterOptions = DateFilterService.filterOptions();

      self.dateFilter = DateFilterService.getDateNow();
      self.maxDate = self.dateFilter;

      $scope.selectedTab = 0;

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

      self.openCustomer = function (ev, customer) {
        $mdDialog.show({
          controller: 'CustomerDialogController as ctrl',
          fullscreen: true,
          locals: {
            customer: customer,
            status: CustomerService.getIsOverdue(customer.clicodigo, self.dateFilter, 'customer'),
            info: CustomerService.getInfos(customer.clicodigo)
          },
          parent: angular.element(document.body),
          templateUrl: 'protected/customers/dialogs/customer.tpl.html',
          targetEvent: ev,
          clickOutsideToClose: true
        }).then(function (result) {
          console.log('Dialog Confirmed');
        }, function (){
          console.log('Canceled Operation');
        });
      };

      self.openCustomerDetail = function (ev, customer) {
        $mdDialog.show({
          controller: 'CustomerDetailDialogController as ctrl',
          fullscreen: true,
          locals: {
            date: self.dateFilter,
            customer: customer,
            products: CustomerService.searchCustomerProducts(self.dateFilter, customer.customer_code),
            productsAllYear: CustomerService.searchCustomerProductsAllYear(self.dateFilter, customer.customer_code),
          },
          parent: angular.element(document.body),
          templateUrl: 'protected/customers/dialogs/customerDetail.tpl.html',
          targetEvent: ev,
          clickOutsideToClose: true
        }).then(function (result) {
          console.log('Dialog Confirmed');
        }, function (){
          console.log('Canceled Operation');
        });
      };

      self.openCustomerPeriodDetail = function (ev, customer, period) {
        $mdDialog.show({
          controller: 'CustomerPeriodDetailDialogController as ctrl',
          fullscreen: true,
          locals: {
            date: self.dateFilter,
            customer: customer,
            periods: CustomerService.searchCustomerBillsPerMonth(self.dateFilter, customer.customer_code, period),
            currentPeriod: CustomerService.searchCustomerProducts(self.dateFilter, customer.customer_code),
            period: period,
            type: 'customer',
          },
          parent: angular.element(document.body),
          templateUrl: 'protected/customers/dialogs/customerPeriodDetail.tpl.html',
          targetEvent: ev,
          clickOutsideToClose: true
        }).then(function (result) {
          console.log('Dialog Confirmed');
        }, function (){
          console.log('Canceled Operation');
        });
      };

      self.openGroupCustomerPeriodDetail = function (ev, customer, period) {
        $mdDialog.show({
          controller: 'CustomerPeriodDetailDialogController as ctrl',
          fullscreen: true,
          locals: {
            date: self.dateFilter,
            customer: customer,
            periods: GroupCustomerService.searchGroupCustomerBillsPerMonth(self.dateFilter, customer.customer, period),
            currentPeriod: GroupCustomerService.searchGroupProducts(self.dateFilter, customer.customer),
            period: period,
            type: 'group',
          },
          parent: angular.element(document.body),
          templateUrl: 'protected/customers/dialogs/customerPeriodDetail.tpl.html',
          targetEvent: ev,
          clickOutsideToClose: true
        }).then(function (result) {
          console.log('Dialog Confirmed');
        }, function (){
          console.log('Canceled Operation');
        });
      };

      self.openGroupDetail = function (ev, group) {
        var re = new RegExp(/^[0-9]+/g);
        var groupCode = group.customer.match(re)[0];
        $mdDialog.show({
          controller: 'GroupCustomerDetailDialogController as ctrl',
          fullscreen: true,
          locals: {
            date: self.dateFilter,
            group: group,
            customers: GroupCustomerService.searchCustomersBillings(self.dateFilter, group.customer).then(function (response){
              return normalizeBillings(response);
            }),
            statusCustomers: CustomerService.getIsOverdue(groupCode, self.dateFilter, 'group'),
            products: GroupCustomerService.searchGroupProducts(self.dateFilter, group.customer)
          },
          parent: angular.element(document.body),
          templateUrl: 'protected/customers/dialogs/groupCustomerDetail.tpl.html',
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

      function normalizeBillings(billings) {
        return billings.map(function(obj) {
          // var re = new RegExp(/^[0-9]+/g);
          obj.clicodigo = obj.customer_code;
          obj.avg_month_qtd_current_year = parseInt(obj.avg_month_qtd_current_year);
          obj.avg_month_qtd_last_year = parseInt(obj.avg_month_qtd_last_year);
            if (isNaN(obj.avg_month_qtd_last_year)) {
              obj.avg_month_qtd_last_year = 0;
            }
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
      }

      function searchCustomerBilling() {
        CustomerService.searchCustomerBillings(self.dateFilter).then(function (response){
            self.abstract_customers = normalizeBillings(response);
            
            var groups_customer =  [];
            angular.forEach(self.abstract_customers, function (item) {
              if (item.group_customer != '' && groups_customer.indexOf(item.group_customer) < 0) {
                groups_customer.push(item.group_customer);
              }
            });

            self.abstract_groups = [];
            angular.forEach(groups_customer, function (group) {
              var group_billing = {
                customer: group,
                wallet: null,
                avg_month_qtd_current_year: 0,
                avg_month_qtd_last_year: 0,
                avg_month_value_current_year: 0,
                avg_month_value_last_year: 0,
                qtd_current_month: 0,
                value_current_month: 0,
              };
              
              angular.forEach(response, function (customer) {
                if (customer.group_customer == group) {
                  group_billing.wallet = customer.wallet;
                  group_billing.avg_month_qtd_current_year += customer.avg_month_qtd_current_year;
                  group_billing.avg_month_qtd_last_year += customer.avg_month_qtd_last_year;
                  group_billing.avg_month_value_current_year += customer.avg_month_value_current_year;
                  group_billing.avg_month_value_last_year += customer.avg_month_value_last_year;
                  group_billing.qtd_current_month += customer.qtd_current_month;
                  group_billing.value_current_month += customer.value_current_month;
                }
              });
              self.abstract_groups.push(group_billing);
            });

            self.abstract_groups = normalizeBillings(self.abstract_groups);

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

      $scope.pagination = {};
      $scope.paginationGroup = {};
      angular.forEach(self.sellerCodes, function (seller) {
        $scope.pagination[seller.toString()] = {page: 0, pageSize: 10};
        $scope.paginationGroup[seller.toString()] = {page: 0, pageSize: 5};
      });

      function clearPagination () {
        angular.forEach($scope.pagination, function (key, val) {
          $scope.pagination[val].page = 0;
        });
        angular.forEach($scope.paginationGroup, function (key, val) {
          $scope.paginationGroup[val].page = 0;
        });
      }

      $scope.$watch(function () {
        return self.filterName;
      }, function (newVal, oldVal) {
        clearPagination();
      });
      $scope.$watch(function () {
        return self.filterNameGroup;
      }, function (newVal, oldVal) {
        clearPagination();
      });
    }
  ])

  .controller('CustomerDetailDialogController', ['$scope','$mdDialog', 'CustomerService', 
  'date', 'products', 'productsAllYear', 'customer',
    function ($scope, $mdDialog, CustomerService, date, products, productsAllYear, customer) {
      var self = this;

      self.customer = customer;
      self.productsAllYear = productsAllYear;
      self.lineSelected = null;

      self.activeValueChart = 'value';

      $scope.selectedTab = 0;

      self.products = products.map(function(obj) {
        obj.product = obj.product.replace('_', ' ').toUpperCase();
        obj.product_group = obj.product_group.replace('_', ' ').toUpperCase();

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

      self.lines = self.products.filter(function (item) {
        return item.product == '';
      });

      angular.forEach(self.lines, function (line) {
        line.products = self.products.filter(function (product) {
          return product.product != '' && product.product_group == line.product_group;
        });
        CustomerService.searchCustomerProductsAllYear(date, customer.customer_code, line.product_group).then(function (response){
          line.productsAllYear = response;
        });
      });

      self.orderTableLine = null;
      self.orderTableProduct = null;

      self.selectLine = function (line) {
        self.lineSelected = line;
        $scope.selectedTab = 1;
      };

      self.confirm = function () {
        $mdDialog.hide();
      };

      self.cancel = function () {
        $mdDialog.cancel();
      };

      $scope.$watch('selectedTab', function (newVal) {
        if (newVal == 0) {
          self.lineSelected = null;
        }
      });
    }
])

  .controller('GroupCustomerDetailDialogController', ['$mdDialog', 'statusCustomers', 'CustomerService',
  'date',  'group', 'customers', 'products',
    function ($mdDialog, statusCustomers, CustomerService, date, group, customers, products) {
      var self = this;
      var re = new RegExp(/^[0-9]+/g);

      self.orderTableCustomers = 'customer';
      self.orderTableLine = 'product_group';
      self.orderTableProduct = 'product';

      self.group = group;
      self.customers = customers;
      self.customersOverdued = statusCustomers.customers_overdued;

      if (self.customersOverdued.length) {
        self.group.overdue = true;
        
        angular.forEach(self.customers, function (customer) {
          // var custCode = customer.customer.match(re)[0];
          var custCode = customer.customer_code;
          if (self.customersOverdued.indexOf(parseInt(custCode)) > -1) {
            customer.overdue = true;
          }
        });
      }

      self.customerSelected = null;
      self.lineSelected = null;
      self.selectedTab = 0;

      self.group.lines = linesAndProductsNormalized(products);

      angular.forEach(self.customers, function (customer) {
        CustomerService.searchCustomerProducts(date, customer.customer_code).then(function (response) {
          customer.lines = linesAndProductsNormalized(response);
        });
      });

      function linesAndProductsNormalized(products) {
        var productsNormalized = products.map(function(obj) {
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
  
        var linesNormalized = productsNormalized.filter(function (item) {
          return item.product == '';
        });
  
        angular.forEach(linesNormalized, function (line) {
          line.products = productsNormalized.filter(function (product) {
            return product.product != ''&& product.product_group == line.product_group;
          });
        });

        return linesNormalized;
      }

      self.selectCustomer = function (customer) {
        self.customerSelected = customer;
        self.selectedTab = 1;
      };

      self.selectLine = function (line) {
        self.lineSelected = line;
        self.selectedTab = 2;
      };

      self.confirm = function () {
        $mdDialog.hide();
      };

      self.cancel = function () {
        $mdDialog.cancel();
      };
    }
])

  .controller('CustomerPeriodDetailDialogController', ['$mdDialog', 'CustomerService', 'GroupCustomerService',
  'date', 'customer',  'currentPeriod', 'periods', 'period', 'type',
    function ($mdDialog, CustomerService, GroupCustomerService, date, customer, currentPeriod, periods, period, type) {
      var self = this;

      self.orderTableCustomers = 'customer';
      self.orderTableLine = 'product_group';
      self.orderTableProduct = 'product';

      self.date = date;
      self.customer = customer;
      self.periods = periods;
      self.period = period;
      self.periodSelected = null;
      self.currentLines = null;
      self.lineSelected = null;
      self.selectedTab = 0;

      angular.forEach(self.periods, function (period) {
        var date = new Date(period.year, period.month - 1 , period.last_day_month);
        if (type == 'customer') {
          CustomerService.searchCustomerProducts(date.toISOString(), period.customer_code).then(function (response) {
            self.currentLines = linesAndProductsNormalized(currentPeriod, date, false);
            period.lines = linesAndProductsNormalized(response, date, true);
          });
        } else {
          GroupCustomerService.searchGroupProducts(date.toISOString(), period.customer).then(function (response) {
            self.currentLines = linesAndProductsNormalized(currentPeriod, date, false);
            period.lines = linesAndProductsNormalized(response, date, true);
          });
        }
      });

      function linesAndProductsNormalized(products, date, addCurrent) {
        var productsNormalized = products.map(function(obj) {
          if (addCurrent) {
            var currentProd = self.currentLines.filter(function (item) {
              return item.product == obj.product && obj.product_group == item.product_group;
            });
  
            if (currentProd.length) {
              obj.current_qtd = currentProd[0].qtd_current_month;
              obj.current_value = currentProd[0].value_current_month;
            } else {
              obj.current_qtd = 0;
              obj.current_value = 0;
  
            }
          }

          obj.product = obj.product.replace('_', ' ').toUpperCase();
  
          obj.avg_month_qtd_current_year = parseInt(obj.avg_month_qtd_current_year);
          obj.avg_month_qtd_last_year = parseInt(obj.avg_month_qtd_last_year);
          obj.qtd_current_month = parseInt(obj.qtd_current_month);
          obj.avg_month_value_current_year = Number(obj.avg_month_value_current_year);
          obj.avg_month_value_last_year = Number(obj.avg_month_value_last_year);
          obj.value_current_month = Number(obj.value_current_month);

  
          // Talvez remover possivelmente n será usado
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
  
        var linesNormalized = productsNormalized.filter(function (item) {
          return item.product == '';
        });
  
        angular.forEach(linesNormalized, function (line) {
          line.products = productsNormalized.filter(function (product) {
            return product.product != '' && product.product_group == line.product_group;
          });
        });

        return linesNormalized;
      }

      self.selectPeriod = function (period) {
        self.periodSelected = period;
        self.selectedTab = 1;
      };
      
      self.selectLine = function (line) {
        self.lineSelected = line;
        self.selectedTab = 2;
      };

      self.confirm = function () {
        $mdDialog.hide();
      };

      self.cancel = function () {
        $mdDialog.cancel();
      };
    }
])

.controller('CustomerDialogController', ['$mdDialog', 'customer', 'status', 'info', 
    function ($mdDialog, customer, status, info) {
      var self = this;

      self.customer = customer;
      self.address = info.address;
      self.addressUrl = 'https://maps.google.com/maps?q='+encodeURIComponent(info.address.search)+'&t=&z=13&ie=UTF8&iwloc=&output=embed';
      // self.addressUrl = 'https://maps.google.com/maps?q='+encodeURIComponent('SANTO ANTONIO 21 centro tangara sc  89642000')+'&t=&z=13&ie=UTF8&iwloc=&output=embed';
      self.tables = info.tables;
      self.status = status;

      self.confirm = function () {
        $mdDialog.hide();
      };

      self.cancel = function () {
        $mdDialog.cancel();
      };
    }
])

;
