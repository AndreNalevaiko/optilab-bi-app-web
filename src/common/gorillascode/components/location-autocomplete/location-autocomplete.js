/**
 * @ngdoc module
 * @name gorillascode.components.location-autocomplete
 *
 * @description
 * Componente para exibir um campo de autocomplete para a escolha de uma cidade.
 * Depende de https://github.com/wpalahnuk/ngAutocomplete
 */
angular.module('gorillascode.components.location-autocomplete', [
  'gorillascode.addressService',
  'ngAutocomplete'
])

.factory('LocationAutocompleteService', ['$mdDialog', '$mdMedia',
  function ($mdDialog, $mdMedia) {
    var service = {
      getLocation: function(location, event) {
        return $mdDialog.show({
          controller: 'LocationAutocompleteController as locationAutocompleteCtrl',
          templateUrl: 'gorillascode/components/location-autocomplete/location-autocomplete.tpl.html',
          parent: angular.element(document.body),
          targetEvent: event,
          fullscreen: $mdMedia('xs'),
          locals: {
            location: location
          }
        });
      }
    };

    return service;
  }
])

.controller('LocationAutocompleteController', ['$scope', '$mdDialog', 'AddressService', 'location',
  function($scope, $mdDialog, AddressService, location) {
    var self = this;

    // Nome formatado do local
    self.locationFormattedAddress = null;

    // Detalhes do local
    self.locationDetails = null;

    if (location) {
      self.locationFormattedAddress = location.formatted_address;
    }

    self.cancel = function() {
      $mdDialog.cancel();
    };

    self.changeLocation = function() {
      var location = null;

      if (self.locationDetails) {
        var coords = {
          latitude: self.locationDetails.geometry.location.lat(),
          longitude: self.locationDetails.geometry.location.lng()
        };

        location = AddressService.transformGoogleLocation(coords, self.locationDetails);
      }

      $mdDialog.hide(location);
    };

    // Se se um novo local foi escolhido então faz a alteração do local
    $scope.$watch(function() {
      return self.locationDetails;
    }, function(newValue) {
      if (newValue) {
        self.changeLocation();
      }
    });
  }
])

;
