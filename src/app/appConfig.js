angular.module('gorillasauth')

  .provider('configuration', [function () {
    var config = null;

    var configs = {
      development: {
        environment: 'development',
        hostnames: ['localhost'],
        apiUrl: 'http://localhost:5000',
        wallets: {4: 'CWB1', 227: 'CWB2', 228:'CVEL', 226: 'PBO', 193: 'LDNA', 9: 'OPTILAB'}
      },
      production_internal: {
        environment: 'production_internal',
        hostnames: ['192.168.10.41'],
        apiUrl: 'http://192.168.10.41:5000',
        wallets: {319: 'CWB1', 320: 'CWB2', 318: 'CVEL', 322: 'PBO', 321: 'LDNA', 323: 'OPTILAB'}
      },
      production_external: {
        environment: 'production_external',
        hostnames: ['levantamentos.laboptilab.com', 'remoto.laboptilab.com'],
        apiUrl: 'http://levantamentos.laboptilab.com:5000',
        wallets: {319: 'CWB1', 320: 'CWB2', 318: 'CVEL', 322: 'PBO', 321: 'LDNA', 323: 'OPTILAB'}
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
