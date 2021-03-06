angular.module('gorillasauth', [
  'angular-loading-bar',
  'ngCookies',
  'ngMaterial',
  'ngResource',
  'ngMessages',
  'angularMoment',
  'templates-app',
  'templates-common',
  'ui.router',
  'md.data.table',
  'ngFileUpload',
  'ngImgCrop',
  'idf.br-filters',
  'ngFileSaver',
  'ui.utils.masks',
  'chart',
  'gorillascode',
  'gorillascode.services.upload',
  'gorillascode.services.user',
  'gorillascode.services.auth',
  'gorillascode.services.notification',
  'gorillasauth.services.billing',
  'gorillasauth.services.report-products',
  'gorillasauth.services.product',
  'gorillasauth.services.rate-service',
  'gorillasauth.services.user-management',
  'gorillasauth.services.file',
  'gorillasauth.services.role',
  'gorillasauth.services.budget',
  'gorillasauth.services.kpi',
  'gorillasauth.services.filters',
  'gorillasauth.services.customer',
  'gorillasauth.services.group-customer',
  'gorillasauth.services.date-filter',
  'gorillasauth.public',
  'gorillasauth.protected'
])

  .config(['$urlRouterProvider', '$httpProvider', '$mdThemingProvider', 'cfpLoadingBarProvider',
    '$mdDateLocaleProvider',
    function ($urlRouterProvider, $httpProvider, $mdThemingProvider, cfpLoadingBarProvider, $mdDateLocaleProvider) {
      $urlRouterProvider.otherwise('/home');
      $httpProvider.interceptors.push('AuthInterceptor');
      cfpLoadingBarProvider.includeSpinner = false;

      $mdThemingProvider.theme('default').primaryPalette('blue-grey').accentPalette('teal');


      if (!String.prototype.startsWith) {
        String.prototype.startsWith = function (searchString, position) {
          position = position || 0;
          return this.indexOf(searchString, position) === position;
        };
      }

      // Altera o formato das datas
      $mdDateLocaleProvider.formatDate = function (date) {
        return date ? moment(date).format('L') : null;
      };

      // Altera o parse das datas
      $mdDateLocaleProvider.parseDate = function (dateString) {
        var m = moment(dateString, 'L', true);
        return m.isValid() ? m.toDate() : new Date(NaN);
      };
    }
  ])

  .controller('AppController', ['$rootScope', '$scope', '$state', '$log', '$mdSidenav', '$mdComponentRegistry', '$httpParamSerializer',

    function ($rootScope, $scope, $state, $log, $mdSidenav, $mdComponentRegistry, $httpParamSerializer) {
      $rootScope.appVersion = appVersion;
      $rootScope.$state = $state;

      if ($rootScope.appVersion) {
        $log.info('Versão: ' + $rootScope.appVersion.number);
        $log.info('Build: ' + $rootScope.appVersion.buildDate);
      }

      $rootScope.$on('$stateChangeError', function (e, toState, toParams, fromState, fromParams, error) {
        if (!angular.isObject(error)) {
          return;
        }

        var errorMessage = '';
        if (error.message) {
          errorMessage = error.message;
        }
        else if (error.data) {
          errorMessage = error.data.message;
        }

        $rootScope.error = {message: errorMessage};

        if (401 == error.status || 'unauthorized' == error.status) {
          $state.go("public.login");
        }
        else if ('redirect' == error.status) {
          $state.go(error.state);
        }
        else {
          $log.error('Não foi possível alterar o state', error);
          $state.go("public.error");
        }

      });

      $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {

        if (angular.isDefined(toState.data.pageTitle)) {
          $rootScope.pageTitle = toState.data.pageTitle;
          $rootScope.hideSidenav = toState.data.hideSidenav != 'undefined' && toState.data.hideSidenav;
          $rootScope.hideToolbar = toState.data.hideToolbar != 'undefined' && toState.data.hideToolbar;
        }
      });

      $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
        if ('public.login' != toState.name && 'public.password-change' != toState.name) {
          var continueTo = $state.href(toState.name, {absolute: true});
          continueTo += ('?' + $httpParamSerializer(toParams));
          continueTo = encodeURIComponent(continueTo);
          $rootScope.continueTo = continueTo;
        }

        // Oculta o menu lateral ao alterar de tela
        if ($mdComponentRegistry.get('sidenav-left')) {
          $mdSidenav('sidenav-left').close();
        }
      });

    }
  ])

;
