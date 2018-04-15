angular.module('gorillascode.services.auth', [
  'gorillascode.resources.login',
  'gorillascode.services.notification',
  'gorillascode.services.utils',
  'ui.router'
])

  .service('AuthTokenService', ['$cookies',
    function ($cookies) {
      var COOKIE_AUTHENTICATION_TOKEN = 'AUTH_TOKEN';

      this.setToken = function (token) {
        $cookies.put(COOKIE_AUTHENTICATION_TOKEN, token);
      };

      this.getToken = function () {
        return $cookies.get(COOKIE_AUTHENTICATION_TOKEN);
      };

      this.clean = function () {
        $cookies.remove(COOKIE_AUTHENTICATION_TOKEN);
      };

    }
  ])

  .service('AuthService', ['$log', '$rootScope', '$q', '$state', 'Utils', 'NotificationService', 'Login', 'AuthTokenService', '$cookies',
    'PasswordReset',

    function ($log, $rootScope, $q, $state, Utils, NotificationService, Login, AuthTokenService, PasswordReset, $cookies) {

      // var self = this;
      //
      // var COOKIE_NAME = 'ZG_MNG_TOKEN';
      //
      // self.setToken = setToken;
      //
      // self.getToken = getToken;
      //
      // self.clearToken = clearToken;
      //
      // /*
      //  Functions
      //  */
      //
      // function setToken(token) {
      //    $cookies.put(COOKIE_NAME, token);
      // }
      //
      // function getToken() {
      //    return $cookies.get(COOKIE_NAME);
      // }
      //
      // function clearToken() {
      //    $cookies.remove(COOKIE_NAME);
      // }

      this.login = function (email, password, callback) {
        var credentials = {
          email: email,
          password: password
        };

        return Login.save(credentials, function (response) {
          response = response.response;

          if (response.errors) {
            Utils.showErrorMessage(response.errors);
          } else {

            AuthTokenService.setToken(response.user.authentication_token);

            if ($rootScope.continueTo) {
              var continueTo = decodeURIComponent($rootScope.continueTo);
              window.location = continueTo;
            } else {
              if (typeof(callback) != 'function') {
                $state.go('public.app');
                return;
              }

              callback.call();
            }

          }
        }, function (error) {
          NotificationService.error('Não foi possível fazer o login. Tente novamente mais tarde.', error);
        }).$promise;
      };

      this.loginFacebook = function (params, callback) {
        FB.login(function (response) {

          if (response.status != 'connected') {
            return;
          }

          var token = response.authResponse.accessToken;

          UserService.auth({
            'token': token
          }, params)
            .then(function (response) {
              if (response.error) {
                NotificationService.error(response.error);
                return;
              }

              if (!response.user) {
                if (typeof(callback) == 'function') {
                  callback(response);
                }

                return;
              }

              AuthTokenService.setToken(response.user.authentication_token);

              if ($rootScope.continueTo) {
                var continueTo = decodeURIComponent($rootScope.continueTo);
                window.location = continueTo;
              } else {
                if (typeof(callback) != 'function') {
                  $state.go('public.app');
                  return;
                }

                callback.call();
              }

            });

        }, {
          scope: 'public_profile,email'
        });
      };

      this.resetPassword = function (password, token) {
        var parameters = {
          password_confirm: password,
          password: password,
          token: token
        };

        return PasswordReset.save(parameters, function (response) {
          response = response.response;

          if (response.errors) {
            Utils.showErrorMessage(response.errors);
          }
        }, function (error) {
          NotificationService.error('Não foi possível alterar a senha. Tente novamente mais ' +
            'tarde.', error);
        }).$promise;
      };

      this.logout = function () {
        AuthTokenService.clean();
        return $q.when([]);
      };

    }
  ])

  .factory('AuthInterceptor', ['$q', 'AuthTokenService', 'configuration',
    function ($q, AuthTokenService, configuration) {
      var interceptor = {
        request: function (config) {
          if (config.url.startsWith('http') && !config.url.startsWith(configuration.apiUrl)) {
            return config;
          }

          var authToken = AuthTokenService.getToken();
          if (authToken) {
            config.headers['Authentication-Token'] = authToken;
          } else {
            delete config.headers['Authentication-Token'];
          }

          return config;
        }
      };

      return interceptor;
    }
  ])

;
