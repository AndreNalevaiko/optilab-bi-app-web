angular.module('gorillasauth.protected.oauthconfirm')

  .controller('OauthConfirmController', ['$scope', '$location', '$http', '$httpParamSerializer', 'configuration', 'AuthTokenService',
    function ($scope, $location, $http, $httpParamSerializer, configuration, AuthTokenService) {

      var queryParams = $location.search();
      var params = {
        auth_token: AuthTokenService.getToken(),
        response_type: queryParams.response_type,
        client_id: queryParams.client_id,
        redirect_uri: queryParams.redirect_uri,
        scope: queryParams.scope,
        confirm: 'yes'
      };

      var urlParams = $httpParamSerializer(params);
      var url = configuration.apiUrl + '/api/oauth/authorize?' + urlParams;
      window.location = url;

    }
  ])

;
