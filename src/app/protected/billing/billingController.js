angular.module('gorillasauth.protected.billing')

  .controller('billingController', ['$scope', 'BillingService', 'BudgetService', '$mdDialog', 
    'NotificationService', '$mdMedia', 'DateFilterService', 'configuration',
    function ($scope, BillingService, BudgetService, $mdDialog, NotificationService, $mdMedia, 
      DateFilterService, configuration) {
      var self = this;

      // self.dateFilter = DateFilterService.filterDateNow();
      self.dateFilter = DateFilterService.getDateNow();
      self.maxDate = self.dateFilter;
      
      self.walletsAvailable = Object.keys(configuration.wallets);

      self.tabToWallet = {};
      self.walletsAvailable.forEach(function (value, i) {
        self.tabToWallet[i] = value;
      });
      self.tabToWallet[6] = 'Global';
      self.tabToWallet[7] = 'Others';


      // self.walletsAvailable = ['319', '320', '318', '322', '321', '323', 'Global', '0'];

      // self.tabToWallet = {
      //   0: '319',
      //   1: '320',
      //   2: '318',
      //   3: '322',
      //   4: '321',
      //   5: '323',
      //   6: 'Global',
      //   7: 'Others'
      // };

      self.walletCodeFilter = self.tabToWallet[0];
      self.selectedTab = 0;

      self.billing = null;
      self.billAllYear = null;
      self.billingYearWallet = [];
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

      self.search = function () {
        self.searchBilling();
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
;