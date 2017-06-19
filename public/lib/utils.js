/* This file has some simple utility functions in it. */


// This is just so we get feedback when things go wrong:
function Fail(arg) {

    var text = 'ERROR: Likely a coding error:\n   ' +
        arg;
    var line = '-----------------------------------------------\n';
    text += '\n' + line + '  STACK TRACE\n' + line +
        (new Error()).stack + line

    console.log(text);
    alert(text);
    throw 'FAIL';
}


// This is a very common thing that fails, so we wrap it and catch it:
function GetElementById(id) {

    var ret = document.getElementById(id);
    if(typeof ret !== 'undefined' && ret !== null)
        return ret;

    Fail('document.getElementById("' + id +
        '") returned: ' + ret);
    return null;
}


function selOverlay(canvas, leftMargin, rightMargin){
    var thisObject={};
    function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }

    var context = canvas.getContext('2d');
    var pt1x=10;
    var state=0;
    var x;
    thisObject.selLow=0;
    thisObject.selHight=0;

    canvas.addEventListener('mousemove', function(evt) {
        var mousePos = getMousePos(canvas, evt);
        x=mousePos.x;
	fixOutside();
        if(state===0) {
            context.clearRect(0, 0, canvas.width, canvas.height);
	    context.fillStyle = "rgba(255, 0, 255, 0.5)";
	    context.fillRect(x-1, 0, 2, canvas.height);
        } else if (state===1) {
	    context.clearRect(0, 0, canvas.width, canvas.height);
	    context.fillStyle = "rgba(255, 0, 255, 0.5)";
	    context.fillRect(pt1x, 0, x-pt1x, canvas.height);
	}
    }, false);

    canvas.addEventListener('click', function(evt) {
        var mousePos = getMousePos(canvas, evt);
        x=mousePos.x;
        fixOutside();
        if(state===0 || state===2) {
	    pt1x=x;
	    state=1;
        } else if (state===1) {
	    state=2;
	    thisObject.selLow = ((pt1x-leftMargin)/(canvas.width-leftMargin-rightMargin));
	    thisObject.selHigh = ((x-leftMargin)/(canvas.width-leftMargin-rightMargin));
	    /*var message = 'Selected frequency range fractions: ' +
              thisObject.selLow.toFixed(2) + ' ,' +
              thisObject.selHigh.toFixed(2) + '.'; */

            var bandwidthF=(thisObject.selHigh-thisObject.selLow)*spectrum.bandwidth_;
            var centerF=spectrum.lowBound_+thisObject.selLow*spectrum.bandwidth_+bandwidthF/2;
            spectrum.selectedCenter=centerF;
            spectrum.selectedBandWidth=bandwidthF;
            var message = 'Center: ' +  centerF.toFixed(2) + 'MHz.  Bandwidth: ' + bandwidthF.toFixed(2) + ' MHz.';
	    context.font = '18pt Calibri';
	    context.fillStyle = 'black';
	    context.fillText(message, (canvas.width/2), 25);
	    document.getElementById('transmit_button').disabled=false;
	}
    }, false);

    function fixOutside(){
        if (x<leftMargin)
            x=leftMargin;
        if (x>(canvas.width-rightMargin))
            x=canvas.width-rightMargin;
    }
    /*
    thisObject.fitToContainer = function(){
	  // Make it visually fill the positioned parent
	  canvas.style.width ='100%';
	  canvas.style.height='100%';
	  // ...then set the internal size to match
	  //canvas.width  = canvas.offsetWidth;
	  //canvas.height = canvas.offsetHeight;
	  canvas.width  = 200;
	  canvas.height = 200;
	}
	*/

    return thisObject;
}
