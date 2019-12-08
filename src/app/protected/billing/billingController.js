angular.module('gorillasauth.protected.billing')

  .controller('billingController', ['$scope', 'BillingService', 'BudgetService', '$mdDialog', 
    'NotificationService', '$mdMedia', 'DateFilterService', 'configuration',
    function ($scope, BillingService, BudgetService, $mdDialog, NotificationService, $mdMedia, 
      DateFilterService, configuration) {
      var self = this;

      self.dateFilter = DateFilterService.getDateNow();
      self.maxDate = self.dateFilter;
      
      self.walletsAvailable = [];
      angular.forEach(configuration.wallets, function (w) {
        var key = Object.keys(w)[0];
        self.walletsAvailable.push(key);
      });

      self.tabToWallet = {};
      self.walletsAvailable.forEach(function (value, i) {
        self.tabToWallet[i] = value;
      });
      self.tabToWallet[6] = 'Global';
      self.tabToWallet[7] = 'Others';


      self.walletCodeFilter = self.tabToWallet[0];
      self.selectedTab = 0;

      self.billing = null;
      self.billAllYear = null;
      self.billingYearWallet = [];

      self.ytd = null;
      self.totals = null;

      self.loadingBilling = false;
      self.loadingTotalsYTD = false;

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

        BillingService.getAllYear(self.dateFilter).then(function (response) {
          self.billAllYear = response;
          self.billingYearWallet = self.billAllYear.filter(function (item) {
            return item.wallet == self.tabToWallet[self.selectedTab];
          });
        }, function (error) {
          NotificationService.error('Ocorreu um erro ao buscar o faturamento do ano');
        });
      };


      self.searchTotalsAndYTD = function () {
        self.loadingTotalsYTD = true;

        BillingService.getTotals(self.dateFilter).then(function (response) {
          self.totals = sintetizeYTDTotals(response);

          BillingService.getYTD(self.dateFilter).then(function (response) {
            self.ytd = sintetizeYTDTotals(response);
            self.loadingTotalsYTD = false;
          }, function (error) {
            NotificationService.error('Ocorreu um erro ao buscar os dados do YTD');
          });

        }, function (error) {
          NotificationService.error('Ocorreu um erro ao buscar os totais');
        });

      };

      self.checkLengthResult = function (type) {
        return self.billing.filter(function (bil) {
          if (self.walletCodeFilter == 'Global') {
            return bil.wallet == 0;
          } else if (self.walletCodeFilter == 'Others') {
            return self.walletsAvailable.indexOf(bil.wallet) < 0;
          } else {
            return bil.wallet == self.walletCodeFilter;
          }
        }).length > 0;
      };

      self.filterBilling = function () {
        return function (item) {
          if (self.walletCodeFilter == 'Global') {
            return item.wallet === "0";
          } else if (self.walletCodeFilter == 'Others') {
            return item.wallet === '';
            // return self.walletsAvailable.indexOf(item.wallet) < 0;
          } else {
            return item.wallet == self.walletCodeFilter;
          }
        };
      };

      self.getParticipationForGlobal = function (wallet) {
        var billing = null;
        if (wallet == 'Others') {
          billing = self.billing.filter(function (bil) { return self.walletsAvailable.indexOf(bil.wallet) < 0;})[0];
        } else if (wallet) {
          billing = self.billing.filter(function (bil) { return bil.wallet == wallet;})[0];
        }

        var billingGlobal = self.billing.filter(function (bil) { return bil.wallet === '0';})[0];
        if (!billing) {
          return 0;
        }
        return billing.value / billingGlobal.value;
      };

      function setEmpBudget (){
        angular.forEach(self.billing, function (bil){
          angular.forEach(self.budget, function (item){
            if (bil.wallet == item.ref){
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
              {name: 'type_ref', op: 'eq', val: 'BILLING'},
            ]
          },  
          results_per_page: 999
        };
        return BudgetService.search(params);
      }

      $scope.$watch(function () {
        return self.selectedTab;
      }, function (newVal, oldVal) {
        if (Number(newVal) !== Number(oldVal)) {
          self.walletCodeFilter = self.tabToWallet[newVal];
          self.billingYearWallet = self.billAllYear.filter(function (item) {
            if (self.walletCodeFilter == 'Global') {
              return item.wallet === "0";
            } else if (self.walletCodeFilter == 'Others') {
              return item.wallet === '';
            } else {
              return item.wallet == self.walletCodeFilter;
            }
          });
        }
      });

      function sintetizeYTDTotals(data) {
        var result = {};
        var walletsAdded = [];
        var currentYear = self.dateFilter.getFullYear();

        angular.forEach(data, function (i) {
          var wallet = i.wallet != '' && i.wallet != '0' ? i.wallet : i.wallet == '0' ? 'Global' : 'Others';
          if (walletsAdded.indexOf(wallet) < 0) {
            result[wallet] = {};
            walletsAdded.push(wallet);
          }

          var year = i.year == currentYear ? 'current' : 'last';
          result[wallet][year] = i.value;
        });

        return result;
      }

      self.search = function () {
        self.searchBilling();
        self.searchTotalsAndYTD();
      };

      self.search();

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
          ref: self.wallet,
          value: null,
          month: self.dateToSave.getMonth() > 10 ? 1 : self.dateToSave.getMonth() + 1,
          year: self.dateToSave.getFullYear(),
          type_ref: 'BILLING'
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
;