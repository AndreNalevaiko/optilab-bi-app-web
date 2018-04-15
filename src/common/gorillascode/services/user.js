angular.module('gorillascode.services.user', [
    'gorillascode.resources.user',
    'gorillascode.resources.login',
    'gorillascode.services.notification',
    'gorillascode.services.utils',
    'gorillascode.services.auth',
    'gorillascode.services.helper-jsonapi'
])

    .service('UserService', ['$q', 'User', 'RegisterUser', 'NotificationService', 'Utils', 'PasswordChange', 'PasswordReset',
        'AuthTokenService', 'UserAuth', '$http', 'configuration', '$rootScope', 'JsonApiHelper', 'AuthService',

        function ($q, User, RegisterUser, NotificationService, Utils, PasswordChange, PasswordReset, AuthTokenService, UserAuth, $http, configuration, $rootScope, JsonApiHelper, AuthService) {

            this.me = function () {
                return User.get({id: 'me'}).$promise;
            };

            this.signin = function (email, password) {
                var url = configuration.apiUrl + '/v1/user/_signin';

                var data = {
                    email: email,
                    password: password
                };

                return $http.post(url, data).then(function (response) {
                    response = response.data;
                    AuthTokenService.setToken(response.token);

                    return response;
                });
            };

            this.save = function (user) {
                if (user.id) {
                    if (!user.roles) {
                        return User.patch(JsonApiHelper.toRequestJsonApi(user, 'user')).$promise;
                    } else {
                        return User.patch({include: 'roles'}, JsonApiHelper.toRequestJsonApi(user, 'user', ['roles'])).$promise;
                    }
                }
                else {
                    var url = configuration.apiUrl + '/v1/user/_signup';
                    return $http.post(url, user);
                }
            };

            this.delete = function (user_id) {
                return User.delete({id: user_id}).$promise;
            };


            this.changePassword = function (password, newPassword) {
                var url = configuration.apiUrl + '/v1/user/password/_change';

                var data = {
                    password: password,
                    new_password: newPassword
                };

                return $http.post(url, data).then(function (response) {
                    return response.data;
                }, function (error) {
                    if (error.data.errors) {
                        return error.data;
                    }
                });
            };

            this.recoverPassword = function (email) {
                var url = configuration.apiUrl + '/v1/user/password/_reset';

                var data = {
                    email: email
                };

                return $http.post(url, data).then(function (response) {
                    return response.data;
                }, function (error) {
                    if (error.data.errors) {
                        return error.data;
                    }
                });
            };

            this.resetPassword = function (new_password, token) {
                var url = configuration.apiUrl + '/v1/user/password/_change';

                var data = {
                    token: token,
                    new_password: new_password
                };

                return $http.post(url, data).then(function (response) {
                    return response.data;
                }, function (error) {
                    if (error.data.errors) {
                        return error.data;
                    }
                });
            };

            this.auth = function (auth_data, params) {
                return UserAuth.save(auth_data, params).$promise;
            };

        }
    ])

;
