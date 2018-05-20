angular.module('gorillasauth.services.budget', [
  'gorillascode.resources.budget'
])

    .service('BudgetService', ['configuration', 'Budget',
        function (configuration, Budget) {

            this.save = function (budget) {
                if (budget.id) {
                  return Budget.patch(budget).$promise;
                }
                else {
                  return Budget.save(budget).$promise;
                }
              };
      
              this.search = function (searchParameters) {
      
                if (!searchParameters) {
                  searchParameters = {};
                }
      
                return Budget.get(searchParameters).$promise;
              };
      
              this.get = function (id) {
                return Budget.get({id: id}).$promise;
              };

        }
    ])
;

