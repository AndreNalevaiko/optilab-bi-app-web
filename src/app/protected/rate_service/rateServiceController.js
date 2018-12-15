angular.module('gorillasauth.protected.rate-service')

  .controller('RateServiceController', ['RateServiceService', 'DateFilterService', 'FileSaver', '$mdDialog',
    '$mdMedia',
    function (RateServiceService, DateFilterService, FileSaver, $mdDialog, $mdMedia) {
      var self = this;

      self.dateNow = new Date();
      var y = self.dateNow.getFullYear();
      var m = self.dateNow.getMonth();
      self.startDate = new Date(y, m, 1);
      self.endDate = new Date(y, m + 1, 0);

      self.range = function(start, end, step) {
        var range = [];
        var typeofStart = typeof start;
    
        if (end < start) {
            step = -step;
        }
    
        if (typeofStart == "number") {
    
            while (step > 0 ? end >= start : end <= start) {
                range.push(start);
                start += step;
            }
    
        }
    
        return range;
    
      };

      self.selectedTab = 1;
      self.filterOptions = DateFilterService.filterOptions();
      self.dateFilter = DateFilterService.filterDateNow();

      self.agreedDate = RateServiceService.getAgreedDate(self.selectedTab);

      self.qtdDcMore = 5;
      self.qtdDcLess = -2;
      self.maxDaysConsidered = 14;
      self.cuttingTime = 14;

      self.openAgreedDates = function (ev) {
        $mdDialog.show({
          controller: 'editAgreedDatesController as ctrl',
          fullscreen: $mdMedia('xs'),
          locals: {
            business_code: self.selectedTab,
            agreedDate: RateServiceService.getAgreedDate(self.selectedTab)
          },
          parent: angular.element(document.body),
          templateUrl: 'protected/rate_service/dialog/editDCGroup.tpl.html',
          targetEvent: ev,
          clickOutsideToClose: true
        }).then(function (result) {
          console.log('dislog Confirmed');
        }, function (){
          console.log('Canceled Operation');
        });
      };
      
      self.search = function () {
        RateServiceService.get(createSearchParams()).then(function (response) {
          self.rateServiceResult = response;
          self.consolidateResponse();
        });
      };

      function createSearchParams() {
        var params = {
          data_ini: self.startDate,
          data_final: self.endDate
        };
        return params;
      }

      self.consolidateResponse = function () {
        self.rangeDc = self.range(self.qtdDcLess, self.qtdDcMore, 1);
        var consolided = {
          finished: {length: 0, dcMore: 0, dcLess: 0, dcTotal: 0},
          simpleSurf: {length: 0, dcMore: 0, dcLess: 0, dcTotal: 0},
          advancedSurf: {length: 0, dcMore: 0, dcLess: 0, dcTotal: 0},
          tratementSurf: {length: 0, dcMore: 0, dcLess: 0, dcTotal: 0},
          digitalSurf: {length: 0, dcMore: 0, dcLess: 0, dcTotal: 0},
          variluxX: {length: 0, dcMore: 0, dcLess: 0,  dcTotal: 0}
        };
        var type = null;
        var pedidDc = null;

        angular.forEach(self.rateServiceResult, function (pedid) {
          if (self.selectedTab == 'all' || pedid.business == self.selectedTab) {
            
            if (pedid.type == 'ACABADAS') {
              type = 'finished';
            } else if (pedid.type == 'SURFS/COL.OUVERNIZ') {
              type = 'simpleSurf';
            } else if (pedid.type == 'SURFC/COLOUVERNIZ') {
              type = 'advancedSurf';
            } else if (pedid.type == 'SURFC/AR') {
              type = 'tratementSurf';
            } else if (pedid.type == 'DIGITALGERAL') {
              type = 'digitalSurf';
            } else if (pedid.type == 'VARILUXX') {
              type = 'variluxX';
            }

            pedidDc = pedid.working_days - self.agreedDate[type];

            if (pedidDc > 0 && new Date(pedid.start_date).getHours() > self.cuttingTime) {
              pedidDc = pedidDc - 1;
            }


            if (pedidDc <= self.maxDaysConsidered) {
              // So considera os pedidos com dias até a data maxima
              if (pedidDc > self.qtdDcMore) {
                // Se é maior que o DC+ adiciona a metrica DC++
                consolided[type].dcMore = consolided[type].dcMore + 1;
                consolided[type].length++;
              } else if (pedidDc < self.qtdDcLess) {
                // Se é menor que o DC- adiciona a metrica DC--
                consolided[type].dcLess = consolided[type].dcLess + 1;
                consolided[type].length++;
              } else {
                // Senão adiciona ao respectivo dc
                consolided[type][pedidDc] = consolided[type][pedidDc] ? consolided[type][pedidDc] + 1 : 1;
                consolided[type].length++;
              }
                            
              if (pedidDc < 1) {
                // Se a DC for menor que 1 adiciona ao DC TOTAL sem incrementar o length que ja foi incrementado
                consolided[type].dcTotal = consolided[type].dcTotal + 1;
              }
            }

          }
        });

        self.dc = consolided;
      };

      self.search();
    }
  ])

.controller('editAgreedDatesController', ['$mdDialog', 'NotificationService', 'RateServiceService', 'agreedDate',
  'business_code',
  function ($mdDialog, NotificationService, RateServiceService, agreedDate, business_code) {
    var self = this;

    self.agreedDate = agreedDate;
    self.business_code = business_code;

    self.confirm = function () {
      RateServiceService.setAgreedDate(self.business_code, self.agreedDate);
      $mdDialog.hide(self.agreedDate);
    };

    self.cancel = function () {
      $mdDialog.cancel();
    };
  }
])

;
