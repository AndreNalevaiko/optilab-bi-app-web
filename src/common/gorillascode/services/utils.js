/**
 * @ngdoc module
 * @name gorillascode.utils
 *
 * @description
 * Serviços com métodos utilitários.
 */
angular.module('gorillascode.services.utils', [
  'gorillascode.services.notification'
])

/**
 * @ngdoc service
 * @name Utils
 * @module gorillascode.utils
 *
 * @description
 * Métodos utilitários.
 */
  .service('Utils', ['NotificationService',
    function (NotificationService) {
      this.arrayDifference = function (arrayA, arrayB, propertyName, tranformator) {
        var diff = [];

        for (var a = 0; a < arrayA.length; a++) {
          var found = false;

          for (var b = 0; b < arrayB.length; b++) {
            found = arrayA[a][propertyName] === arrayB[b][propertyName];

            if (found) {
              break;
            }
          }

          if (!found) {
            if (tranformator) {
              diff.push(tranformator(arrayA[a]));
            } else {
              diff.push(arrayA[a]);
            }
          }
        }

        return diff;
      };

      this.createTextFilter = function (query, fieldName, fieldName0) {
        var lowercaseQuery = angular.lowercase(query);

        return function (obj) {
          var fieldValue;
          if (fieldName0) {
            fieldValue = angular.lowercase(obj[fieldName][fieldName0]);
          } else {
            fieldValue = angular.lowercase(obj[fieldName]);
          }
          return (fieldValue.indexOf(lowercaseQuery) > -1);
        };
      };

      /**
       * @ngdoc method
       * @name Utils#parseUrlQueryParameters
       *
       * @description
       * Retorna um objeto em que cada parâmetro da URL será uma propriedade do objeto.
       *
       * @param {string} url uma URL.
       * @returns {Object} um objeto com os valores dos parâmetros da URL.
       */
      this.parseUrlQueryParameters = function (url) {
        var parameters = {};
        var urlSplit = (url || '').split('?');

        if (urlSplit.length > 1) {
          angular.forEach(urlSplit[1].split('&'), function (keyValue) {
            if (keyValue) {
              var splitPoint = keyValue.indexOf('=');

              if (splitPoint !== -1) {
                var key = keyValue.substring(0, splitPoint);
                var val = keyValue.substring(splitPoint + 1);

                parameters[key] = val;
              }
            }
          });
        }

        return parameters;
      };

      /**
       * @ngdoc method
       * @name Utils#getUrlQueryParameter
       *
       * @description
       * Retorna o valor de um parâmetro de uma URL.
       *
       * @param {string} url uma URL.
       * @param {string} parameterName o nome do parâmetro.
       * @returns {string} o valor do parâmetro ou `undefined` se o parâmeto não existe.
       */
      this.getUrlQueryParameter = function (url, parameterName) {
        var parameters = service.parseUrlQueryParameters(url);
        return parameters[parameterName];
      };


      /**
       * @ngdoc method
       * @name Utils#getBrazilianStates
       *
       * @description
       * Retorna uma lista com os estados do Brasil.
       *
       * @returns {Array} os estados do Brasil.
       */
      this.getBrazilianStates = function () {
        return [
          {'abbreviation': 'AC', 'name': 'Acre'},
          {'abbreviation': 'AL', 'name': 'Alagoas'},
          {'abbreviation': 'AP', 'name': 'Amapá'},
          {'abbreviation': 'AM', 'name': 'Amazonas'},
          {'abbreviation': 'BA', 'name': 'Bahia'},
          {'abbreviation': 'CE', 'name': 'Ceará'},
          {'abbreviation': 'DF', 'name': 'Distrito Federal'},
          {'abbreviation': 'ES', 'name': 'Espírito Santo'},
          {'abbreviation': 'GO', 'name': 'Goiás'},
          {'abbreviation': 'MA', 'name': 'Maranhão'},
          {'abbreviation': 'MT', 'name': 'Mato Grosso'},
          {'abbreviation': 'MS', 'name': 'Mato Grosso do Sul'},
          {'abbreviation': 'MG', 'name': 'Minas Gerais'},
          {'abbreviation': 'PA', 'name': 'Pará'},
          {'abbreviation': 'PB', 'name': 'Paraíba'},
          {'abbreviation': 'PR', 'name': 'Paraná'},
          {'abbreviation': 'PE', 'name': 'Pernambuco'},
          {'abbreviation': 'PI', 'name': 'Piauí'},
          {'abbreviation': 'RJ', 'name': 'Rio de Janeiro'},
          {'abbreviation': 'RN', 'name': 'Rio Grande do Norte'},
          {'abbreviation': 'RS', 'name': 'Rio Grande do Sul'},
          {'abbreviation': 'RO', 'name': 'Rondônia'},
          {'abbreviation': 'RR', 'name': 'Roraima'},
          {'abbreviation': 'SC', 'name': 'Santa Catarina'},
          {'abbreviation': 'SP', 'name': 'São Paulo'},
          {'abbreviation': 'SE', 'name': 'Sergipe'},
          {'abbreviation': 'TO', 'name': 'Tocantins'}
        ];
      };

      this.showErrorMessage = function (errors) {
        var firstError = null;
        var keys = Object.keys(errors);
        var message = null;

        if (keys.length === 0) {
          return;
        }

        firstError = errors[keys[0]];

        if (!angular.isArray(firstError)) {
          return;
        }

        message = firstError[0];
        NotificationService.error(message);
      };

    }
  ])

;
