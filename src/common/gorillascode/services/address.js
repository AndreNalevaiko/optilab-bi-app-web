/**
 * @ngdoc module
 * @name gorillascode.addressService
 *
 * @description
 * Serviços para localização.
 */
angular.module('gorillascode.services.address', [])

/**
 * @ngdoc service
 * @name AddressService
 * @module gorillascode.resource
 *
 * @description
 * Métodos utilitários.
 */
    .service('AddressService', ['$http', '$q', '$log', '$cookies',
      function ($http, $q, $log, $cookies) {
        var COOKIE_LOCATION_NAME = 'location';

        var self = this;
        
        // Armazena o local em cache para fazer a consulta apenas uma vez durante a sessão
        var locationCache = $cookies.getObject(COOKIE_LOCATION_NAME);

        /**
         * @ngdoc method
         * @name AddressService#getAddressFromZipCode
         *
         * @description
         * Busca o endereço de um CEP.
         *
         * @returns Endereço de um CEP.
         */
        self.getAddressFromZipCode = function (zip_code) {
          return $http.get("https://api.postmon.com.br/v1/cep/" + zip_code).then(function (response) {
                var result = response.data;
                var return_address = {
                  'address': result.logradouro,
                  'neighborhood': result.bairro,
                  'city': result.cidade,
                  'state': result.estado_info.nome,
                  'short_state': result.estado
                };
                return return_address;
              }, function (error) {
                return $http.get("https://viacep.com.br/ws/" + zip_code + "/json/").then(function (response) {
                      var result = response.data;
                      var return_address = {
                        'address': result.logradouro,
                        'neighborhood': result.bairro,
                        'city': result.localidade,
                        'short_state': result.uf,
                        'state': self.getBrazilianStates()[result.uf]
                      };
                      return return_address;
                    }, function (error) {
                      return $http.get("https://cep.republicavirtual.com.br/web_cep.php?cep=" + zip_code + "&formato=json").then(function (response) {
                        var result = response.data;
                        var return_address = {
                          'address': result.tipo_logradouro + ' ' + result.logradouro,
                          'neighborhood': result.bairro,
                          'city': result.cidade,
                          'short_state': result.estado,
                          'state': self.getBrazilianStates()[result.uf]
                        };
                        return return_address;
                      });
                    }
                );
              }
          );
        };

        /**
         * @ngdoc method
         * @name AddressService#getGeoPositionFromIP
         *
         * @description
         * Busca a cidade de um IP
         *{
          ip: "177.40.101.147",
          country_code: "BR",
          country_name: "Brazil",
          region_code: "PR",
          region_name: "Parana",
          city: "Curitiba",
          zip_code: "",
          time_zone: "America/Sao_Paulo",
          latitude: -25.4167,
          longitude: -49.25,
          metro_code: 0
         }
         * @returns Endereço de um CEP.
         */
        self.getGeoPositionFromIP = function () {
          return $http.get('https://freegeoip.net/json/').then(function (response) {
            return response.data;
          });
        };

        /**
         * @ngdoc method
         * @name AddressService#getPositionFromGoogleMaps
         *
         * @description
         * Busca as informações do local, usando a API do Google Maps, a partir das coordenadas,
         *{
          formatted_address: "Centro, Curitiba, PR",
          country_code: "BR",
          country_name: "Brazil",
          region_code: "PR",
          region_name: "Parana",
          city: "Curitiba",
          zip_code: "80060-010",
          coords: {
            latitude: -25.4167,
            longitude: -49.25
          }
         }
         * @param {object} position um objeto com as coordenadas do local.
         * @returns as informações do local.
         */
        self.getLocationFromGoogleMaps = function (position) {
          var deferred = $q.defer();

          if (GoogleApiAuthFailure) {
            $log.warn('A API do Google Maps não foi carregada');
            deferred.reject();
            return deferred.promise;
          }

          if (typeof google !== 'object' || typeof google.maps !== 'object') {
            $log.warn('A API do Google Maps não foi encontrada');
            deferred.reject();
            return deferred.promise;
          }

          var geocoder = new google.maps.Geocoder();
          var request = {
            location: {
              lat: position.latitude,
              lng: position.longitude,
            }
          };

          // Faz a geocodificação inversa
          geocoder.geocode(request, function (results, status) {
            var coords = {
              latitude: position.latitude,
              longitude: position.longitude
            };

            if (status !== google.maps.GeocoderStatus.OK) {
              $log.warn('Não foi possível fazer a geocodificação inversa das coordenadas', status);
              deferred.reject();
              return;
            }

            if (results.length === 0) {
              $log.warn('Nenhum resultado para a geocodificação inversa das coordenadas');
              deferred.reject();
              return;
            }

            $log.debug('Resultado da geocodificação inversa: ' + results[0].formatted_address);

            var location = self.transformGoogleLocation(coords, results[0]);
            deferred.resolve(location);
          });

          return deferred.promise;
        };

        /**
         * @ngdoc method
         * @name AddressService#getGeoPositionFromHTML
         *
         * @description
         * Busca a cidade da geolocalização do HTML
         {
             latitude: -25.4167,
             longitude: -49.2545,
         }
         Retorna null se o brower ou não tiver permissão
         */
        self.getGeoPositionFromHTML = function () {
          if (!navigator.geolocation) {
            return null;
          }

          var deferred = $q.defer();

          var options = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          };

          function success(pos) {
            deferred.resolve(pos);
          }

          function error(err) {
            deferred.resolve(null);
          }

          navigator.geolocation.getCurrentPosition(success, error, options);
          return deferred.promise;
        };

        self.getGeoPosition = function () {
          var deferred = $q.defer();

          if (locationCache) {
            deferred.resolve(locationCache);
            return deferred.promise;
          }

          var geoPositionFromHtmlPromise = self.getGeoPositionFromHTML();

          var position = {
            coords: null
          };

          function getFromIp() {
            var promise = self.getGeoPositionFromIP();
            if (!promise) {
              deferred.resolve(position);
              return;
            }

            promise.then(function (pos) {
              if (!pos) {
                deferred.resolve(position);
                return;
              }

              var coords = position.coords;
              if (!coords) {
                coords = {
                  latitude: pos.latitude,
                  longitude: pos.longitude
                };
              }

              position = pos;
              position.coords = coords;
              delete position.latitude;
              delete position.longitude;

              self.getLocationFromGoogleMaps(position.coords).then(function (location) {
                setLocationCache(location);
                deferred.resolve(location);
              }, function (error) {
                deferred.reject(error);
              });
            }, function(error) {
              deferred.reject(error);
            });
          }

          // Se não conseguiu pegar as coordenadas do navegador então busca as coordenadas usando
          // um webservice e em seguida busca as informações do local usando a API do Google Maps
          if (!geoPositionFromHtmlPromise) {
            getFromIp();
            return deferred.promise;
          }

          geoPositionFromHtmlPromise.then(function (pos) {
            if (pos) {
              position.coords = pos.coords;
            }

            // Não conseguiu pegar as coordenadas do navegador
            if (!pos) {
              getFromIp();
              return deferred.promise;
            }

            self.getLocationFromGoogleMaps(position.coords).then(function (location) {
              setLocationCache(location);
              deferred.resolve(location);
            }, function (error) {
              deferred.reject(error);
            });
          });

          return deferred.promise;
        };

        /**
         * Transforma um endereço no formato do Google para o formato da Conectu.
         *
         * @param coords as coordenadas do local.
         * @param googleLocation o local no formato do Google.
         * @returns {object} um endereço no formato da Conectu.
         */
        self.transformGoogleLocation = function (coords, googleLocation) {
          var location = {
            coords: coords
          };

          // Busca os componentes do endereço
          angular.forEach(googleLocation.address_components, function (addressComponent) {
            angular.forEach(addressComponent.types, function (addressComponentType) {
              if (addressComponentType == 'locality') {
                location.city = addressComponent.long_name;
              }

              if (addressComponentType == 'administrative_area_level_1') {
                location.region_code = addressComponent.short_name;
                location.region_name = addressComponent.long_name;
              }

              if (addressComponentType == 'country') {
                location.country_code = addressComponent.short_name;
                location.country_name = addressComponent.long_name;
              }

              if (addressComponentType == 'postal_code') {
                location.zip_code = addressComponent.long_name;
              }
            });
          });

          // Monta o endereço formatado
          var formattedAddress = [];

          location.formatted_address = googleLocation.formatted_address;

          if (location.city) {
            formattedAddress.push(location.city);
          }

          if (location.region_code) {
            formattedAddress.push(location.region_code);
          } else if (location.region_name) {
            formattedAddress.push(location.region_name);
          }

          if (formattedAddress.length > 0) {
            location.formatted_address = formattedAddress.join(', ');
          }

          setLocationCache(location);

          return location;
        };

        /**
         * @ngdoc method
         * @name AddressService#getBrazilianStates
         *
         * @description
         * Retorna uma lista com os estados do Brasil.
         *
         * @returns {Array} os estados do Brasil.
         */
        self.getBrazilianStates = function () {
          return {
            'AC': 'Acre',
            'AL': 'Alagoas',
            'AP': 'Amapá',
            'AM': 'Amazonas',
            'BA': 'Bahia',
            'CE': 'Ceará',
            'DF': 'Distrito Federal',
            'ES': 'Espírito Santo',
            'GO': 'Goiás',
            'MA': 'Maranhão',
            'MT': 'Mato Grosso',
            'MS': 'Mato Grosso do Sul',
            'MG': 'Minas Gerais',
            'PA': 'Pará',
            'PB': 'Paraíba',
            'PR': 'Paraná',
            'PE': 'Pernambuco',
            'PI': 'Piauí',
            'RJ': 'Rio de Janeiro',
            'RN': 'Rio Grande do Norte',
            'RS': 'Rio Grande do Sul',
            'RO': 'Rondônia',
            'RR': 'Roraima',
            'SC': 'Santa Catarina',
            'SP': 'São Paulo',
            'SE': 'Sergipe',
            'TO': 'Tocantins'
          };
        };

        function setLocationCache(location) {
          locationCache = location;
          $cookies.putObject(COOKIE_LOCATION_NAME, location);
        }
      }
    ])

;
