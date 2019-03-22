angular.module('gorillasauth.services.date-filter', [])
  
      .service('DateFilterService', ['configuration',
          function (configuration) {
  
            this.filterDateNow = function(date) {
                var dateNow = date ? date : new Date();
                
                if (configuration.environment != 'development'){
                    return {
                        day: dateNow.getDate(),
                        month: dateNow.getMonth() + 1,
                        year: dateNow.getFullYear(),
                    };
                }
                return {
                    day: 6,
                    month: 2,
                    year: 2018,
                };
            }; 
            this.getDateNow = function(date) {
                var dateNow = new Date();
                
                if (configuration.environment == 'development'){
                    dateNow.setFullYear(2018);
                    dateNow.setMonth(1);
                    dateNow.setDate(20);
                    dateNow.setHours(12);
                } else {
                    dateNow.setHours(12)
                    dateNow.setDate(dateNow.getDate()-1);
                }
                return dateNow;
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
  
  
