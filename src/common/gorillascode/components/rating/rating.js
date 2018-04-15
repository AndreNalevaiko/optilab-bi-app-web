/**
 * @ngdoc module
 * @name gorillascode.components.rating
 *
 * @description
 * Componente para exibir uma classificação baseada em estrelas.
 */
angular.module('gorillascode.components.rating', [])

/**
 * @ngdoc directive
 * @name gorillascodeRating
 * @module gorillascode.components.rating
 * @restrict E
 *
 * @description
 * Exibe uma classificação baseada em estrelas.
 *
 * @param {number} value o valor da classificação.
 * @param {number} maxValue o valor máximo da classificação.
 *
 * @example
 * <gorillascode-rating value="3.5" max-value="5"></gorillascode-rating>
 */
.directive('gorillascodeRating', [
  function() {
    return {
      restrict: 'E',
      scope: {
        value: '=',
        maxValue: '=',
      },
      templateUrl: 'gorillascode/components/rating/rating.tpl.html',
      link: function ($scope, element, attrs) {
        $scope.calcFill = function(index) {
          var fill = 0;

          if ($scope.value > index - 1) {
            if ($scope.value - (index - 1) > 1) {
              fill = 100;
            } else {
              fill = ($scope.value - (index - 1) ) * 100;
            }
          }

          return fill + '%';
        };
      }
    };
  }
])

;
