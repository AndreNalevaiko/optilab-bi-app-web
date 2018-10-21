angular.module('gorillasauth.protected.rate-service')

  .controller('RateServiceController', ['RateServiceService', 'DateFilterService', 'FileSaver', '$mdDialog',
    '$mdMedia',
    function (RateServiceService, DateFilterService, FileSaver, $mdDialog, $mdMedia) {
      var self = this;

      var range = function(start, end, step) {
        var range = [];
        var typeofStart = typeof start;
        var typeofEnd = typeof end;
    
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
      self.rangeDc = range(self.qtdDcLess, self.qtdDcMore, 1);

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
        RateServiceService.get().then(function (response) {
          console.log(response);
          self.dc = self.consolidateResponse(response);
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

      self.consolidateResponse = function (data) {
        var consolided = {
          finished: {length: 0, dcMore: 0, dcLess: 0},
          simpleSurf: {length: 0, dcMore: 0, dcLess: 0},
          advancedSurf: {length: 0, dcMore: 0, dcLess: 0},
          tratementSurf: {length: 0, dcMore: 0, dcLess: 0},
          digitalSurf: {length: 0, dcMore: 0, dcLess: 0},
          variluxX: {length: 0, dcMore: 0, dcLess: 0}
        };
        var type = null;
        var pedidDc = null;

        angular.forEach(data, function (pedid) {
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
            if (pedidDc > self.qtdDcMore) {
              consolided[type].dcMore = consolided[type].dcMore + 1;
              consolided[type].length++;
            } else if (pedidDc < self.qtdDcLess) {
              consolided[type].dcLess = consolided[type].dcLess + 1;
              consolided[type].length++;
            } else {
              consolided[type][pedidDc] = consolided[type][pedidDc] ? consolided[type][pedidDc] + 1 : 1;
              consolided[type].length++;
            }
          }
        });
        console.log(consolided);
        return consolided;
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
