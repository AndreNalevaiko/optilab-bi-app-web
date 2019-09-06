angular.module('gorillasauth.protected.products')

  .controller('productsController', ['configuration', 'DateFilterService', '$scope',
  'ProductService', '$mdDialog',
    function (configuration, DateFilterService, $scope, ProductService, $mdDialog) {
      var self = this;

      // self.sellerCodes = Object.keys(configuration.wallets);
      self.sellerCodes = [];
      angular.forEach(configuration.wallets, function (w) {
        var key = Object.keys(w)[0];
        self.sellerCodes.push(key);
      });
      console.log(self.sellerCodes);

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

      function normalizeBillings(billings) {
        return billings.map(function(obj) {
          obj.product = obj.product.replace('_', ' ').toUpperCase();
          
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
      }
      
      self.search = function () {
        self.loading = true;

        ProductService.searchProductBillings(self.dateFilter, self.sellerCodes).then(function (response) {
          self.brands = normalizeBillings(response.filter(function (r) { return r.product == ''; }));
          angular.forEach(self.brands, function (brand) {
            brand.products = normalizeBillings(response.filter(function (r) { 
              return r.product_group == brand.product_group && r.product != '' && r.wallet == brand.wallet;
            }));
          });
          self.loading = false;
        });

        ProductService.searchProductBillingsAllYear(self.dateFilter, self.sellerCodes).then(function (response) {
          self.productsBillingYear = response;
        });
      };

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

;
