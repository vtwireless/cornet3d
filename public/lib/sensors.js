var sensors = (function () {
	var m_transform='rootT';
	var oriOn=false;
	var prevTime=0;
	var rotateTransform=true;
	var invert=1;

	window.addEventListener("devicemotion", function (event) {
		var acceleration = Math.sqrt(Math.pow(event.acceleration.x, 2) + Math.pow(event.acceleration.y, 2) + Math.pow(event.acceleration.z, 2));
		if (acceleration > 30 && (event.timeStamp - prevTime) > 300000) {
			prevTime = event.timeStamp;
			//alert(acceleration + " " + event.timeStamp);
			//fullscreenOn();
			oriOnOff();
		}
	}, false);

	var sensorHandler = function (event) {
		/*
		document.getElementById("alpha").innerHTML = "alpha = " + event.alpha;
		document.getElementById("beta").innerHTML = "beta = " + event.beta;
		document.getElementById("gamma").innerHTML = "gamma = " + event.gamma;
		*/
		if (event.alpha !== null && event.beta !== null && event.gamma !== null) {
			var alpha, beta, gamma;
			alpha = (event.alpha) / 180 * Math.PI * invert;
			beta = (event.beta) / 180 * Math.PI * invert;
			gamma = (event.gamma) / 180 * Math.PI * invert;
			gamma=0;
			beta=0;
			//Portrait
			rotateModel(beta, gamma, -alpha - Math.PI / 2);
		}
	};

	function oriOnOff() {
		if (oriOn) {
			window.removeEventListener('deviceorientation', sensorHandler, false);
			oriOn = false;
		} else {
			window.addEventListener('deviceorientation', sensorHandler, false);
			oriOn = true;
		}
	}

	function rotateModel(heading, attitude, bank) {
		// Assuming the angles are in radians.
		var c1 = Math.cos(heading / 2);
		var s1 = Math.sin(heading / 2);
		var c2 = Math.cos(attitude / 2);
		var s2 = Math.sin(attitude / 2);
		var c3 = Math.cos(bank / 2);
		var s3 = Math.sin(bank / 2);
		var c1c2 = c1 * c2;
		var s1s2 = s1 * s2;
		var w = c1c2 * c3 - s1s2 * s3;
		var x = c1c2 * s3 + s1s2 * c3;
		var y = s1 * c2 * c3 + c1 * s2 * s3;
		var z = c1 * s2 * c3 - s1 * c2 * s3;
		var angle = 2 * Math.acos(w);
		var norm = x * x + y * y + z * z;
		if (norm < 0.001) { // when all euler angles are zero angle =0 so
			// we can set axis to anything to avoid divide by zero
			x = 1;
			y = z = 0;
		} else {
			norm = Math.sqrt(norm);
			x /= norm;
			y /= norm;
			z /= norm;
		}
		//document.getElementById("axis_angle").innerHTML = 'Axis = ' + x + ' ' + y + ' ' + z + '  Angle = ' + angle;
		if (rotateTransform) {
			//document.getElementById("superroot").setAttribute("rotation", x + " " + y + " " + z + " " + angle);viewTransform
			document.getElementById(m_transform).setAttribute("rotation", x + " " + y + " " + z + " " + angle);
		} else {
			document.getElementById("view_0").setAttribute("orientation", x + " " + y + " " + z + " " + angle);
		}
	}
	//return thisModule;
}());