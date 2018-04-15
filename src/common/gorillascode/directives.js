angular.module('gorillascode.directives', [])

  .directive('scrollBottomNotifier', [
    function () {
      return {
        restrict: 'A',
        link: function ($scope, element, attrs) {
          var raw = element[0];
          element.bind('scroll', function () {
            if (raw.scrollTop + raw.offsetHeight >= raw.scrollHeight) {
              $scope.$broadcast('scrollBottomEvent');
            }
          });
        }
      };
    }
  ])

  /**
   * Adaptado de https://github.com/czarpino/angular-fix-image-orientation
   */
  .directive('imgFixOrientation', [
    function () {
      return {
        restrict: 'A',
        scope: {
          'imgFixOrientation': '='
        },
        link: function (scope, element, attrs) {
          var imageUrl = scope.imgFixOrientation;

          if (0 === imageUrl.indexOf('data:image')) {
            var base64 = imageUrl.split(',')[1];
            var exifData = EXIF.readFromBinaryFile(base64ToArrayBuffer(base64));
            reOrient(parseInt(exifData.Orientation || 1, 10), element);
          }
          else {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", imageUrl, true);
            xhr.responseType = "arraybuffer";
            xhr.onload = function (e) {
              var arrayBuffer = new Uint8Array(this.response);
              var exifData = EXIF.readFromBinaryFile(arrayBuffer.buffer);
              reOrient(parseInt(exifData.Orientation || 1, 10), element);
            };
            xhr.send();
          }
        }
      };

      /**
       * Convert base64 string to array buffer.
       *
       * @param {string} base64
       * @returns {object}
       */
      function base64ToArrayBuffer(base64) {
        var binaryString = window.atob(base64);
        var len = binaryString.length;
        var bytes = new Uint8Array(len);

        for (var i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        return bytes.buffer;
      }

      /**
       * Reorient specified element.
       *
       * @param {number} orientation
       * @param {object} element
       * @returns {undefined}
       */
      function reOrient(orientation, element) {
        switch (orientation) {
          case 1:
            element.css({
              'transform': 'rotate(0deg)'
            });
            break;
          case 2:
            element.css({
              '-moz-transform': 'scaleX(-1)',
              '-o-transform': 'scaleX(-1)',
              '-webkit-transform': 'scaleX(-1)',
              'transform': 'scaleX(-1)',
              'filter': 'FlipH',
              '-ms-filter': "FlipH"
            });
            break;
          case 3:
            element.css({
              'transform': 'rotate(180deg)'
            });
            break;
          case 4:
            element.css({
              '-moz-transform': 'scaleX(-1)',
              '-o-transform': 'scaleX(-1)',
              '-webkit-transform': 'scaleX(-1)',
              'transform': 'scaleX(-1) rotate(180deg)',
              'filter': 'FlipH',
              '-ms-filter': "FlipH"
            });
            break;
          case 5:
            element.css({
              '-moz-transform': 'scaleX(-1)',
              '-o-transform': 'scaleX(-1)',
              '-webkit-transform': 'scaleX(-1)',
              'transform': 'scaleX(-1) rotate(90deg)',
              'filter': 'FlipH',
              '-ms-filter': "FlipH"
            });
            break;
          case 6:
            element.css({
              'transform': 'rotate(90deg)'
            });
            break;
          case 7:
            element.css({
              '-moz-transform': 'scaleX(-1)',
              '-o-transform': 'scaleX(-1)',
              '-webkit-transform': 'scaleX(-1)',
              'transform': 'scaleX(-1) rotate(-90deg)',
              'filter': 'FlipH',
              '-ms-filter': "FlipH"
            });
            break;
          case 8:
            element.css({
              'transform': 'rotate(-90deg)'
            });
            break;
        }
      }
    }
  ])

;
