angular.module('gorillasauth.protected.change-password')

    .controller('ChangePasswordController', ['$state', 'NotificationService', 'UserService',
        function ($state, NotificationService, UserService) {
            var self = this;

            self.password = null;
            self.newPassword = null;
            self.newPasswordConfirm = null;

            self.changePassword = function () {
                if (self.newPassword != self.newPasswordConfirm) {
                    return NotificationService.error('Senhas diferentes!');
                }
                UserService.changePassword(self.password, self.newPassword)
                    .then(function (response) {
                        if (response.errors) {
                            if (response.errors[0].code === 4003) {
                                NotificationService.error('Senha atual inválida!');
                            }
                            else {
                                NotificationService.error('Erro ao alterar a senha!');
                            }
                        }
                        else {
                            NotificationService.success('Senha alterada com sucesso!');
                            $state.go('protected.profile');
                        }
                    }, function (error) {
                        vm.sending = false;
                        NotificationService.error('Erro ao alterar a senha!');
                    });
            };
        }
    ])

;