angular.module('gorillasauth.protected.user-management', [
  'ui.router'
])

  .config(['$stateProvider',
    function ($stateProvider) {
      $stateProvider.state('protected.user-management', {
        url: '/users',
        templateUrl: 'protected/user/management/user-management.tpl.html',
        controller: 'UserManagementController as userManagementCtrl',
        data: {
          pageTitle: 'Usuários'
        },
        resolve: {
          users: ['user', '$q', 'UserManagementService', function (user, $q, UserManagementService) {
            return UserManagementService.getAllUsersLessMe(user);
          }]
        }
      });
    }
  ])

;
