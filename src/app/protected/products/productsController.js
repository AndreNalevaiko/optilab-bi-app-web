angular.module('gorillasauth.protected.products')

  .controller('productsController', ['configuration', 'DateFilterService', '$scope',
  'ProductService', '$mdDialog', 'BudgetService', '$mdMedia',
    function (configuration, DateFilterService, $scope, ProductService, $mdDialog, BudgetService, $mdMedia) {
      var self = this;

      // self.sellerCodes = Object.keys(configuration.wallets);
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

      // self.sellerCodes = ['319','320','318','322','321','323'];

      // $scope.selectedTab = 0;
      // $scope.tabSeller = {
      //   0: '319',
      //   1: '320',
      //   2: '318',
      //   3: '322',
      //   4: '321',
      //   5: '323',
      //   6: 'Global',
      //   7: 'Others'
      // };

      self.dateNow = new Date();
      self.loading = false;
      self.orderTable = 'product';
      self.generating = false;

      self.filterOptions = DateFilterService.filterOptions();
      self.dateFilter = DateFilterService.getDateNow();
      self.minimumRate = self.dateFilter.getDate() / 30;
      self.maxDate = self.dateFilter;

      $scope.filterProducts = function (param) {
        var tab = param;
        return function (item) {
          return item.wallet == $scope.tabSeller[tab];
        };
      };

      self.openBrandDetail = function (ev, brand) {
        $mdDialog.show({
          controller: 'BrandDetailDetailDialogController as ctrl',
          fullscreen: true,
          locals: {
            brand: brand
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

        ProductService.searchProductBillings(self.dateFilter, self.sellerCodes).then(function (response) {
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

        ProductService.searchProductBillingsAllYear(self.dateFilter, self.sellerCodes).then(function (response) {
          self.productsBillingYear = response;
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

  .controller('BrandDetailDetailDialogController', ['$mdDialog', 'brand',
    function ($mdDialog, brand) {
      var self = this;

      self.brand = brand;
      self.orderTableProduct = 'product';

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
  

;
