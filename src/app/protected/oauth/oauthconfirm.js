angular.module('gorillasauth.protected.oauthconfirm', [
    'ui.router'
])

    .config(['$stateProvider',
        function ($stateProvider) {
            $stateProvider.state('protected.oauthconfirm', {
                url: '/oauthconfirm?response_type&client_id&scope&redirect_uri',
                templateUrl: 'protected/oauth/oauthconfirm.tpl.html',
                controller: 'OauthConfirmController as oauthConfirmCtrl',
                data: {
                    pageTitle: 'Autorizando',
                    hideSidenav: true,
                    hideToolbar: true
                }
            });
        }
    ])

;