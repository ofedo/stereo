/**
 * Customised version of
 * @project        Motion Detection in JS
 * @file           ImageCompare.js
 * @description    Core functionality.
 * @author         Benjamin Horn
 * @package        MotionDetector
 * @version        -
 *
 */

;(function(App) {

	"use strict";

	/*
	 * The core motion detector. Does all the work.
	 *
	 * @return <Object> The initalized object.
	 *
	 */
	App.Core = function(_width = 1024, _height = 640, _optimize = 15, _timeout = 1000/60) {

		var rendering = false;

    var optimize = _optimize;
		var width = _width / optimize;
		var height = _height / optimize;

		var webCam = null;
		var imageCompare = null;

		var currentImage = null;
		var oldImage = null;

		var topLeft = [Infinity,Infinity];
		var bottomRight = [0,0];

        var diffPixels = [];

		var raf = (function(){
			return  window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame ||
			function( callback ){
				window.setTimeout(callback, _timeout);
			};
		})();

		/*
		 * Initializes the object.
		 *
		 * @return void.
		 *
		 */
		function initialize() {
			imageCompare = new App.ImageCompare();
			webCam = new App.WebCamCapture(document.getElementById('webCamWindow'));

			rendering = true;

			main();
		}

		/*
		 * Compares to images and updates the position
		 * of the motion div.
		 *
		 * @return void.
		 *
		 */
		function render() {
			oldImage = currentImage;
			currentImage = webCam.captureImage(false);

			if(!oldImage || !currentImage) {
				return;
			}

			var vals = imageCompare.compare(currentImage, oldImage, width, height);

			topLeft[0] = vals.topLeft[0] * optimize;
			topLeft[1] = vals.topLeft[1] * optimize;

			bottomRight[0] = vals.bottomRight[0] * optimize;
			bottomRight[1] = vals.bottomRight[1] * optimize;

			if (topLeft[0] != 'Infinity' && topLeft[1] != 'Infinity' &&
					bottomRight[0] != 'Infinity' && bottomRight[1] != 'Infinity') {
						var webCamWindow = document.getElementById('webCamWindow');
						// console.log(webCamWindow.offsetLeft);
				document.getElementById('movement').style.left = webCamWindow.offsetLeft + topLeft[0] + 'px';
				document.getElementById('movement').style.top = webCamWindow.offsetTop + topLeft[1] + 'px';
				document.getElementById('movement').style.width = (bottomRight[0] - topLeft[0]) + 'px';
				document.getElementById('movement').style.height = (bottomRight[1] - topLeft[1]) + 'px';
			}

			// console.log(vals.diffPixels.length);
      if (vals.diffPixels.length && vals.diffPixels.length < 200) {
				if (typeof checkForNext !== 'undefined') {
	      	checkForNext(topLeft[0] + (bottomRight[0] - topLeft[0]), topLeft[1] + (bottomRight[1] - topLeft[1]));
				}
				if (typeof doMovementCompare !== 'undefined') {
					doMovementCompare(topLeft, bottomRight);
				}

        for (var i = 0; i < vals.diffPixels.length; i++) {
          if (vals.diffPixels[i] != undefined) {
              diffPixels[i] = [vals.diffPixels[i][0] * optimize + 125, vals.diffPixels[i][1] * optimize + 50, vals.diffPixels[i][2], vals.diffPixels[i][3]];
          }
        }

				if (typeof drawPixels !== 'undefined') {
	      	drawPixels(diffPixels, webCam.captureImage(false));
				}
      }

      diffPixels = [];

			topLeft = [Infinity,Infinity];
			bottomRight = [0,0]

		}

		/*
		 * The main rendering loop.
		 *
		 * @return void.
		 *
		 */
		function main() {
			try{
				render();
			} catch(e) {
				console.log(e);
				return;
			}

			if(rendering == true) {
				raf(main.bind(this));
			}
		}

		initialize();
	};
})(MotionDetector);
