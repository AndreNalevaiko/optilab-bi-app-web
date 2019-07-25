angular.module('gorillasauth.protected.products')

  .controller('productsController', ['ReportProductsService', 'DateFilterService', 'FileSaver', '$scope',
  'ProductService',
    function (ReportProductsService, DateFilterService, FileSaver, $scope, ProductService) {
      var self = this;

      self.sellerCodes = ['319','320','318','322','321','323'];

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
          if ($scope.tabSeller[tab] == 'Global') {
            return true;
          } else if ($scope.tabSeller[tab] == 'Others') {
            return self.sellerCodes.indexOf(item.wallet) < 0;
          } else {
            return item.wallet == $scope.tabSeller[tab];
          }
        };
      };

      function normalizeBillings(billings) {
        return billings.map(function(obj) {
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

        // ReportProductsService.search(searchParams).then(function (response) {
        //   if (response.objects.length){
        //     self.brands = consolidateReport(response.objects);
        //     self.loading = false;          
        //   }else{
        //     self.loading = false;          
        //     self.generating = true;

        //     ReportProductsService.generate(self.dateFilter).then(function (response){
        //       ReportProductsService.search(searchParams).then(function (response){
        //         self.brands = consolidateReport(response.objects);
        //         self.generating = false;
        //       });
        //     });
        //   }
        // });

        ProductService.searchProductBillings(self.dateFilter).then(function (response) {
          self.products = normalizeBillings(response.filter(function (r) { return r.product != ''; }));
          self.brands = normalizeBillings(response.filter(function (r) { return r.product == ''; }));
          self.loading = false;
        });
      };

      // self.export = function (seller) {
      //   ReportProductsService.export(self.dateFilter, seller).then(function (response){
      //     var blob = new Blob([response.data], {type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});       
      //     FileSaver.saveAs(blob, 'Relatório de produtos.xlsx');
      //   }, function (error){
      //     console.log('Erro ao gerar xlsx', error);
      //   });
      // };

      // function createSearchParams() {
      //   var params = {
      //     q: {
      //       filters: [
      //         {
      //           name: 'date',
      //           op: 'eq',
      //           val: self.dateFilter
      //         },
      //       ],
      //       order_by: [
      //         {
      //           field: self.orderTable.replace('-', ''),
      //           direction: self.orderTable.indexOf('-') < 0 ? 'desc' : 'asc'
      //         }
      //       ]
      //     }
      //   };
      //   return params;
      // }

      function consolidateReport(objects) {
        angular.forEach(objects, function (product) {
          product.var_qtd = (product.qtd_current_year / product.qtd_latest_year) - 1;
          product.var_value = (product.value_current_year / product.value_latest_year) - 1;
        });
        return objects;
      }

      self.search();
    }
  ])

;
