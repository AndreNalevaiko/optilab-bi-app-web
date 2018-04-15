angular.module('gorillascode.resources.login', [
  'gorillascode.resource'
])

.factory('Login', ['configuration', 'ResourceFactory',
  function (configuration, ResourceFactory) {
    return new ResourceFactory(configuration.apiUrl, 'v1/user/_signin');
  }]
)

.factory('PasswordReset', ['configuration', 'ResourceFactory',
  function (configuration, ResourceFactory) {
    return new ResourceFactory(configuration.apiUrl, 'v1/user/password/_reset', ':token', { token: '@token' });
  }]
)

.factory('PasswordChange', ['configuration', 'ResourceFactory',
  function (configuration, ResourceFactory) {
    return new ResourceFactory(configuration.apiUrl, 'v1/user/password/_change');
  }]
)

;
