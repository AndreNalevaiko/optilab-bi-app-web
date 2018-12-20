angular.module('gorillasauth.protected.rate-service')

  .controller('RateServiceController', ['RateServiceService', 'NotificationService', '$mdDialog',
    '$mdMedia', '$scope',
    function (RateServiceService, NotificationService, $mdDialog, $mdMedia, $scope) {
      var self = this;

      self.loading = false;
      self.tabToBusinessCode = {
        0: 1,
        1: 6,
        2: 2,
        3: null
      };
      self.selectedTab = 0;
      self.businessCodeFilter = self.tabToBusinessCode[self.selectedTab];

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
      
      self.agreedDate = RateServiceService.getAgreedDate(self.businessCodeFilter);
      self.paramsDc = RateServiceService.getParamsDc(self.businessCodeFilter);

      self.openAgreedDates = function (ev) {
        $mdDialog.show({
          controller: 'editAgreedDatesController as ctrl',
          fullscreen: $mdMedia('xs'),
          locals: {
            business_code: self.businessCodeFilter,
            agreedDate: RateServiceService.getAgreedDate(self.businessCodeFilter)
          },
          parent: angular.element(document.body),
          templateUrl: 'protected/rate_service/dialog/editDCGroup.tpl.html',
          targetEvent: ev,
          clickOutsideToClose: true
        }).then(function (result) {
          console.log('dislog Confirmed');
          NotificationService.success('Salvo com sucesso!');
          self.agreedDate = RateServiceService.getAgreedDate(self.businessCodeFilter);
        }, function (){
          console.log('Canceled Operation');
        });
      };

      self.saveParamsDc = function () {
        RateServiceService.setParamsDc(self.businessCodeFilter, self.paramsDc);
        NotificationService.success('Salvo com sucesso!');
      };
      
      self.search = function () {
        self.loading = true;
        RateServiceService.get(createSearchParams()).then(function (response) {
          self.rateServiceResult = response;
          self.consolidateResponse();
          self.loading = false;
        }, function (error) {
          self.loading = false;
        });
      };

      self.exportTableToCSV = exportTableToCSV;

      function createSearchParams() {
        var params = {
          data_ini: self.startDate.toLocaleDateString(),
          data_final: self.endDate.toLocaleDateString()
        };
        return params;
      }

      self.consolidateResponse = function () {
        self.rangeDc = self.range(self.paramsDc.qtdDcLess, self.paramsDc.qtdDcMore, 1);
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

        if (!self.rateServiceResult.length) {
          self.dc = null;
          return;
        }

        angular.forEach(self.rateServiceResult, function (pedid) {
          if (self.selectedTab == 3 || pedid.business == self.businessCodeFilter) {
            
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

            if (pedidDc > 0 && new Date(pedid.start_date).getHours() > self.paramsDc.cuttingTime) {
              pedidDc = pedidDc - 1;
            }


            if (pedidDc <= self.paramsDc.maxDaysConsidered) {
              // So considera os pedidos com dias até a data maxima
              if (pedidDc > self.paramsDc.qtdDcMore) {
                // Se é maior que o DC+ adiciona a metrica DC++
                consolided[type].dcMore = consolided[type].dcMore + 1;
                consolided[type].length++;
              } else if (pedidDc < self.paramsDc.qtdDcLess) {
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

      function downloadCSV(csv, filename) {
        var csvFile;
        var downloadLink;
    
        // CSV file
        csvFile = new Blob([csv], {type: "text/csv"});
    
        // Download link
        downloadLink = document.createElement("a");
    
        // File name
        downloadLink.download = filename;
    
        // Create a link to the file
        downloadLink.href = window.URL.createObjectURL(csvFile);
    
        // Hide download link
        downloadLink.style.display = "none";
    
        // Add the link to DOM
        document.body.appendChild(downloadLink);
    
        // Click download link
        downloadLink.click();
      }

      function exportTableToCSV() {
        var filename = 'TaxaServico Emp ' + (self.businessCodeFilter || 'Global') + '.csv';
        var csv = [];
        var columns = document.getElementById("mainTable").children;
        var isColumnDc = false;
        
        angular.forEach(columns, function (column) {
          if (column.id == 'rangeDc') {
            var rangeColumns = column.children[0].children;
            for (i=0; i < rangeColumns.length; i++) {
              if (rangeColumns[i].textContent == 'DC') {
                isColumnDc = true;
              }
              csv[i] = csv[i] ? csv[i] + ';' + rangeColumns[i].textContent : rangeColumns[i].textContent;

              if (isColumnDc && (i + 1) == rangeColumns.length) {
                var columnTotalDc = column.children[1].children;
                for (i=0; i < columnTotalDc.length; i++) {
                  csv[i] = csv[i] ? csv[i] + ';' + columnTotalDc[i].textContent : columnTotalDc[i].textContent;
                }
                isColumnDc = false;
              }
            }
          } else {
            for (i=0; i < column.children.length; i++) {
              csv[i] = csv[i] ? csv[i] + ';' + column.children[i].textContent : column.children[i].textContent;
            }
          }
        });
    
        // Download CSV file
        downloadCSV(csv.join("\n"), filename);
      }

      
      self.search();

      $scope.$watch(function () {
        return self.selectedTab;
      }, function (newVal, oldVal) {
        if (Number(newVal) !== Number(oldVal)) {
          self.businessCodeFilter = self.tabToBusinessCode[newVal];
          
          self.agreedDate = RateServiceService.getAgreedDate(self.businessCodeFilter);
          self.paramsDc = RateServiceService.getParamsDc(self.businessCodeFilter);
          
          if (self.rateServiceResult) {
            self.consolidateResponse();
          }
        }
      });
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
