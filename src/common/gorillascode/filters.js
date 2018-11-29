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

.filter('companyAlias', [
  function() {
    return function(value) {
      switch (value) {
        case 1:
          return 'Curitiba';

        case 2:
          return 'Pato Branco';

        case 5:
          return 'Londrina';

        case 6:
          return 'Cascavel';

        case 0:
          return 'Global';

        case '1':
          return 'Curitiba';

        case '2':
          return 'Pato Branco';

        case '5':
          return 'Londrina';

        case '6':
          return 'Cascavel';

        case '0':
          return 'Global';

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

.filter('startFrom', function() {
  return function(input, start) {
      if(input) {
          start = +start; //parse to int
          return input.slice(start);
      }
      return [];
  };
})
;
