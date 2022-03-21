(function exampleCode() {
	"use strict";

	brfv4Example.initCurrentExample = function(brfManager, resolution) {
		brfManager.init(resolution, resolution, brfv4Example.appId);
	};

	function sendEvent(eventCode){
		console.log("EVENT."+eventCode);
	}

	brfv4Example.updateCurrentExample = function(brfManager, imageData, draw) {
		brfManager.update(imageData);

		draw.clear();

		// Face detection results: a rough rectangle used to start the face tracking.

		draw.drawRects(brfManager.getAllDetectedFaces(),	false, 1.0, 0x00a1ff, 0.5);
		draw.drawRects(brfManager.getMergedDetectedFaces(),	false, 2.0, 0xffd200, 1.0);

		var faces = brfManager.getFaces(); // default: one face, only one element in that array.

		for(var i = 0; i < faces.length; i++) {

			var face = faces[i];

			if(face.state === brfv4.BRFState.FACE_TRACKING) {
				sendEvent("FACE_TRACKING_ENABLED");
				faceTracking = true;

				// simple blink detection

				// A simple approach with quite a lot false positives. Fast movement can't be
				// handled properly. This code is quite good when it comes to
				// staring contest apps though.

				// It basically compares the old positions of the eye points to the current ones.
				// If rapid movement of the current points was detected it's considered a blink.

				var v = face.vertices;

				if(_oldFaceShapeVertices.length === 0) storeFaceShapeVertices(v);

				var k, l, yLE, yRE;

				// Left eye movement (y)

				for(k = 36, l = 41, yLE = 0; k <= l; k++) {
					yLE += v[k * 2 + 1] - _oldFaceShapeVertices[k * 2 + 1];
				}
				yLE /= 6;

				// Right eye movement (y)

				for(k = 42, l = 47, yRE = 0; k <= l; k++) {
					yRE += v[k * 2 + 1] - _oldFaceShapeVertices[k * 2 + 1];
				}

				yRE /= 6;

				var yN = 0;

				// Compare to overall movement (nose y)

				yN += v[27 * 2 + 1] - _oldFaceShapeVertices[27 * 2 + 1];
				yN += v[28 * 2 + 1] - _oldFaceShapeVertices[28 * 2 + 1];
				yN += v[29 * 2 + 1] - _oldFaceShapeVertices[29 * 2 + 1];
				yN += v[30 * 2 + 1] - _oldFaceShapeVertices[30 * 2 + 1];
				yN /= 4;

				var blinkRatio = Math.abs((yLE + yRE) / yN);

				if((blinkRatio > 12 && (yLE > 0.4 || yRE > 0.4))) {
					console.log("blink " + blinkRatio.toFixed(2) + " " + yLE.toFixed(2) + " " +
						yRE.toFixed(2) + " " + yN.toFixed(2));

					blink(5000);
				}

				// Let the color of the shape show whether you blinked.

				var color = 0x00a0ff;

				// Face Tracking results: 68 facial feature points.

				draw.drawTriangles(	face.vertices, face.triangles, false, 1.0, color, 0.4);
				draw.drawVertices(	face.vertices, 2.0, false, color, 0.4);

				storeFaceShapeVertices(v);
			} else {
				sendEvent("FACE_TRACKING_DISABLED");
				faceTracking = false;
			}
		}
	};

	function blink(timeoutInMils) {
		// We are blinking, reset timeout
		if(_timeOutHandle1){
			window.clearTimeout(_timeOutHandle1);
			window.clearTimeout(_timeOutHandle2);
			window.clearTimeout(_timeOutHandle3);
		}
		
		sendEvent("BLINK_WARNING_CLOSE");

		_timeOutHandle1 = window.setTimeout(function(){
			if(faceTracking){
				sendEvent("BLINK_WARNING_OPEN_1");
			}
		}, timeoutInMils * 0.6);

		_timeOutHandle2 = window.setTimeout(function(){
			if(faceTracking){
				sendEvent("BLINK_WARNING_OPEN_2");
			}
		}, timeoutInMils * 0.8);

		_timeOutHandle3 = window.setTimeout(function(){
			if(faceTracking){
				sendEvent("BLINK_WARNING_OPEN_3");
			}
		}, timeoutInMils);
	}

	function blockingWindow(){
		var params  = 'width='+screen.width;
		params += ', height='+screen.height;
		params += ', top=0, left=0'
		params += ', fullscreen=no';
		params += ', directories=no';
		params += ', location=no';
		params += ', menubar=no';
		params += ', resizable=no';
		params += ', scrollbars=no';
		params += ', status=no';
		params += ', toolbar=no';

		var newwin=window.open("",'FullWindowAll', params);
		newwin.document.body.style.background = "#005f9c";
		newwin.document.body.innerHTML = "<div style='color: white; text-align:center; margin-top: 100px;'><h3>Please Blink</h3></div>";
		return newwin;
	}


	function storeFaceShapeVertices(vertices) {
		for(var i = 0, l = vertices.length; i < l; i++) {
			_oldFaceShapeVertices[i] = vertices[i];
		}
	}

	var _oldFaceShapeVertices = [];
	var _timeOutHandle1,_timeOutHandle2, _timeOutHandle3		= -1;
	var _popupWin = undefined;
	var faceTracking = false;

	blink(5000);
})();