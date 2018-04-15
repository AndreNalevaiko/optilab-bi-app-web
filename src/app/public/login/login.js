angular.module('gorillasauth.public.login', [
  'ui.router'
])

  .config(['$stateProvider',
    function ($stateProvider) {
      $stateProvider.state('public.login', {
        url: '/login?continue',
        controller: 'LoginController as loginCtrl',
        templateUrl: 'public/login/login.tpl.html',
        data: {
          pageTitle: 'Login',
          hideToolbar: true
        }
      }).state('public.password-change', {
        url: '/password/reset?token',
        controller: 'PasswordResetController as passwordResetCtrl',
        templateUrl: 'public/login/password-reset.tpl.html',
        data: {
          pageTitle: 'Recuperação de senha',
          hideToolbar: true
        }
      })
      ;
    }
  ])

;

