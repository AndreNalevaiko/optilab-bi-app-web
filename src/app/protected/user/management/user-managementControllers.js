angular.module('gorillasauth.protected.user-management')

    .controller('UserManagementController', ['$scope', '$mdDialog', 'users', 'UserService', 'NotificationService', '$http',
        function ($scope, $mdDialog, users, UserService, NotificationService, $http) {
            var self = this;
            angular.forEach(users, function (user) {
                user.isOpen = false;
                user.selectedMode = 'md-fling';
                user.selectedDirection = 'left';
            });
            self.users = users;


            self.selecteds = [];

            self.toolbarTitle = '';

            $scope.$watchCollection('userManagementCtrl.selecteds', function (newCol, oldCol, scope) {
                if (self.selecteds.length) {
                    self.toolbarTitle = self.selecteds.length == 1 ? '1 usuários selecionado' : self.selecteds.length + ' usuários selecionados';
                }
                else {
                    self.toolbarTitle = '';
                }
            });

            self.newUser = function (ev) {
                self.openEditDialog(ev);
            };

            self.editUser = function (ev, user) {
                self.openEditDialog(ev, user);
            };

            function deleteFromList(list, id) {
                for (var i = 0; i < list.length; i++) {
                    if (list[i].id == id) {
                        list.splice(i, 1);
                        return;
                    }
                }
            }

            function deleteSelecteds(callback) {
                if (!self.selecteds.length) {
                    callback(true);
                    return;
                }

                var user = self.selecteds[0];
                UserService.delete(user.id).then(function (response) {
                    deleteFromList(self.selecteds, user.id);
                    deleteFromList(self.users, user.id);
                    deleteSelecteds(callback);
                }, function (error) {
                    callback(false);
                });
            }

            self.deleteSelectedsConfirmation = function (ev) {
                var confirm = $mdDialog.confirm()
                    .title('Confirma a exclusão?')
                    .textContent('ATENÇÃO: a exclusão não poderá ser desfeita!')
                    .ariaLabel('Excluir')
                    .targetEvent(ev)
                    .ok('Excluir')
                    .cancel('Cencelar');

                $mdDialog.show(confirm).then(function () {
                    var selectedsCount = self.selecteds.length;
                    deleteSelecteds(function (success) {
                        if (success) {
                            NotificationService.success(selectedsCount == 1 ? '1 usuário excluído!' : selectedsCount + ' usuários excluídos.');
                        }
                        //if erro
                        else {
                            NotificationService.error('Opps. Houve um erro inesperado e nem todos os usuários foram excluídos.');
                        }
                    });

                }, function () {
                    //cancel
                });

            };

            self.openEditDialog = function (ev, user) {
                var dialog = {
                    templateUrl: 'protected/user/management/edit.tpl.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    controller: ['$scope', '$mdDialog', function ($scope, $mdDialog) {
                        $scope.isNew = user == null;
                        $scope.user = $scope.isNew ? {} : angular.copy(user);

                        $scope.title = $scope.isNew ? 'Novo usuário' : 'Alterar usuário';

                        $scope.cancel = function () {
                            $mdDialog.cancel();
                        };

                        $scope.confirm = function () {
                            $mdDialog.hide({isNew: $scope.isNew, user: $scope.user});
                        };
                    }]
                };

                $mdDialog.show(dialog).then(function (result) {
                    // edit
                    if (result.isNew) {
                        UserService.save(result.user).then(function (response) {
                            if (response.error) {
                                NotificationService.error(response.error);
                                return;
                            }

                            NotificationService.success('Usuario cadastrado');
                            self.users.push(response.data);
                        }, function (error) {
                            if (error['data']['errors'][0]['code'] == 4004) {
                                NotificationService.error("Registro duplicado");
                            }else{
                                NotificationService.error('Não foi possível criar a conta. Tente novamente mais tarde.', error);
                            }
                        });

                    }
                    else {
                        var patch = {
                            id: result.user.id,
                            name: result.user.name,
                            email: result.user.email
                        };

                        UserService.save(patch).then(function (response) {
                            if (response.message) {
                                NotificationService.error(response.message);
                                return;
                            }
                            angular.copy(response, user);
                        });
                    }

                }, function () {
                    // Canceled
                });
            };


            self.openRolesDialog = function (ev, user) {
                var dialog = {
                    templateUrl: 'protected/user/management/roles.tpl.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    resolve: {
                        applications: ['ApplicationService', function (ApplicationService) {
                            return ApplicationService.getAll();
                        }],
                        gorillasRoles: ['RoleService', function (RoleService) {
                            return RoleService.gorillasauthRoles();
                        }]
                    },
                    controller: ['$scope', '$mdDialog', 'applications', 'gorillasRoles', function ($scope, $mdDialog, applications, gorillasRoles) {
                        $scope.user = user;
                        $scope.applications = applications;

                        function _checkRole(role) {
                            if (!$scope.user.roles) {
                                return;
                            }

                            for (var i = 0; i < $scope.user.roles.length; i++) {
                                if ($scope.user.roles[i].id == role.id) {
                                    role.checked = true;
                                    break;
                                }
                            }
                        }

                        //Adicionando uma aplicação para ser referente a Gorillasauth
                        $scope.applications.splice(0, 0, {
                            name: 'Gorillasauth',
                            description: 'Autenticador da Gorillas',
                            roles: gorillasRoles
                        });

                        $scope.applications.forEach(function (app) {
                            app.roles.forEach(function (role) {
                                _checkRole(role);
                            });
                        });

                        $scope.cancel = function () {
                            $mdDialog.cancel();
                        };

                        $scope.confirm = function () {
                            var roles = $scope.applications.map(function (app) {
                                return app.roles.filter(function (role) {
                                    return role.checked;
                                });
                            });

                            roles = [].concat.apply([], roles).map(function (role) {
                                return {id: role.id};
                            });

                            $mdDialog.hide(roles);
                        };
                    }]
                };

                $mdDialog.show(dialog).then(function (roles) {
                    //ok

                    var patch = {
                        id: String(user.id),
                        roles: roles
                    };

                    UserService.save(patch).then(function (response) {
                        for (var i = 0; i < self.users.length; i++) {
                            if (self.users[i].id == response.id) {
                                self.users[i] = angular.copy(response);
                                break;
                            }
                        }
                        // user = angular.copy(response);
                        // $scope.user = angular.copy(response);
                        // angular.copy(response.data.attributes, $scope.user);
                        NotificationService.success('Permissões salvas com sucesso!');
                    }, function (error) {
                        NotificationService.success('Opps. Houve um erro inesperado ao tentar salvar as permissões do usuário.');
                    });

                }, function () {
                    // Canceled
                });
            };


        }
    ])

;
