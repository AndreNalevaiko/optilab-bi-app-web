angular.module('gorillasauth.protected.change-password', [
    'ui.router'
])

.config(['$stateProvider',
    function($stateProvider) {
        $stateProvider.state('protected.change-password', {
            url: '/change-password',
            controller: 'ChangePasswordController as changePasswordCtrl',
            templateUrl: 'protected/user/change-password/change-password.tpl.html',
            data: {
                pageTitle: 'Alterar senha'
            }
        });
    }
])

;