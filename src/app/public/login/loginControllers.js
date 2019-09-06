angular.module('gorillasauth.public.login')

    .controller('LoginController', ['$scope', '$state', 'AuthService', 'AuthTokenService', 'UserService', 'NotificationService',
        function ($scope, $state, AuthService, AuthTokenService, UserService, NotificationService) {
            AuthTokenService.clean();

            var self = this;

            self.user = {};

            self.doLogin = function () {
                UserService.signin(self.user.email, self.user.password).then(function (response) {
                    $state.go('protected.home');
                }, function(response) {
                    if (response.data && response.data.errors) {
                        var error = response.data.errors[0];
                        if (4002 === error.code) {
                            NotificationService.error('Usuário não existe.');
                        }
                        else if (4003 === error.code) {
                            NotificationService.error('Senha incorreta.');
                        }
                        else if (4008 === error.code) {
                            NotificationService.error('Conta desativada.');
                        }
                        else {
                            NotificationService.error(error.description);
                        }

                        return;
                    }

                    NotificationService.error('Não foi possível fazer o login. ' +
                        'Tente novamente mais tarde.', response);
                });
            };

            self.showRecover = function () {
                self.boxTitle = 'Esqueceu sua senha?';
                self.selectedBox = 1;
            };

            self.showLogin = function () {
                self.boxTitle = 'Acesso';
                self.selectedBox = 0;
            };

            self.recoverPassword = function () {
                UserService.recoverPassword(self.emailRecover).then(function (response) {
                    if (response.errors) {
                        var error = response.errors[0];
                        if (4007 === error.code) {
                            NotificationService.error('Token inválido.');
                        }
                        else if (4003 === error.code) {
                            NotificationService.error('Senha incorreta.');
                        }
                        else {
                            NotificationService.error(error.description);
                        }
                    }
                    else {
                        self.emailRecoverMessage = 'Um e-mail foi enviado com as instruções para você recuperar a sua senha.';
                    }

                });
            };

            self.showLogin();
        }
    ])

    .controller('PasswordResetController', ['$state', '$stateParams', 'NotificationService',
        'UserService',

        function ($state, $stateParams, NotificationService, UserService) {
            var self = this;
            var token = $stateParams.token;

            self.password = null;

            self.reset = function () {
                if (!token) {
                    NotificationService.error('O token não foi informado. Tente novamente mais tarde.');
                    return;
                }

                if (self.confirmPassword != self.password) {
                    NotificationService.error('As senhas não conferem.');
                    return;
                }

                UserService.resetPassword(self.password, token).then(function (response) {
                    if (response.errors) {
                        var error = response.errors[0];
                        if (4007 === error.code) {
                            NotificationService.error('Token inválido.');
                        }
                        else if (4003 === error.code) {
                            NotificationService.error('Senha incorreta.');
                        }
                        else {
                            NotificationService.error(error.description);
                        }

                        return;
                    }

                    NotificationService.success('Senha alterada com sucesso. Faça o login com a nova senha.');
                    $state.go('public.login');
                });
            };
        }
    ])


;
