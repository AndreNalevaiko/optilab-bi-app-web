angular.module('gorillasauth.protected.products')

  .controller('productsController', ['ReportProductsService', 'DateFilterService', 'FileSaver', '$scope',
    function (ReportProductsService, DateFilterService, FileSaver, $scope) {
      var self = this;

      $scope.selectedTab = 0;
      $scope.tabSeller = {
        0: '319',
        1: '320',
        2: '318',
        3: '322',
        4: '321',
        5: '323',
        6: '0'
      };

      self.dateNow = new Date();
      self.loading = false;
      self.orderTable = 'brand';
      self.generating = false;

      self.filterOptions = DateFilterService.filterOptions();
      self.dateFilter = DateFilterService.getDateNow();
      // self.dateFilter = new Date();
      // self.dateFilter.setDate(self.dateFilter.getDate()-1);
      
      self.search = function () {
        self.loading = true;

        var searchParams = createSearchParams();

        ReportProductsService.search(searchParams).then(function (response) {
          if (response.objects.length){
            self.brands = consolidateReport(response.objects);
            self.loading = false;          
          }else{
            self.loading = false;          
            self.generating = true;

            ReportProductsService.generate(self.dateFilter).then(function (response){
              ReportProductsService.search(searchParams).then(function (response){
                self.brands = consolidateReport(response.objects);
                self.generating = false;
              });
            });
          }
        });
      };

      self.export = function (seller) {
        ReportProductsService.export(self.dateFilter, seller).then(function (response){
          var blob = new Blob([response.data], {type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});       
          FileSaver.saveAs(blob, 'Relatório de produtos.xlsx');
        }, function (error){
          console.log('Erro ao gerar xlsx', error);
        });
      };

      function createSearchParams() {
        var params = {
          q: {
            filters: [
              {
                name: 'date',
                op: 'eq',
                val: self.dateFilter
              },
            ],
            order_by: [
              {
                field: self.orderTable.replace('-', ''),
                direction: self.orderTable.indexOf('-') < 0 ? 'desc' : 'asc'
              }
            ]
          }
        };
        return params;
      }

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
