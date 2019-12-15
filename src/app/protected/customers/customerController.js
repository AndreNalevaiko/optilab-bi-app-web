angular.module('gorillasauth.protected.customer')

  .controller('CustomerController', ['$mdDialog', 'configuration', 'DateFilterService', 'CustomerService', 
    '$scope', 'GroupCustomerService',
    function ($mdDialog, configuration, DateFilterService, CustomerService, $scope, GroupCustomerService) {
      var self = this;

      self.filterName = '';
      self.filterNameGroup = '';

      self.orderTable = 'customer';
      self.orderTableGroup = 'customer';

      self.totalFat = {};

      self.sellerCodes = [];

      angular.forEach(configuration.wallets, function (w) {
        var key = Object.keys(w)[0];
        self.sellerCodes.push(key);
      });

      self.sellerCodes.push('Global');
      self.sellerCodes.push('Others');

      $scope.tabSeller = {};
      self.sellerCodes.forEach(function (value, i) {
        $scope.tabSeller[i] = value;
      });
      $scope.tabSeller[6] = 'Global';
      $scope.tabSeller[7] = 'Others';

      self.filterOptions = DateFilterService.filterOptions();

      self.searchFilters = {
        states: [],
        cities: [],
        neighborhoods: []
      };

      self.dateFilter = DateFilterService.getDateNow();
      self.maxDate = self.dateFilter;
      self.minimumRate = self.dateFilter.getDate() / 30;
      self.dateType = 'billed';

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
        searchCustomerBilling();
      };

      self.cleanFilters = function () {
        self.searchFilters = {
          states: [],
          cities: [],
          neighborhoods: []
        };
        self.search();
      };

      self.openCustomer = function (ev, customer) {
        $mdDialog.show({
          controller: 'CustomerDialogController as ctrl',
          fullscreen: true,
          locals: {
            customer: customer,
            overdue: CustomerService.getIsOverdue(customer.clicodigo, self.dateFilter, 'customer'),
            brokes: CustomerService.getBrokes(customer.clicodigo, self.dateFilter),
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
            dateType: self.dateType,
            customer: customer,
            products: CustomerService.searchCustomerProducts(self.dateFilter, customer.customer_code, self.dateType),
            productsAllYear: CustomerService.searchCustomerProductsAllYear(self.dateFilter, customer.customer_code, null, self.dateType),
            minimumRate: self.minimumRate
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

      self.openGroupCustomerPeriodDetail = function (ev, group, period) {
        $mdDialog.show({
          controller: 'GroupCustomerPeriodDetailDialogController as ctrl',
          fullscreen: true,
          locals: {
            date: self.dateFilter,
            group: group,
            periods: GroupCustomerService.searchGroupCustomerBillsPerMonth(self.dateFilter, group.customer, period, self.dateType),
            period: period,
            dateType: self.dateType,
          },
          parent: angular.element(document.body),
          templateUrl: 'protected/customers/dialogs/groupCustomerPeriodDetail.tpl.html',
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
            customers: GroupCustomerService.searchCustomersBillings(self.dateFilter, group.customer, self.dateType).then(function (response){
              return normalizeBillings(response);
            }),
            billings_overdued: CustomerService.getIsOverdue(groupCode, self.dateFilter, 'group').then(function (response) {
              return response.billings_overdued;
            }),
            products: GroupCustomerService.searchGroupProducts(self.dateFilter, group.customer, self.dateType),
            minimumRate: self.minimumRate,
            dateType: self.dateType,
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

      function parseNumberOrZero(value, round) {
        function roundNumber(value) {
          var step = 0.5; 
          var inv = 1.0 / step;
          return Math.round(value * inv) / inv;
        }

        if (round) {
          return value ? roundNumber(Number(value)) : 0;
        }
        return value ? Number(value) : 0;
      }

      function normalizeBillings(billings) {
        return billings.map(function(obj) {
          obj.clicodigo = obj.customer_code;
          obj.avg_month_qtd_current_year = parseNumberOrZero(obj.avg_month_qtd_current_year, true);
          obj.avg_month_qtd_last_year = parseNumberOrZero(obj.avg_month_qtd_last_year, true);
          obj.qtd_current_month = parseNumberOrZero(obj.qtd_current_month, true);
          obj.avg_month_value_current_year = parseNumberOrZero(obj.avg_month_value_current_year);
          obj.avg_month_value_last_year = parseNumberOrZero(obj.avg_month_value_last_year);
          obj.value_current_month = parseNumberOrZero(obj.value_current_month);

          obj.comparison_qtd = obj.qtd_current_month / obj.avg_month_qtd_current_year;

          obj.comparison_value = obj.value_current_month / obj.avg_month_value_current_year;


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
        CustomerService.searchCustomerBillings(self.dateFilter, null, self.dateType, self.searchFilters).then(function (response){
            self.abstract_customers = normalizeBillings(response);

            getTotals(self.abstract_customers);

            GroupCustomerService.searchGroupBillings(self.dateFilter, self.searchFilters, self.dateType).then(function (response) {
              self.abstract_groups = normalizeBillings(response);
            }, function (error) {
              console.log('Ocorreu um erro ao buscar os billings dos grupos', error);
            });

        });
      }

      function getTotals(items) {
        var totals = {
          Others: [],
          Global: []
        };
        angular.forEach(items, function (item) {
          if (!totals[item.wallet]) {
            totals[item.wallet] = [item.value_current_month];
          } else {
            totals[item.wallet].push(item.value_current_month);
          }
          if (self.sellerCodes.indexOf(item.wallet) < 0) {
            totals['Others'].push(item.value_current_month);
          }
          totals['Global'].push(item.value_current_month);
        });
        angular.forEach(totals, function (value, key) {
          if (value.length) {
            self.totalFat[key] = value.reduce(function (a, b){return a + b;});
          } else {
            self.totalFat[key] = 0;
          }
        });
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
        return self.dateFilter;
      }, function (newVal, oldVal) {
        self.minimumRate = newVal.getDate() / 30;
      });

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
  'date', 'products', 'productsAllYear', 'customer', 'dateType', 'minimumRate',
    function ($scope, $mdDialog, CustomerService, date, products, productsAllYear, customer, dateType, minimumRate) {
      var self = this;

      self.minimumRate = minimumRate;

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

        obj.comparison_qtd = obj.qtd_current_month / obj.avg_month_qtd_current_year;

        obj.comparison_value = obj.value_current_month / obj.avg_month_value_current_year;

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
        CustomerService.searchCustomerProductsAllYear(date, customer.customer_code, line.product_group, dateType).then(function (response){
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

  .controller('GroupCustomerDetailDialogController', ['$mdDialog', 'billings_overdued', 'CustomerService',
  'date',  'group', 'customers', 'products', 'minimumRate', 'dateType',
    function ($mdDialog, billings_overdued, CustomerService, date, group, customers, products, minimumRate, dateType) {
      var self = this;

      self.orderTableCustomers = 'customer';
      self.orderTableLine = null;
      self.orderTableProduct = null;

      self.minimumRate = minimumRate;

      self.group = group;

      self.customers = customers;
      self.billings_overdued = billings_overdued;

      if (self.billings_overdued.length) {
        self.group.overdue = true;
        
        angular.forEach(self.customers, function (customer) {
          var custCode = customer.customer_code;
          if (self.billings_overdued.filter(function (bill){return bill.clicodigo == custCode;}).length) {
            customer.overdue = true;
          }
        });
      }

      self.customerSelected = null;
      self.lineSelected = null;
      self.selectedTab = 1;

      self.group.lines = linesAndProductsNormalized(products);

      angular.forEach(self.customers, function (customer) {
        CustomerService.searchCustomerProducts(date, customer.customer_code, dateType).then(function (response) {
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
        self.selectedTab = 2;
      };

      self.selectLine = function (line) {
        self.lineSelected = line;
        self.selectedTab = 3;
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

      self.qtd_ytd = self.periods.map(function (i){ return Number(i.month_qtd); }).reduce(function(acc, val) { return acc + val; }, 0);
      self.value_ytd = self.periods.map(function (i){ return Number(i.month_value); }).reduce(function(acc, val) { return acc + val; }, 0);

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

.controller('GroupCustomerPeriodDetailDialogController', ['$mdDialog', 'CustomerService', 'GroupCustomerService',
  'date', 'group', 'periods', 'period', 'dateType',
    function ($mdDialog, CustomerService, GroupCustomerService, date, group, periods, period, dateType) {
      var self = this;

      self.orderTableCustomers = 'customer';
      self.orderTableLine = 'product_group';
      self.orderTableProduct = 'product';

      self.date = date;
      self.group = group;
      self.periods = periods;
      self.period = period;
      self.periodSelected = null;
      self.currentLines = null;
      self.group_customers = null;
      self.lineSelected = null;
      self.selectedTab = 0;

      self.qtd_ytd = self.periods.map(function (i){ return Number(i.month_qtd); }).reduce(function(acc, val) { return acc + val; }, 0);
      self.value_ytd = self.periods.map(function (i){ return Number(i.month_value); }).reduce(function(acc, val) { return acc + val; }, 0);

      self.selectPeriod = function (period) {
        self.periodSelected = period;
        self.dateSelected = new Date('' + period.year + '-' + period.month + '-' + period.last_day_month);

        GroupCustomerService.searchCustomersBillings(self.dateSelected, self.group.customer, dateType).then(function (response){
          self.group_customers = normalizeBillings(response);
          self.selectedTab = 1;
        }, function (error) {
          console.log(error);
        });
      };
      
      self.selectCustomer = function (customer, is_group) {
        self.customerSelected = customer;

        if (is_group) {
          GroupCustomerService.searchGroupProducts(self.dateSelected, self.periodSelected.customer).then(function (response) {
            self.customerSelected.lines = normalizeProductsAndLines(response);
            self.selectedTab = 2;
          });
        } else {
          CustomerService.searchCustomerProducts(self.dateSelected, customer.customer_code, dateType).then(function (response) {
            self.customerSelected.lines = normalizeProductsAndLines(response);
            self.selectedTab = 2;
          }, function (error) {
            console.log(error);
          });
        }
      };
      
      self.selectLine = function (line) {
        self.lineSelected = line;
        self.selectedTab = 3;
      };

      self.confirm = function () {
        $mdDialog.hide();
      };

      self.cancel = function () {
        $mdDialog.cancel();
      };

      function normalizeProductsAndLines(response) {
        var products = response.map(function(obj) {
          obj.product = obj.product.replace('_', ' ').toUpperCase();
          obj.product_group = obj.product_group.replace('_', ' ').toUpperCase();
  
          obj.avg_month_qtd_current_year = parseInt(obj.avg_month_qtd_current_year);
          obj.avg_month_qtd_last_year = parseInt(obj.avg_month_qtd_last_year);
          obj.qtd_current_month = parseInt(obj.qtd_current_month);
          obj.avg_month_value_current_year = Number(obj.avg_month_value_current_year);
          obj.avg_month_value_last_year = Number(obj.avg_month_value_last_year);
          obj.value_current_month = Number(obj.value_current_month);
  
          obj.comparison_qtd = obj.qtd_current_month / obj.avg_month_qtd_current_year;
  
          obj.comparison_value = obj.value_current_month / obj.avg_month_value_current_year;
  
          obj.comparison_qtd = obj.comparison_qtd == 0  || Number.isNaN(obj.comparison_qtd) ? -0.0001 : obj.comparison_qtd;
          obj.comparison_value = obj.comparison_value == 0 || Number.isNaN(obj.comparison_value) ? -0.0001 : obj.comparison_value;
            
          obj.comparison_qtd = obj.qtd_current_month == 0 && obj.avg_month_qtd_current_year != 0 ? -1 : obj.comparison_qtd;
          obj.comparison_value = obj.value_current_month == 0 && obj.avg_month_value_current_year != 0 ? -1 : obj.comparison_value;
  
          obj.comparison_qtd = obj.qtd_current_month != 0 && obj.avg_month_qtd_current_year == 0 ? 1 : obj.comparison_qtd;
          obj.comparison_value = obj.value_current_month != 0 && obj.avg_month_value_current_year == 0 ? 1 : obj.comparison_value;
          return obj;
        });
  
        lines = products.filter(function (item) {
          return item.product == '';
        });

        angular.forEach(lines, function (line) {
          line.products = products.filter(function (product) {
            return product.product != ''&& product.product_group == line.product_group;
          });
        });

        return lines;
      }

      function normalizeBillings(billings) {
        return billings.map(function(obj) {
          obj.clicodigo = obj.customer_code;
          obj.avg_month_qtd_current_year = parseNumberOrZero(obj.avg_month_qtd_current_year, true);
          obj.avg_month_qtd_last_year = parseNumberOrZero(obj.avg_month_qtd_last_year, true);
          obj.qtd_current_month = parseNumberOrZero(obj.qtd_current_month, true);
          obj.avg_month_value_current_year = parseNumberOrZero(obj.avg_month_value_current_year);
          obj.avg_month_value_last_year = parseNumberOrZero(obj.avg_month_value_last_year);
          obj.value_current_month = parseNumberOrZero(obj.value_current_month);

          obj.comparison_qtd = obj.qtd_current_month / obj.avg_month_qtd_current_year;

          obj.comparison_value = obj.value_current_month / obj.avg_month_value_current_year;


          obj.comparison_qtd = obj.comparison_qtd == 0  || Number.isNaN(obj.comparison_qtd) ? -0.0001 : obj.comparison_qtd;
          obj.comparison_value = obj.comparison_value == 0 || Number.isNaN(obj.comparison_value) ? -0.0001 : obj.comparison_value;
            
          obj.comparison_qtd = obj.qtd_current_month == 0 && obj.avg_month_qtd_current_year != 0 ? -1 : obj.comparison_qtd;
          obj.comparison_value = obj.value_current_month == 0 && obj.avg_month_value_current_year != 0 ? -1 : obj.comparison_value;

          obj.comparison_qtd = obj.qtd_current_month != 0 && obj.avg_month_qtd_current_year == 0 ? 1 : obj.comparison_qtd;
          obj.comparison_value = obj.value_current_month != 0 && obj.avg_month_value_current_year == 0 ? 1 : obj.comparison_value;
          return obj;
        });
      }

      function parseNumberOrZero(value, round) {
        function roundNumber(value) {
          var step = 0.5; 
          var inv = 1.0 / step;
          return Math.round(value * inv) / inv;
        }

        if (round) {
          return value ? roundNumber(Number(value)) : 0;
        }
        return value ? Number(value) : 0;
      }
    }
])

.controller('CustomerDialogController', ['$mdDialog', 'customer', 'overdue', 'info', 'brokes',
    function ($mdDialog, customer, overdue, info, brokes) {
      var self = this;

      self.selectedTab = 1;

      self.customer = customer;
      self.address = info.address;
      self.addressUrl = 'https://maps.google.com/maps?q='+encodeURIComponent(info.address.search)+'&t=&z=13&ie=UTF8&iwloc=&output=embed';
      // self.addressUrl = 'https://maps.google.com/maps?q='+encodeURIComponent('SANTO ANTONIO 21 centro tangara sc  89642000')+'&t=&z=13&ie=UTF8&iwloc=&output=embed';
      self.tables = info.tables;
      self.payment_method = info.payment_method;
      self.brokes = brokes;
      self.is_overdue = overdue.is_overdue;
      self.billings = overdue.billings_overdued;

      self.confirm = function () {
        $mdDialog.hide();
      };

      self.cancel = function () {
        $mdDialog.cancel();
      };
    }
])

;
