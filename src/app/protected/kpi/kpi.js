angular.module('gorillasauth.protected.kpi', [
  'gorillasauth.services.kpi',
  'ui.router'
])

  .config(['$stateProvider',
    function ($stateProvider) {
      $stateProvider.state('protected.kpi', {
        url: '/kpi',
        templateUrl: 'protected/kpi/kpi.tpl.html',
        controller: 'KpiController as kpiCtrl',
        data: {
          pageTitle: 'KPI'
        }
      });
    }
  ])

;
