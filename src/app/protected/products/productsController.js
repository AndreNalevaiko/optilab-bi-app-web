angular.module('gorillasauth.protected.products')

  .controller('productsController', ['configuration', 'DateFilterService', '$scope', 'CustomerService',
  'ProductService', '$mdDialog', 'BudgetService', '$mdMedia', 'NotificationService',
    function (configuration, DateFilterService, $scope, CustomerService, ProductService, $mdDialog, 
      BudgetService, $mdMedia, NotificationService) {
      var self = this;
      
      self.sellerCodes = [];
      angular.forEach(configuration.wallets, function (w) {
        var key = Object.keys(w)[0];
        self.sellerCodes.push(key);
      });

      $scope.tabSeller = {};
      self.sellerCodes.forEach(function (value, i) {
        $scope.tabSeller[i] = value;
      });
      $scope.tabSeller[6] = '0';
      $scope.tabSeller[7] = '';

      $scope.selectedTab = 0;
      self.dateNow = new Date();
      self.loading = false;
      self.loadingYear = false;
      self.orderTable = 'product';
      self.generating = false;

      self.filterOptions = DateFilterService.filterOptions();
      self.dateFilter = DateFilterService.getDateNow();
      self.dateType = 'billed';
      self.minimumRate = self.dateFilter.getDate() / 30;
      self.maxDate = self.dateFilter;

      self.amounts_customers = null;

      $scope.filterProducts = function (param) {
        var tab = param;
        return function (item) {
          return item.wallet == $scope.tabSeller[tab];
        };
      };

      function normalizeCustomers(billings) {
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

      self.insertBudgetCustActives = function (ev, wallet, budget) {
        $mdDialog.show({
          controller: 'EditCustActivesBudgetController as ctrl',
          fullscreen: $mdMedia('xs'),
          locals: {
            wallet: wallet,
            dateToSave: self.dateFilter,
            budget: budget
          },
          parent: angular.element(document.body),
          templateUrl: 'protected/products/edit-budget-active-customers-dialog.tpl.html',
          targetEvent: ev,
          clickOutsideToClose: true
        }).then(function (result) {
          searchActive();
        }, function (){
          console.log('Canceled Operation');
        });
      };

      self.openBrandDetail = function (ev, brand) {
        $mdDialog.show({
          controller: 'BrandDetailDetailDialogController as ctrl',
          fullscreen: true,
          locals: {
            brand: brand,
            abstract_customers: CustomerService.searchCustomersByProduct(self.dateFilter, self.dateType, brand.product_group).then(function (response){
              return normalizeCustomers(response);
            }),
            wallet: $scope.tabSeller[$scope.selectedTab],
            minimumRate: self.dateFilter.getDate() / 30
          },
          parent: angular.element(document.body),
          templateUrl: 'protected/products/lineDetail.tpl.html',
          targetEvent: ev,
          clickOutsideToClose: true
        }).then(function (result) {
          console.log('Dialog Confirmed');
        }, function (){
          console.log('Canceled Operation');
        });
      };

      self.openBrandYearDetail = function (ev, lineSelected) {
        ev.stopPropagation();
        $mdDialog.show({
          controller: 'BrandDetailYearDetailDialogController as ctrl',
          fullscreen: true,
          locals: {
            date: self.dateFilter,
            lineSelected: lineSelected,
            periods: ProductService.searchProductBillingsPerMonth(
              self.dateFilter, $scope.tabSeller[$scope.selectedTab], lineSelected.product_group, self.dateType).then(function (response) {
              return response;
            }, function (error) {
              console.log(error);
            })
          },
          parent: angular.element(document.body),
          templateUrl: 'protected/products/lineYearDetail.tpl.html',
          targetEvent: ev,
          clickOutsideToClose: true
        }).then(function (result) {
          console.log('Dialog Confirmed');
        }, function (){
          console.log('Canceled Operation');
        });
      };

      self.insertBudget = function (ev, product) {
        ev.preventDefault();
        ev.stopPropagation();
        $mdDialog.show({
          controller: 'editBudgetProductController as ctrl',
          fullscreen: $mdMedia('xs'),
          locals: {
            product: product.product_group,
            ref: product.product_group + '_' + product.wallet,
            dateToSave: self.dateFilter,
            budget_amount: product.budget_amount,
            budget_value: product.budget_value
          },
          parent: angular.element(document.body),
          templateUrl: 'protected/products/edit-budget-dialog.tpl.html',
          targetEvent: ev,
          clickOutsideToClose: true
        }).then(function () {
          self.search();
        }, function (){
          console.log('Canceled Operation');
        });
      };

      function searchActive() {
        var params = {
          q: {
            filters: [
              {name: 'month', op: 'eq', val: self.dateFilter.getMonth() > 10 ? 1 : self.dateFilter.getMonth() + 1},
              {name: 'year', op: 'eq', val: self.dateFilter.getFullYear()},
              {name: 'type_ref', op: 'eq', val: 'CUSTOMERS_ACTIVES'},
            ]
          },  
          results_per_page: 999
        };
        BudgetService.search(params).then(function (respBdg) {
          var budgets = respBdg.objects;
          var filterActiveCustomers = createFilterSearchActiveCustomers();
          CustomerService.searchNumberActiveCustomers(filterActiveCustomers).then(function (response){
            var active_customers = {};
            if (response.objects.length) {
              angular.forEach(response.objects, function (obj) {
                var seller = obj.seller;
                if (obj.seller == 0) {
                  seller = '0';
                }

                var budget = budgets.filter(function (bdg) {
                  return bdg.ref == seller;
                });

                active_customers[seller] = obj;
                active_customers[seller].budget = budget.length ? budget[0] : null;
              });
            } else {
              generateReports();
            }
            self.amounts_customers = active_customers;
          });
        }, function (error) {
          NotificationService.error('Ocorreu um erro ao buscar os budgets');
        });

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

      function normalizeBillings(billings, budgets) {
        if (budgets) {
          angular.forEach(billings, function (bill) {
            angular.forEach(budgets, function (bdg) {
              var productRef = bill.product_group + '_' + bill.wallet; 
              if (bdg.ref == productRef && bdg.type_ref == 'PRODUCT_AMOUNT') {
                bill.budget_amount = bdg;
              } else if (bdg.ref == productRef && bdg.type_ref == 'PRODUCT_VALUE') {
                bill.budget_value = bdg;
              }
            });
          });
        }

        return billings.map(function(obj) {
          // Colocar formatação com um filter
          // obj.product = obj.product.replace('_', ' ').toUpperCase();
          
          obj.avg_month_qtd_current_year = parseNumberOrZero(obj.avg_month_qtd_current_year, true);
          obj.qtd_current_month = parseNumberOrZero(obj.qtd_current_month, true);
          obj.avg_month_value_current_year = parseNumberOrZero(obj.avg_month_value_current_year);
          obj.value_current_month = parseNumberOrZero(obj.value_current_month);

          obj.comparison_qtd = obj.budget_amount ? obj.qtd_current_month / obj.budget_amount.value : null;

          obj.comparison_value = obj.budget_value ? obj.value_current_month / obj.budget_value.value : null;

          obj.comparison_qtd = obj.comparison_qtd == 0  || Number.isNaN(obj.comparison_qtd) ? -0.0001 : obj.comparison_qtd;
          obj.comparison_value = obj.comparison_value == 0 || Number.isNaN(obj.comparison_value) ? -0.0001 : obj.comparison_value;
            
          obj.comparison_qtd = obj.qtd_current_month == 0 && obj.avg_month_qtd_current_year != 0 ? -1 : obj.comparison_qtd;
          obj.comparison_value = obj.value_current_month == 0 && obj.avg_month_value_current_year != 0 ? -1 : obj.comparison_value;

          obj.comparison_qtd = obj.qtd_current_month != 0 && obj.avg_month_qtd_current_year == 0 ? 1 : obj.comparison_qtd;
          obj.comparison_value = obj.value_current_month != 0 && obj.avg_month_value_current_year == 0 ? 1 : obj.comparison_value;
          return obj;
        });
      }
      
      self.search = function () {
        self.loading = true;

        self.brands = [];
        ProductService.searchProductBillings(self.dateFilter, self.sellerCodes, self.dateType).then(function (response) {
          searchBudget().then (function (respBdg) {
            self.brands = normalizeBillings(response.filter(function (r) { return r.product == ''; }), respBdg.objects);
            
            angular.forEach(self.brands, function (brand) {
              brand.products = normalizeBillings(response.filter(function (r) { 
                return r.product_group == brand.product_group && r.product != '' && r.wallet == brand.wallet;
              }));
            });
          });
          self.loading = false;
        });

        searchActive();

        self.productsBillingYear = [];

        ProductService.searchProductBillingsAllYear(self.dateFilter, self.sellerCodes, self.dateType).then(function (response) {
          self.productsBillingYear = response;
          self.loadingYear = false;
        });
      };

      function searchBudget() {
        var params = {
          q: {
            filters: [
              {name: 'month', op: 'eq', val: self.dateFilter.getMonth() > 10 ? 1 : self.dateFilter.getMonth() + 1},
              {name: 'year', op: 'eq', val: self.dateFilter.getFullYear()},
              {name: 'type_ref', op: 'in', val: ['PRODUCT_AMOUNT', 'PRODUCT_VALUE']},
            ]
          },  
          results_per_page: 999
        };
        return BudgetService.search(params);
      }

      self.filterWallet = function (tab) {
        return function (item) {
          var wallet = $scope.tabSeller[tab];
          return item.wallet == wallet;
        };
      };

      self.search();
    }
  ])

  .controller('EditCustActivesBudgetController', ['BudgetService', '$mdDialog', 'NotificationService', 
    'wallet', 'dateToSave', 'budget',
    function (BudgetService, $mdDialog, NotificationService, wallet, dateToSave, budget) {
      var self = this;

      self.title = budget ? 'Editar meta' : 'Inserir meta';
      self.dateToSave = dateToSave;
      self.wallet = wallet;

      console.log(self.dateToSave);

      if (budget){
        self.budget = angular.copy(budget);
      } else{
        self.budget = {
          ref: self.wallet,
          value: null,
          month: self.dateToSave.getMonth() > 10 ? 1 : self.dateToSave.getMonth() + 1,
          year: self.dateToSave.getFullYear(),
          type_ref: 'CUSTOMERS_ACTIVES'
        };
      }
      
      self.save = save;
      self.close = close;

      function save() {
        BudgetService.save(self.budget).then(function (response){
          NotificationService.success('Salvo com sucesso!');
          $mdDialog.hide(response);
        }, function (error) {
          NotificationService.error('Ocorreu um erro ao salvar o budget!');
        });
      }

      function close() {
        $mdDialog.cancel();
      }
    }
  ])

  .controller('BrandDetailDetailDialogController', ['$mdDialog', '$scope', 'brand', 'abstract_customers',
    'wallet', 'minimumRate',
    function ($mdDialog, $scope, brand, abstract_customers, wallet, minimumRate) {
      var self = this;

      self.brand = brand;
      self.abstract_customers = abstract_customers;
      self.wallet = wallet;
      self.minimumRate = minimumRate;
      self.orderTableProduct = 'product';
      self.orderTableCustomers = 'comparison_value';

      $scope.pagination = {page: 0, pageSize: 10};

      self.confirm = function () {
        $mdDialog.hide();
      };

      self.cancel = function () {
        $mdDialog.cancel();
      };
    }
  ])


  .controller('editBudgetProductController', ['BudgetService', '$mdDialog', 'NotificationService', 
    'product', 'ref', 'dateToSave', 'budget_amount', 'budget_value', '$q',
    function (BudgetService, $mdDialog, NotificationService, product, ref,
      dateToSave, budget_amount, budget_value, $q) {
      var self = this;

      self.title = budget_amount && budget_value ? 'Editar budget' : 'Inserir budget';
      self.dateToSave = dateToSave;
      self.product = product;
      self.ref = ref;

      self.budget = {
        month: self.dateToSave.getMonth() > 10 ? 1 : self.dateToSave.getMonth() + 1,
        year: self.dateToSave.getFullYear()
      };
      
      if (budget_amount && budget_value){
        self.budget_amount = angular.copy(budget_amount);
        self.budget_value = angular.copy(budget_value);
      } else{
        self.budget_amount = {
          ref: self.ref,
          value: null,
          month: self.dateToSave.getMonth() > 10 ? 1 : self.dateToSave.getMonth() + 1,
          year: self.dateToSave.getFullYear(),
          type_ref: 'PRODUCT_AMOUNT'
        };
        self.budget_value = {
          ref: self.ref,
          value: null,
          month: self.dateToSave.getMonth() > 10 ? 1 : self.dateToSave.getMonth() + 1,
          year: self.dateToSave.getFullYear(),
          type_ref: 'PRODUCT_VALUE'
        };
      }
      
      self.save = save;
      self.close = close;

      function save() {
        var promises = [BudgetService.save(self.budget_amount), BudgetService.save(self.budget_value)];

        $q.all(promises).then(function () {
          NotificationService.success('Salvo com sucesso!');
          $mdDialog.hide();
        }, function (error) {
          NotificationService.error('Ocorreu um erro ao salvar o budget!');
        });
      }

      function close() {
        $mdDialog.cancel();
      }
    }
  ])

  .controller('BrandDetailYearDetailDialogController', ['$mdDialog', 'date', 'lineSelected',  'periods',
    function ($mdDialog, date, lineSelected, periods) {
      var self = this;

      self.orderTableProduct = 'product';

      self.date = date;
      self.lineSelected = lineSelected;
      self.periodSelected = null;
      self.periods = normalizeMonths(periods);
      self.selectedTab = 0;

      function normalizeMonths(periods) {
        var months = periods.filter(function (period) {return period.product_name == '';});
        angular.forEach(months, function (month) {
          month.products = periods.filter(function (period) {
            return period.month == month.month && period.year == month.year && period.product_name != '';
          });
        });
        return months;
      }

      self.selectPeriod = function (period) {
        self.periodSelected = period;
        self.selectedTab = 1;
      };

      self.confirm = function () {
        $mdDialog.hide();
      };

      self.cancel = function () {
        $mdDialog.cancel();
      };
    }
])
  

;
