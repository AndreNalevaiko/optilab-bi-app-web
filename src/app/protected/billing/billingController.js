angular.module('gorillasauth.protected.billing')

  .controller('billingController', ['$scope', 'BillingService', 'BudgetService', '$mdDialog', 
    'NotificationService', '$mdMedia', 'DateFilterService', 'KpiService',
    function ($scope, BillingService, BudgetService, $mdDialog, NotificationService, $mdMedia, 
      DateFilterService, KpiService) {
      var self = this;

      self.dateFilter = DateFilterService.filterDateNow();
      self.filterOptions = DateFilterService.filterOptions();

      self.businessCodeFilter = 1;
      self.selectedTab = 0;

      self.tabToBusinessCode = {
        0: 1,
        1: 6,
        2: 2,
        3: 5,
        4: "Global"
      };

      self.billing = null;
      self.loading = {
        billing: false,
        kpi: false,
        generating_kpi: false
      };

      self.insertBudget = function (ev, business_code, budget) {
        $mdDialog.show({
          controller: 'editBudgetController as ctrl',
          fullscreen: $mdMedia('xs'),
          locals: {
            business_code: business_code,
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

      self.editKpiBudget = function (ev, kpi) {
        $mdDialog.show({
          controller: 'editKpiBudgetController as ctrl',
          fullscreen: $mdMedia('xs'),
          locals: {
            kpi: kpi,
          },
          parent: angular.element(document.body),
          templateUrl: 'protected/billing/edit-kpi-budget-dialog.tpl.html',
          targetEvent: ev,
          clickOutsideToClose: true
        }).then(function (result) {
          kpi.budget_billing = result.budget_billing;
          kpi.budget_order_quantity = result.budget_order_quantity;
          kpi.budget_quantity_pieces = result.budget_quantity_pieces;
          kpi.budget_tm = result.budget_tm;
        }, function (){
          console.log('Canceled Operation');
        });
      };

      self.searchBilling = function () {
        self.loading.billing = true;

        BillingService.get(self.dateFilter).then(function (response) {
          self.billing = response;
          self.loading.billing = false;    
          
          searchBudget().then(function (response){
              self.budget = response.objects;

              if (self.budget.length){
                setEmpBudget();
              }

            }, function (error){
              NotificationService.error('Ocorreu um erro ao buscar os budgets');
          });
        }, function (error){
          NotificationService.error('Ocorreu um erro ao buscar o faturamento');
        }); 
      };

      self.searchKpi = function () {
        var kpiSearchParams = createFilterSearchKpi();
        self.loading.kpi = true;
        
        KpiService.search(kpiSearchParams).then(function (response) {
          if(response.objects.length) {
            self.kpis = response.objects;
            self.loading.kpi = false;
          } else if (!self.generateTentative){
            generateKpi();
          }
        }, function (error) {
          NotificationService.error('Ocorreu um erro ao buscar o KPI');
        });
      };

      self.checkLengthResult = function (type) {
        if (type == 'billing') {
          return self.billing.filter(function (bil) {
            return bil.business == self.businessCodeFilter;
          }).length > 0;
        } else if (type == 'kpi') {
          return self.kpis.filter(function (kpi) {
            return kpi.business_code == self.businessCodeFilter == 'Global' ? 0 : self.businessCodeFilter;
          }).length > 0;
        }
      };

      self.getParticipationForGlobal = function (business_code) {
        var billing = self.billing.filter(function (bil) { return bil.business == business_code;})[0];
        var billingGlobal = self.billing.filter(function (bil) { return bil.business == 'Global';})[0];

        return billing.value / billingGlobal.value;
      };
      
      function generateKpi() {
        self.generateTentative = true;
        self.loading.generating_kpi = true;
        KpiService.generate(self.dateFilter).then(function (response) {
          self.generateTentative = false;
          self.loading.generating_kpi = false;
          self.searchKpi();
        }, function (error) {
          NotificationService.error('Ocorreu um erro ao gerar o KPI');
        });
      }

      function createFilterSearchKpi() {
        return {
          q: {
            filters: [
              {name: 'month', op: 'eq', val: self.dateFilter.month},
              {name: 'year', op: 'eq', val: self.dateFilter.year},
            ]
          }
        };
      }

      function setEmpBudget (emp_code){
        angular.forEach(self.billing, function (bil){
          angular.forEach(self.budget, function (item){
            if (bil.business == item.business_code){
              bil.budget = item;
            }
          });
        });
      }

      function searchBudget() {
        var params = {
          q: {
            filters: [
              {name: 'month', op: 'eq', val: self.dateFilter.month},
              {name: 'year', op: 'eq', val: self.dateFilter.year},
            ]
          }
        };
        return BudgetService.search(params);
      }

      $scope.$watch(function () {
        return self.selectedTab;
      }, function (newVal, oldVal) {
        if (Number(newVal) !== Number(oldVal)) {
          self.businessCodeFilter = self.tabToBusinessCode[newVal];
        }
      });

      self.search = function () {
        self.searchBilling();
        self.searchKpi();
      };

      self.search();

    }
  ])

  .controller('editBudgetController', ['BudgetService', '$mdDialog', 'NotificationService', 
    'business_code', 'dateToSave', 'budget',
    function (BudgetService, $mdDialog, NotificationService, business_code, 
      dateToSave, budget) {
      var self = this;

      self.title = budget ? 'Editar budget' : 'Inserir budget';
      self.dateToSave = dateToSave;
      self.business_code = business_code;

      if (budget){
        self.budget = angular.copy(budget);
      }else{
        self.budget = {
          business_code: self.business_code,
          value: null,
          month: dateToSave.month,
          year: dateToSave.year
        };
      }
      
      self.save = save;
      self.close = close;

      function save() {
        BudgetService.save(self.budget).then(function (response){
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

  .controller('editKpiBudgetController', ['KpiService', '$mdDialog', 'NotificationService', 
    'kpi',
    function (KpiService, $mdDialog, NotificationService, kpi) {
      var self = this;

      self.kpi = angular.copy(kpi);
      self.title = kpi ? 'Editar budget' : 'Inserir budget';

      self.save = save;
      self.close = close;

      function save() {
        var kpiToSave = {
          id: self.kpi.id,
          budget_billing: self.kpi.budget_billing,
          budget_order_quantity: self.kpi.budget_order_quantity,
          budget_quantity_pieces: self.kpi.budget_quantity_pieces,
          budget_tm: self.kpi.budget_tm,
        };

        KpiService.save(kpiToSave).then(function (response){
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
