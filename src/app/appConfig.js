angular.module('gorillasauth')

  .provider('configuration', [function () {
    var config = null;

    var configs = {
      development: {
        environment: 'development',
        hostnames: ['192.168.10.179'],
        apiUrl: 'http://192.168.10.179:5000',
        business_alias: {1: 'Curitiba', 2: 'Pato Branco', 6: 'Cascavel'}
      }
    };

    angular.forEach(configs, function (configItem) {
      angular.forEach(configItem.hostnames, function (hostname) {
        if (window.location.hostname == hostname) {
          config = configItem;
        }
      });
    });

    if (!config) {
      throw new Error('Configuração não encontrada para o ambiente');
    }

    console.log('Configurações carregadas para: ' + config.environment);

    this.$get = function () {
      return config;
    };

  }
  ])
;
