angular.module('gorillasauth.protected.products')

  .controller('productsController', ['ReportProductsService', 'DateFilterService', 'FileSaver',
    function (ReportProductsService, DateFilterService, FileSaver) {
      var self = this;

      self.dateNow = new Date();

      self.orderTable = 'brand';

      self.filterOptions = DateFilterService.filterOptions();
      // self.dateFilter = DateFilterService.filterDateNow();
      self.dateFilter = {
        day: self.dateNow.getDay(),
        //month: self.dateNow.getMonth(),
        month: 2,
        year: self.dateNow.getFullYear(),
      };
      
      self.loading = false;

      self.search = function () {
        self.loading = true;

        var searchParams = createSearchParams();

        ReportProductsService.search(searchParams).then(function (response) {
          self.brands = response.objects;
          self.loading = false;          
        });
      };

      function createSearchParams() {
        var params = {
          q: {
            filters: [
              {
                name: 'current_year',
                op: 'eq',
                val: self.dateFilter.year
              },
              {
                name: 'month',
                op: 'eq',
                val: self.dateFilter.month
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

      self.search();

      self.export = function (business_code) {
        ReportProductsService.export(self.dateFilter, business_code).then(function (response){
          var blob = new Blob([response.data], {type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});       
          FileSaver.saveAs(blob, 'TESTE.xlsx');
        }, function (error){
          console.log('ERROR', error);
        });
      };

    }
  ])

;
