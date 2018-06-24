angular.module('gorillasauth.protected.products')

  .controller('productsController', ['ReportProductsService', 'DateFilterService',
    function (ReportProductsService, DateFilterService) {
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

      self.export = function () {
        var reader = new FileReader();

        ReportProductsService.export(self.dateFilter).then(function (response){
          console.log('ERROR', response);   
          var blob = new Blob([response.data], {type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});       
          // saveAs(blob, 'TESTE.xlsx')
          reader.readAsDataURL(blob);
        }, function (error){
          console.log('ERROR', error);
        });

        reader.onload = function(e) { 
          window.open(decodeURIComponent(reader.result), '_self', '', false); 
        };
      };

    }
  ])

;
