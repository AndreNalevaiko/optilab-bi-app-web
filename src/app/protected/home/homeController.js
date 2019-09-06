angular.module('gorillasauth.protected.home')

.controller('HomeController', ['$scope','$mdDialog','DateFilterService', 'CustomerService', 
    'NotificationService', 'configuration',
    function ($scope, $mdDialog, DateFilterService, CustomerService, NotificationService, configuration) {
        var self = this;
        self.loading = false;
        self.customers= [];

        self.dateFilter = DateFilterService.getDateNow();
        self.maxDate = self.dateFilter;

        self.search = {
            code: null,
            name: null,
            group: null
        };

        function generateFilters() {
            var filters = {};

            if (self.search.code) {
                filters.customer_code = self.search.code;
            }
            if (self.search.name) {
                filters.customer_name = self.search.name;
            }
            if (self.search.group) {
                filters.group_customer = self.search.group;
            }

            return filters;
        }

        self.searchCustomers = function () {
            var filters = generateFilters();
            if (!Object.keys(filters).length) {
                NotificationService.error('É necessário preencher ao menos um campo para a busca');
                return;
            }
            self.loading = true;
            CustomerService.search(filters).then(function (response) {
                self.customers = response;
                if (!response.length) {
                    NotificationService.error('Não foi encontrado nenhum resultado');
                }
                self.loading = false;
            }, function (error) {
                NotificationService.error('Ops! Ocorreu ao fazer a pesquisa!');
                self.loading = false;
            });
        };

        self.openCustomer = function (event, customer) {
            CustomerService.searchCustomerBillings(self.dateFilter, customer.customer_code).then(function (response){
                self.customerSelected = normalizeBillings(response)[0];
                self.selectedTab = 1;
            });
        };

        self.openCustomerInfo = function (ev) {
            var customer = self.customerSelected;
            $mdDialog.show({
                controller: 'CustomerDialogController as ctrl',
                fullscreen: true,
                locals: {
                customer: customer,
                status: CustomerService.getIsOverdue(customer.clicodigo, self.dateFilter, 'customer'),
                info: CustomerService.getInfos(customer.clicodigo)
                },
                parent: angular.element(document.body),
                templateUrl: 'protected/customers/dialogs/customer.tpl.html',
                targetEvent: ev,
                clickOutsideToClose: true
            }).then(function (result) {
                console.log('Dialog Confirmed');
            }, function (){
                console.log('Canceled Operation');
            });
        };

        self.openCustomerDetail = function (ev) {
            var customer = self.customerSelected;
            $mdDialog.show({
              controller: 'CustomerDetailDialogController as ctrl',
              fullscreen: true,
              locals: {
                date: self.dateFilter,
                customer: customer,
                products: CustomerService.searchCustomerProducts(self.dateFilter, customer.customer_code),
                productsAllYear: CustomerService.searchCustomerProductsAllYear(self.dateFilter, customer.customer_code),
              },
              parent: angular.element(document.body),
              templateUrl: 'protected/customers/dialogs/customerDetail.tpl.html',
              targetEvent: ev,
              clickOutsideToClose: true
            }).then(function (result) {
              console.log('Dialog Confirmed');
            }, function (){
              console.log('Canceled Operation');
            });
          };
    
          self.openCustomerPeriodDetail = function (ev, period) {
            var customer = self.customerSelected;
            $mdDialog.show({
              controller: 'CustomerPeriodDetailDialogController as ctrl',
              fullscreen: true,
              locals: {
                date: self.dateFilter,
                customer: customer,
                periods: CustomerService.searchCustomerBillsPerMonth(self.dateFilter, customer.customer_code, period),
                currentPeriod: CustomerService.searchCustomerProducts(self.dateFilter, customer.customer_code),
                period: period,
                type: 'customer',
              },
              parent: angular.element(document.body),
              templateUrl: 'protected/customers/dialogs/customerPeriodDetail.tpl.html',
              targetEvent: ev,
              clickOutsideToClose: true
            }).then(function (result) {
              console.log('Dialog Confirmed');
            }, function (){
              console.log('Canceled Operation');
            });
          };


        function normalizeBillings(billings) {
            return billings.map(function(obj) {
                // var re = new RegExp(/^[0-9]+/g);
                obj.clicodigo = obj.customer_code;
                obj.avg_month_qtd_current_year = parseInt(obj.avg_month_qtd_current_year);
                obj.avg_month_qtd_last_year = parseInt(obj.avg_month_qtd_last_year);
                if (isNaN(obj.avg_month_qtd_last_year)) {
                    obj.avg_month_qtd_last_year = 0;
                }
                obj.qtd_current_month = parseInt(obj.qtd_current_month);
                obj.avg_month_value_current_year = Number(obj.avg_month_value_current_year);
                obj.avg_month_value_last_year = Number(obj.avg_month_value_last_year);
                obj.value_current_month = Number(obj.value_current_month);

                obj.comparison_qtd = (obj.qtd_current_month / self.dateFilter.getDate()) / 
                (obj.avg_month_qtd_current_year / (self.dateFilter.getMonth() != 0 ? 30 : self.dateFilter.getDate()));

                obj.comparison_value = (obj.value_current_month / self.dateFilter.getDate()) /
                (obj.avg_month_value_current_year / (self.dateFilter.getMonth() != 0 ? 30 : self.dateFilter.getDate()));

                obj.comparison_qtd = obj.comparison_qtd == 0  || Number.isNaN(obj.comparison_qtd) ? -0.0001 : obj.comparison_qtd;
                obj.comparison_value = obj.comparison_value == 0 || Number.isNaN(obj.comparison_value) ? -0.0001 : obj.comparison_value;
                
                obj.comparison_qtd = obj.qtd_current_month == 0 && obj.avg_month_qtd_current_year != 0 ? -1 : obj.comparison_qtd;
                obj.comparison_value = obj.value_current_month == 0 && obj.avg_month_value_current_year != 0 ? -1 : obj.comparison_value;

                obj.comparison_qtd = obj.qtd_current_month != 0 && obj.avg_month_qtd_current_year == 0 ? 1 : obj.comparison_qtd;
                obj.comparison_value = obj.value_current_month != 0 && obj.avg_month_value_current_year == 0 ? 1 : obj.comparison_value;
                return obj;
            });
        }
    }
]);