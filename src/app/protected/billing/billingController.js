angular.module('gorillasauth.protected.billing')

  .controller('billingController', [ 'BillingService', 'BudgetService', '$mdDialog', 
    'NotificationService', '$mdMedia',
    function (BillingService, BudgetService, $mdDialog, NotificationService, $mdMedia) {
      var self = this;

      self.bugdet = null;
      self.dateNow = new Date();

      self.dateFilter = {
        day: self.dateNow.getDay(),
        //month: self.dateNow.getMonth(),
        month: 2,
        year: self.dateNow.getFullYear(),
      };

      self.billing = null;
      self.loading = {
        billing: false
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

      self.search = function () {
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

;
