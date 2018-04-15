angular.module('gorillascode.resources.user', [
  'gorillascode.resource'
])

  .factory('User', ['configuration', 'ResourceFactory',
    function (configuration, ResourceFactory) {
      return new ResourceFactory(configuration.apiUrl, 'user');
    }]
  )

  .service('RegisterUser', ['configuration', 'ResourceFactory',
    function (configuration, ResourceFactory) {
      this.save = function (user, params, fnSuccess, fnError) {
        var resource = new ResourceFactory(configuration.apiUrl, 'register', null, params);
        return resource.save(user, fnSuccess, fnError);
      };
    }]
  )

  .service('UserAuth', ['configuration', 'ResourceFactory',
    function (configuration, ResourceFactory) {
      this.save = function (auth_data, params) {
        var resource = new ResourceFactory(configuration.apiUrl, 'user', '_auth', params);
        return resource.save(auth_data);
      };
    }]
  )

;
