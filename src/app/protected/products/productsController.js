angular.module('gorillasauth.protected.products')

  .controller('productsController', [ 'BillingService', 'ReportProductsService',
    function (BillingService, ReportProductsService) {
      var self = this;

      self.dateNow = new Date();

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
          self.brands = response;
          self.loading = false;          
        });


      };

      function createSearchParams() {
        return {
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
            ]
          }
        };
      }

      self.search();

    }
  ])

;
