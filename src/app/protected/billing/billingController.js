angular.module('gorillasauth.protected.billing')

  .controller('billingController', ['$scope', 'BillingService', 'BudgetService', '$mdDialog', 
    'NotificationService', '$mdMedia', 'DateFilterService', 'KpiService',
    function ($scope, BillingService, BudgetService, $mdDialog, NotificationService, $mdMedia, 
      DateFilterService, KpiService) {
      var self = this;

      // self.dateFilter = DateFilterService.filterDateNow();
      self.dateFilter = DateFilterService.getDateNow();
      self.maxDate = self.dateFilter;

      self.walletCodeFilter = 319;
      self.selectedTab = 0;

      self.walletsAvailable = [319,320,318,322,321,323];

      self.tabToWallet = {
        0: 319,
        1: 320,
        2: 318,
        3: 322,
        4: 321,
        5: 323,
        6: 'Global',
        7: 'Others'
      };

      self.billing = null;
      self.loadingBilling = false;

      self.insertBudget = function (ev, wallet, budget) {
        $mdDialog.show({
          controller: 'editBudgetController as ctrl',
          fullscreen: $mdMedia('xs'),
          locals: {
            wallet: wallet,
            dateToSave: self.dateFilter,
            budget: budget
          },
          parent: angular.element(document.body),
          templateUrl: 'protected/billing/edit-budget-dialog.tpl.html',
          targetEvent: ev,
          clickOutsideToClose: true
        }).then(function (result) {
          searchBudget().then(function (response){
            self.budget = response.objects;
            if (self.budget.length){
              setEmpBudget();
            }
          }, function (error){
            NotificationService.error('Ocorreu um erro ao buscar os budgets');
          });
        }, function (){
          console.log('Canceled Operation');
        });
      };

      // self.editKpiBudget = function (ev, kpi) {
      //   $mdDialog.show({
      //     controller: 'editKpiBudgetController as ctrl',
      //     fullscreen: $mdMedia('xs'),
      //     locals: {
      //       kpi: kpi,
      //     },
      //     parent: angular.element(document.body),
      //     templateUrl: 'protected/billing/edit-kpi-budget-dialog.tpl.html',
      //     targetEvent: ev,
      //     clickOutsideToClose: true
      //   }).then(function (result) {
      //     kpi.budget_billing = result.budget_billing;
      //     kpi.budget_order_quantity = result.budget_order_quantity;
      //     kpi.budget_quantity_pieces = result.budget_quantity_pieces;
      //     kpi.budget_tm = result.budget_tm;
      //   }, function (){
      //     console.log('Canceled Operation');
      //   });
      // };

      self.searchBilling = function () {
        self.loadingBilling = true;
        BillingService.get(self.dateFilter).then(function (response) {
          self.billing = response;   
          
          searchBudget().then(function (response){
              self.budget = response.objects;

              if (self.budget.length){
                setEmpBudget();
              }

              self.loadingBilling = false; 

            }, function (error){
              NotificationService.error('Ocorreu um erro ao buscar os budgets');
          });
        }, function (error){
          NotificationService.error('Ocorreu um erro ao buscar o faturamento');
        }); 
      };

      // self.searchKpi = function () {
      //   var kpiSearchParams = createFilterSearchKpi();
      //   self.loading.kpi = true;
        
      //   KpiService.search(kpiSearchParams).then(function (response) {
      //     if(response.objects.length) {
      //       self.kpis = response.objects;
      //       self.loading.kpi = false;
      //     } else if (!self.generateTentative){
      //       generateKpi();
      //     }
      //   }, function (error) {
      //     NotificationService.error('Ocorreu um erro ao buscar o KPI');
      //   });
      // };

      self.checkLengthResult = function (type) {
        if (type == 'billing') {
          return self.billing.filter(function (bil) {
            if (self.walletCodeFilter == 'Global') {
              return bil.wallet == 0;
            } else if (self.walletCodeFilter == 'Others') {
              return self.walletsAvailable.indexOf(bil.wallet) < 0;
            } else {
              return bil.wallet == self.walletCodeFilter;
            }
          }).length > 0;
        } 
        // else if (type == 'kpi') {
        //   return self.kpis.filter(function (kpi) {
        //     if (self.walletCodeFilter = 'Global') {
        //       return bil.wallet == null;
        //     } else if (self.walletCodeFilter = 'Others') {
        //       return self.walletsAvailable.indexOf(bil.wallet) > -1;
        //     } else {
        //       return kpi.business == self.walletCodeFilter;
        //     }
        //   }).length > 0;
        // }
      };

      self.filterBilling = function () {
        return function (item) {
          if (self.walletCodeFilter == 'Global') {
            return item.wallet == 0;
          } else if (self.walletCodeFilter == 'Others') {
            return self.walletsAvailable.indexOf(item.wallet) < 0;
          } else {
            return item.wallet == self.walletCodeFilter;
          }
        };
      };

      self.getParticipationForGlobal = function (wallet) {
        var billing = null;
        if (wallet) {
          billing = self.billing.filter(function (bil) { return bil.wallet == wallet;})[0];
        } else {
          billing = self.billing.filter(function (bil) { return self.walletsAvailable.indexOf(bil.wallet) < 0;})[0];
        }
        var billingGlobal = self.billing.filter(function (bil) { return bil.wallet == 0;})[0];
        if (!billing) {
          return 0;
        }
        return billing.value / billingGlobal.value;
      };
      
      // function generateKpi() {
      //   self.generateTentative = true;
      //   self.loading.generating_kpi = true;
      //   KpiService.generate(self.dateFilter).then(function (response) {
      //     self.generateTentative = false;
      //     self.loading.generating_kpi = false;
      //     self.searchKpi();
      //   }, function (error) {
      //     NotificationService.error('Ocorreu um erro ao gerar o KPI');
      //   });
      // }

      // function createFilterSearchKpi() {
      //   return {
      //     q: {
      //       filters: [
      //         {name: 'month', op: 'eq', val: self.dateFilter.getMonth() > 10 ? 1 : self.dateFilter.getMonth() + 1},
      //         {name: 'year', op: 'eq', val: self.dateFilter.getFullYear()},
      //       ]
      //     }
      //   };
      // }

      function setEmpBudget (){
        angular.forEach(self.billing, function (bil){
          angular.forEach(self.budget, function (item){
            if (bil.wallet == item.business_code){
              bil.budget = item;
            }
          });
        });
      }

      function searchBudget() {
        var params = {
          q: {
            filters: [
              {name: 'month', op: 'eq', val: self.dateFilter.getMonth() > 10 ? 1 : self.dateFilter.getMonth() + 1},
              {name: 'year', op: 'eq', val: self.dateFilter.getFullYear()},
            ]
          }
        };
        return BudgetService.search(params);
      }

      $scope.$watch(function () {
        return self.selectedTab;
      }, function (newVal, oldVal) {
        if (Number(newVal) !== Number(oldVal)) {
          self.walletCodeFilter = self.tabToWallet[newVal];
        }
      });

      self.search = function () {
        self.searchBilling();
        // self.searchKpi();
      };

      self.search();

      $scope.amChartOptions = {
        data: [{
            year: 2005,
            income: 23.5,
            expenses: 18.1
        }, {
            year: 2006,
            income: 26.2,
            expenses: 22.8
        }, {
            year: 2007,
            income: 30.1,
            expenses: 23.9
        }, {
            year: 2008,
            income: 29.5,
            expenses: 25.1
        }, {
            year: 2009,
            income: 24.6,
            expenses: 25
        }],
        type: "serial",
        
        categoryField: "year",
        rotate: true,
        pathToImages: 'https://cdnjs.cloudflare.com/ajax/libs/amcharts/3.13.0/images/',
        legend: {
            enabled: true
        },
        chartScrollbar: {
            enabled: true,
        },
        categoryAxis: {
            gridPosition: "start",
            parseDates: false
        },
        valueAxes: [{
            position: "top",
            title: "Million USD"
        }],
        graphs: [{
            type: "column",
            title: "Income",
            valueField: "income",
            fillAlphas: 1,
        }]
    };

    }
  ])

  .controller('editBudgetController', ['BudgetService', '$mdDialog', 'NotificationService', 
    'wallet', 'dateToSave', 'budget',
    function (BudgetService, $mdDialog, NotificationService, wallet, 
      dateToSave, budget) {
      var self = this;

      self.title = budget ? 'Editar budget' : 'Inserir budget';
      self.dateToSave = dateToSave;
      self.wallet = wallet;

      if (budget){
        self.budget = angular.copy(budget);
      }else{
        self.budget = {
          business_code: self.wallet,
          value: null,
          month: self.dateToSave.getMonth() > 10 ? 1 : self.dateToSave.getMonth() + 1,
          year: self.dateToSave.getFullYear()
        };
      }
      
      self.save = save;
      self.close = close;

      function save() {
        BudgetService.save(self.budget).then(function (response){
          NotificationService.success('Salvo com sucesso!');
          $mdDialog.hide(response);
        }, function (error) {
          NotificationService.error('Ocorreu um erro ao salvar o budget!');
        });
      }

      function close() {
        $mdDialog.cancel();
      }
    }
  ])

  // .controller('editKpiBudgetController', ['KpiService', '$mdDialog', 'NotificationService', 
  //   'kpi',
  //   function (KpiService, $mdDialog, NotificationService, kpi) {
  //     var self = this;

  //     self.kpi = angular.copy(kpi);
  //     self.title = kpi ? 'Editar budget' : 'Inserir budget';

  //     self.save = save;
  //     self.close = close;

  //     function save() {
  //       var kpiToSave = {
  //         id: self.kpi.id,
  //         budget_billing: self.kpi.budget_billing,
  //         budget_order_quantity: self.kpi.budget_order_quantity,
  //         budget_quantity_pieces: self.kpi.budget_quantity_pieces,
  //         budget_tm: self.kpi.budget_tm,
  //       };

  //       KpiService.save(kpiToSave).then(function (response){
  //         $mdDialog.hide(response);
  //       }, function (error) {
  //         NotificationService.error('Ocorreu um erro ao salvar o budget!');
  //       });
  //     }

  //     function close() {
  //       $mdDialog.cancel();
  //     }
  //   }
  // ])

;
