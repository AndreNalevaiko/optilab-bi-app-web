angular.module('gorillascode.filters', [])

.filter('trustAsHtml', ['$sce',
  function($sce) {
    return function(value) {
      return value ? $sce.trustAsHtml(value) : value;
    };
  }
])

.filter('trustAsResourceUrl', ['$sce',
  function($sce) {
    return function(value) {
      return value ? $sce.trustAsResourceUrl(value) : value;
    };
  }
])

.filter('sex', [
  function() {
    return function(value) {
      switch (value) {
        case 'FEMALE':
          return 'Mulher';

        case 'MALE':
          return 'Homem';

        default:
          return value;
      }
    };
  }
])

.filter('percentage', ['$filter', function ($filter) {
  return function (input, decimals) {
    return $filter('number')(input * 100, decimals) + '%';
    };
  }
])

;
