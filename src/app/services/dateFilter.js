angular.module('gorillasauth.services.date-filter', [])
  
      .service('DateFilterService', ['configuration',
          function (configuration) {
  
            var dateNow = new Date();

            this.filterDateNow = function() {
                if (configuration.environment != 'development'){
                    return {
                        day: dateNow.getDay(),
                        month: dateNow.getMonth(),
                        year: dateNow.getFullYear(),
                    };
                }
                return {
                    day: 6,
                    month: 2,
                    year: dateNow.getFullYear(),
                };
            }; 

            this.filterOptions = function() {
                var filters = {
                    // TODO configurar para pegar os anos dinamicamente e nao fixos
                    years: [2015,2016,2017,2018,2019,2020,2021,2022,2023,2024,2025],
                    months: [
                        {label: 'Janeiro', value: 1},
                        {label: 'Fevereiro', value: 2},
                        {label: 'Março', value: 3},
                        {label: 'Abril', value: 4},
                        {label: 'Maio', value: 5},
                        {label: 'Junho', value: 6},
                        {label: 'Julho', value: 7},
                        {label: 'Agosto', value: 8},
                        {label: 'Setembro', value: 9},
                        {label: 'Outubro', value: 10},
                        {label: 'Novembro', value: 11},
                        {label: 'Dezembro', value: 12},
                    ]
                };
                return filters;
            }; 
  
          }
      ])
  ;
  
  