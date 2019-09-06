angular.module("chart", [])
  .directive("mdChart", function () {

    function generateHashID () {
      var length           = 4;
      var result           = '';
      var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      var charactersLength = characters.length;
      for ( var i = 0; i < length; i++ ) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }

      var intDateNow = new Date().getTime();
      var randomStr = intDateNow.toString()[12] + intDateNow.toString()[11];

      return result + randomStr;
    }

    function columnLineChart(elementId, options) {
      am4core.unuseTheme(am4themes_animated);
      am4core.useTheme(am4themes_spiritedaway);
      var chart = am4core.create(elementId, am4charts.XYChart);
      chart.language.locale = am4lang_pt_BR;


      if (options.title) {
        var title = chart.titles.create();
        title.text = "[bold font-size: 20]" + options.title + '[/]\n-';
        title.textAlign = "middle";
      }

      // if (options.subtitle) {
      //   var subtitle = chart.subtitle.create();
      //   subtitle.text = "[bold font-size: 20]" + options.subtitle + '[/]\n-';
      //   subtitle.textAlign = "middle";
      // }

      // Export
      chart.exporting.menu = new am4core.ExportMenu();

      var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
      dateAxis.renderer.grid.template.location = 0;
      dateAxis.renderer.minGridDistance = 50;
      dateAxis.renderer.grid.template.disabled = true;
      dateAxis.renderer.fullWidthTooltip = true;
      dateAxis.baseInterval = {
        "timeUnit": "month"
      };

      /* Create value axis */
      var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());

      /* Create series */
      var columnSeries = chart.series.push(new am4charts.ColumnSeries());
      // columnSeries.name = "Faturamento";
      columnSeries.dataFields.valueY = "value";
      columnSeries.dataFields.dateX = "dt";

      columnSeries.columns.template.tooltipText = "[#fff font-size: 15px]\n[/][#fff font-size: 20px]{valueY}[/] [#fff]{additional}[/]";
      columnSeries.columns.template.propertyFields.fillOpacity = "fillOpacity";
      columnSeries.columns.template.propertyFields.stroke = "stroke";
      columnSeries.columns.template.propertyFields.strokeWidth = "strokeWidth";
      columnSeries.columns.template.propertyFields.strokeDasharray = "columnDash";
      columnSeries.tooltip.label.textAlign = "middle";

      return chart;
    }

    function stackedColumnChart(elementId, options) {
      am4core.unuseTheme(am4themes_spiritedaway);
      am4core.useTheme(am4themes_animated);
      var chart = am4core.create(elementId, am4charts.XYChart);
      
      if (options.title) {
        var title = chart.titles.create();
        title.text = "[bold font-size: 20]" + options.title;
        title.textAlign = "middle";
      }

      // Export
      chart.exporting.menu = new am4core.ExportMenu();

      var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
      dateAxis.renderer.grid.template.location = 0;
      dateAxis.renderer.minGridDistance = 50;
      dateAxis.renderer.grid.template.disabled = true;
      dateAxis.renderer.fullWidthTooltip = true;
      dateAxis.baseInterval = {
        "timeUnit": "month"
      };

      var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());

      // Add legend
      chart.legend = new am4charts.Legend();
      return chart;
    }

    // function pieChart(elementId, options) {
    //   var chart = am4core.create("chartdiv", am4charts.PieChart);

    //   // Add and configure Series
    //   var pieSeries = chart.series.push(new am4charts.PieSeries());
    //   pieSeries.dataFields.value = "litres";
    //   pieSeries.dataFields.category = "country";
    //   pieSeries.slices.template.stroke = am4core.color("#fff");
    //   pieSeries.slices.template.strokeWidth = 2;
    //   pieSeries.slices.template.strokeOpacity = 1;

    //   // This creates initial animation
    //   pieSeries.hiddenState.properties.opacity = 1;
    //   pieSeries.hiddenState.properties.endAngle = -90;
    //   pieSeries.hiddenState.properties.startAngle = -90;
    //   return chart;
    // }

    function createChart (elementId, options) {
      var chartReturn = null;
      switch (options.type) {
        case 'ColumnLine':
          return columnLineChart(elementId, options);
        case 'StackedColumn':
          chartReturn = stackedColumnChart(elementId, options);

          // Create series
          function createSeries(fieldValue, name, stacked) {
            var series = chartReturn.series.push(new am4charts.ColumnSeries());
            series.dataFields.valueY = fieldValue;
            series.dataFields.dateX = "data";
            series.name = name;
            series.columns.template.tooltipText = "{name}: [bold]{valueY}[/]";
            series.stacked = stacked;

            // Use to disable some serie
            if (name.indexOf('*') > -1) {
              series.hidden = true;
            }

            series.columns.template.propertyFields.fillOpacity = "fillOpacity";
            series.columns.template.propertyFields.stroke = "stroke";
            series.columns.template.propertyFields.strokeWidth = "strokeWidth";
            series.columns.template.propertyFields.strokeDasharray = "columnDash";
            series.tooltip.label.textAlign = "middle";

            // Mostra o valor dentro da coluna
            // var labelBullet = series.bullets.push(new am4charts.LabelBullet());
            // labelBullet.label.text = "{valueY}";
            // labelBullet.locationY = 0.5;
          }

          angular.forEach(options.aux, function (item) {
            var number = options.aux.indexOf(item) + 1;
            createSeries('product_'+number+'_active_value', item, true);
          });

          // TODO Desabilitado temporariamente
          // var lineSeries = chartReturn.series.push(new am4charts.LineSeries());
          // lineSeries.name = "Total";
          // lineSeries.dataFields.valueY = "active_total";
          // lineSeries.dataFields.dateX = "data";

          // lineSeries.stroke = am4core.color("#fdd400");
          // lineSeries.strokeWidth = 3;
          // lineSeries.propertyFields.strokeDasharray = "lineDash";
          // lineSeries.tooltip.label.textAlign = "middle";

          // var bullet = lineSeries.bullets.push(new am4charts.Bullet());
          // bullet.fill = am4core.color("#fdd400"); // tooltips grab fill from parent by default
          // bullet.tooltipText = "[#fff font-size: 15px]{name}:\n[/][#fff font-size: 20px]{valueY}[/] [#fff]{additional}[/]";
          // var circle = bullet.createChild(am4core.Circle);
          // circle.radius = 8;
          // circle.fill = am4core.color("#fff");
          // circle.strokeWidth = 3;

          return chartReturn;
      }
    }

  return {
    restrict: "E",
    scope: {data: '=', options: '='},
    template: "<div></div>",
    replace: true,
    link: function ($scope, element) {
      // Generate a random hash to id
      var elementId = generateHashID();
      element[0].id = elementId;

      function getDataFiltered(options, data) {
        var dataFiltered = angular.copy(data);
        return dataFiltered.map(function (item) {
          angular.forEach(options.aux, function (key) {
            var number = options.aux.indexOf(key) + 1;
            var activeValue = options.activeValue ? options.activeValue : 'value';
            item['product_'+number+'_active_value'] = item['product_'+number+'_'+activeValue];
            item['active_total'] = item['total_'+activeValue];
          });
          return item;
        });
      }

      // Create chart instance
      setTimeout(function () {
        var chart = createChart(elementId, $scope.options, $scope.data);
        // chart.data = $scope.data;
        chart.data = getDataFiltered($scope.options, $scope.data);

        // Responsible for destroy element
        $scope.$on("$destroy", function () {
          chart.dispose();
        });

        // Watch the property changes
        $scope.$watch('data', function (newVal) {
          // chart.data = newVal;
          chart.data = getDataFiltered($scope.options, newVal);
        });
        // Watch the property changes
        $scope.$watch('options', function (newVal) {
          // chart.data = newVal;
          chart.data = getDataFiltered(newVal, $scope.data);
        });
      }, 100);
      
      
    }
  };
});