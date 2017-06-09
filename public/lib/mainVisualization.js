var ipNetworkAddress = '192.168.1.';


// TODO: transparams need to be removed from this file
// instead spectrum.js will manage the data that is kept
// in what was transparams.

var transparams={f: '855000000', n: 256, b: '10000000', r:12, s: 1};

function DisplayGameControls() {
    GetElementById('speedButtonContainer2').style.display = 'inline-block';
    GetElementById('gameControllerNodeDiv').innerHTML = '';
    GetElementById('gameControllerNodeDiv').appendChild(GetSelectObjForControllableNodes());
    $("#GameControllerCurrentNode").click(ChangeGameControllerNode); 
}

function HideGameControls() {
    GetElementById('speedButtonContainer2').style.display = 'none';   
}

function DisplayViewerControls() {
    GetElementById('speedButtonContainer').style.display = 'inline-block';   
}

function HideViewerControls() {
    GetElementById('speedButtonContainer').style.display = 'none';   
}

var corStatus = (function () {
    var m_radios = null;
    //var m_nodes = [];
    var m_floorAlreadyClicked=false;
    //var m_fullscreen=false;

    var thisModule = {};
    thisModule.initialize = function () {

        socket.on('connect', function() {
            console.log('Got SocketIO "connect" in mainVisualization');
            socket.emit('radiosStatus');
        });

        socket.on('radiosStatus', function(radios) {

            console.log('Got radio status -------------');

            m_radios = radios; // We now have the status of the radios.

            radios.forEach(function(radio) {

                var materialNode = GetElementById(radio['materialId']);
                var shapeNode = GetElementById(radio['shapeId']);

                if(radio['status'] === 0) {
                    materialNode.setAttribute('diffuseColor', '0 1 0');
                    shapeNode.setAttribute('onmouseover', "oTooltip.show('"+radio['tag']+"');");
                } else {
                    materialNode.setAttribute('diffuseColor', '0.4 0.4 0');
                    shapeNode.setAttribute('onmouseover', 'oTooltip.show("'+radio['tag']+'<br>Unavailable");');
                }
            });

            RefreshSelectNodeTable();
        });

        GetElementById('specGroup').setAttribute('onclick', "corStatus.showFloors();");
        GetElementById('header').innerHTML='Floors visualization';
    };

    //onmouseover set in HTML file
    thisModule.floorFocus = function(materialId) {
        var floor = GetElementById(materialId);
        floor.setAttribute('emissiveColor', '0.1 0.1 0.1');
        floor.setAttribute('transparency', '0');
        GetElementById('x3dEl').style.cursor = 'pointer';
    };

    //onmouseout set in HTML file
    thisModule.floorUnFocus = function(materialId) {
        var floor = GetElementById(materialId);
        floor.setAttribute('emissiveColor', '0 0 0');
        floor.setAttribute('transparency', '0.2');
        GetElementById('x3dEl').style.cursor = 'default';		
    };

    thisModule.goFullscreen = function(){
        var element = document.body;
        //m_fullscreen=!m_fullscreen;
        //if (m_fullscreen) {
        if (element.requestFullScreen) {
            element.requestFullScreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullScreen) {
            element.webkitRequestFullScreen();
        }
        /*} else {
          if (element.exitFullscreen) {
          element.exitFullscreen();
          } else if (element.mozCancelFullscreen) {
          element.mozCancelFullscreen();
          } else if (element.webkitExitFullscreen) {
          element.webkitExitFullscreen();
          }
          }*/
    };

    //click
    thisModule.floorClick = function(groupId) {
        console.log('floorClick id=' + groupId);
        var group = GetElementById(groupId);
        var p = group.parentNode;
        if(m_floorAlreadyClicked) {
            for(var node = p.firstChild; node; node = node.nextSibling) {
                if(node.nodeName === 'GROUP' && node != group) {
                    console.log(node.getAttribute('id') + ' render true');
                    node.setAttribute('render', 'true');
                }
            }
            m_floorAlreadyClicked=false;
        } else {
            for(var node = p.firstChild; node; node = node.nextSibling) {
                if(node.nodeName === 'GROUP' && node != group) {
                    console.log(node.getAttribute('id') + ' render false');
                    node.setAttribute('render', 'false');
                }
            }
            m_floorAlreadyClicked=true;
        }
    };

    //
    //thisModule.showSpectrum = function(lastDigitsIP) {
    thisModule.showSpectrum = function(radioIndex) {

        if(!m_radios) return; // We have not got the radiosStatus event yet

        var radio = m_radios[radioIndex];

        if(radio['status'] !== 0) {
            console.log('showSpectrum(radioIndex=' + radioIndex +
                    ') host="'+ radio['host'] + '", addr="' +
                    radio['addr'] + '" radio is not accessible');
            return;
        }

        console.log('showSpectrum(radioIndex=' + radioIndex +
                ') host="'+ radio['host']  + '", addr="' +
                radio['addr'] + '"');


        ShowTheLaunchTutorialButton(); 
        DisplayViewerControls();

        //var nodeIndex = (lastDigitsIP - 11); 
        //var node = m_nodes[nodeIndex];
        //g_tutorialLaunchNodeIndex = nodeIndex; 
        //TODO: g_tutorialLaunchNodeIndex = radioIndex; 

        //var nodeDiffuseColor = GetElementById(node).getAttribute('diffuseColor');
        //TODO: Currently time_slices is hard coded to 10 in
        //index.html.bottom.src
        var time_slices = parseInt( GetElementById("time-slices").innerHTML );

        //if(nodeDiffuseColor == '0 1 0' || nodeDiffuseColor == '0.8 0.8 0') {

        GetElementById('floorsGroup').setAttribute('render', 'false');
        GetElementById('specGroup').setAttribute('render', 'true');
        GetElementById('view_1').position = '0 13 25';

        var yScaleComp = GetElementById("y-scale").innerHTML;
        GetElementById("elevationGridVis").scale='1 '+yScaleComp+' 1';

        var tag = 'Real-time spectrum sensing at node ' + radio['tag'];
        //var tag = 'Real-time spectrum sensing at node ' + radioIndex;

        $('#waterfall_dialog').dialog('option', 'title', tag);
        console.log('1');
        $('#graph_dialog').dialog('option', 'title', tag);

        spectrum.initialize(radio['tag'], radio['host'], radio['addr'], thisModule.showFloors);

        console.log('2');

        GetElementById('tick1-x').string=spectrum.lowBound_;
        GetElementById('tick2-x').string=spectrum.lowBound_+spectrum.bandwidth_/2;
        GetElementById('tick3-x').string=spectrum.lowBound_+spectrum.bandwidth_;
        GetElementById('tick1-y').string=0;
        GetElementById('tick2-y').string=spectrum.m_power/2;
        console.log('4');
        GetElementById('tick3-y').string=spectrum.m_power;
        GetElementById('tick1-z').string=0;
        GetElementById('tick2-z').string=-time_slices/2;
        GetElementById('tick3-z').string=-time_slices;
        console.log('5');
        GetElementById('header').innerHTML= tag;

        if(GetElementById('slow_conn_checkbox').checked) {
            GetElementById('specGroup').setAttribute('render', 'false');
            GetElementById('header').innerHTML='';
        }

        // -------------------------------------------------------------
        // Turn on UI interface controls
        // ------------------------------------------------------------
        //GetElementById('speedButtonContainer').style.display = "inline-block";

        GetElementById('tutorialButtonContainer').style.display = "inline-block";


        /*
        } else if(nodeDiffuseColor == '1 0 0') {
            alert("This node is not available. Please click on any of the green nodes");
        } else if(nodeDiffuseColor == '0.4 0.4 0') {
            alert("No USRP devices found on this node (or) this node's spectrum " +
                    "is only available to another node. Please try later or click " +
                    "on any of the green nodes");
        */
    };

    thisModule.showFloors = function(lastDigitsIP) {

        var prevHeader = GetElementById('header').innerHTML;
        var ipAddress = prevHeader.split('.');
        var lastDigits = ipAddress[3];
        GetElementById('floorsGroup').setAttribute('render', 'true');
        GetElementById('view_1').position = '0 10 15';
        GetElementById('specGroup').setAttribute('render', 'false');
        GetElementById('header').innerHTML='Floors visualization';
        GetElementById('metrics_table').innerHTML = "";
        GetElementById('launch_crts_button').innerHTML = "Launch CRTS Demo";	
        spectrum.disconnect(lastDigits);
        $('#waterfall_dialog').dialog('option', 'title',
                'Please select a node for real-time spectrum sensing');

        // -------------------------------------------------------------
        // Turn on UI interface controls
        // ------------------------------------------------------------

        CloseAllTutorialDialogs(); 
        HideTheLaunchTutorialButton(); 
        HideViewerControls(); 
        HideGameControls(); 

        $('#game_button > :first-child').attr( "src",  "icons/GameControllerOff.png");
        $('#settings_button > :first-child').attr( "src",  "icons/settings.png");
        GetElementById("sliderHider").style.display = 'none'; 
        GetElementById('settingsDiv').style.display = 'none'; 
        GetElementById('tutorialButtonContainer').style.display = "none"; 
        gameon=false;
        settings=true;
    };

    thisModule.showStatus = function(htmlStr) {
        $('#statusBox').html(htmlStr);
        $('#statusBox').fadeIn(400).delay(3000).fadeOut(400);
    };

    thisModule.launchCRTS = function(lastDigitsIP) { }
    return thisModule;
}());

window.onload=function() {

    oTooltip.init();
    function jQueryStuff() {
        //var width = $(window).width()*0.25;
        $("#waterfall_dialog").dialog({
            autoOpen: false,
            show: {
                effect: "blind",
                duration: 500
            }, hide: {
                effect: "explode",
                duration: 1000
            }, position: {
                my: "right top",
                at: "right top",
                of: window
            }, width: $(window).width()*0.7-14,
                height: $(window).height()/2,
                resizeStop: function(event, ui) {
                    //alert("Width: " + $(this).innerWidth() + ", height: " + $(this).outerHeight());   
                    //spectrum.redrawHeatmap($(this).innerWidth(), $(this).innerHeight());     
                }
                //resize will go faster
        });

        $("#waterfall_button").click(function() {
            $("#waterfall_dialog" ).dialog( "open" );
            //spectrum.redrawHeatmap();
        });

        $("#launch_crts_button").click(function() {
            // Get the parameters for CRTS
            var mod = GetElementById("mod_ctrl").value;
            if(mod.length == 1) {
                mod = "0" + mod;
            }

            var crc = GetElementById("crc_ctrl").value;

            var ifec = GetElementById("ifec_ctrl").value;
            if(ifec.length == 1) {
                ifec = "0" + ifec;
            }

            var ofec = GetElementById("ofec_ctrl").value;
            if(ofec.length == 1) {
                ofec = "0" + ofec;
            }

            var freq = Number(GetElementById("freq_input").value)*1000000;

            var bandwidth = Number(GetElementById("bandwidth_input").value)*1000000;

            var gain = $( "#slider-power" ).slider( "value" );
            gain = gain.toString();
            if(gain.length == 1) {
                gain = "0" + gain;
            }

            // Append the values of "Mod", "CRC", "IFEC", "OFEC", FREQ, and BANDWIDTH
            var parameters = {};
            parameters.mod = mod;
            parameters.crc = crc;
            parameters.ifec = ifec;
            parameters.ofec = ofec;;
            parameters.freq = freq;
            parameters.bandwidth = bandwidth;
            parameters.gain = gain;

            // Get the last two characters in the header
            var lastDigitsIP = GetElementById('header').innerHTML.slice(-2);

            // Call spectrum.launchCRTS
            spectrum.launchCRTS(lastDigitsIP, parameters);
        });

        $("#graph_dialog").dialog({
            autoOpen: false,
            show: {
                effect: "blind",
                duration: 500
            }, hide: {
                effect: "explode",
                duration: 1000
            }, position: {
                my: "right bottom",
                at: "right bottom-49",
                of: window
            },
                width: $(window).width()*0.7-14,
                height: $(window).height()/2-49,
                resizeStop: function(event, ui) {
                    //alert("Width: " + $(this).innerWidth() + ", height: " + $(this).outerHeight());   
                    //spectrum.redrawHeatmap($(this).innerWidth(), $(this).innerHeight());     
                }
                //resize will go faster
        });

        $('#graph_dialog').dialog({dialogClass:'semiTransparentWind'});

        $("#graph_button").click(function() {
            $("#graph_dialog" ).dialog( "open" );
            spectrum.fit();
            $('#transmit_button > :first-child').attr( "src",  "icons/transmitPartialOn.png");
            //spectrum.redrawHeatmap();
        });

        $("#users_button").click(function() {
            spectrum.displayUsers();
        });
        $("#rand_button").click(function() {
            spectrum.rand=!spectrum.rand;
            if (spectrum.rand) {
                $('#rand_button > :first-child').attr( "src",  "icons/RandOn.png");
            } else {
                $('#rand_button > :first-child').attr( "src",  "icons/RandOff.png");
            }
        });

        var gameon=false;

        $("#GC_CloseBtn").click(function() {
            $("#sliderHider" ).toggle();
            gameon=!gameon;  
            $('#game_button > :first-child').attr( "src",  "icons/GameControllerOff.png");
        })

        $("#game_button" ).click(function() {
            // $( "#transmit_button" ).toggle();
            $("#sliderHider" ).toggle();
            // $("#scoreArea" ).toggle();
            gameon=!gameon;
            if(gameon) {
                $('#game_button > :first-child').attr( "src",  "icons/GameControllerOn.png");
                var selectedNodeIndex = 0; // default to the first Node
                var nodeId = GetNodeConfigIdValueFromNodeIndex(selectedNodeIndex);
                g_gameController.currentNodeIndex = 0; 
                g_gameController.currentNodeId = nodeId; 
                var theNodeSelector = GetElementById('GameControllerCurrentNode');
                theNodeSelector.selectedIndex = 0; 
                SetUIControlValuesFromNode(nodeId);
            } else {
                var time_slices = GetElementById("time-slices").innerHTML;
                $('#game_button > :first-child').attr( "src",  "icons/GameControllerOff.png");
                GetElementById('tick1-x').string=spectrum.lowBound_;
                GetElementById('tick2-x').string=spectrum.lowBound_+spectrum.bandwidth_/2;
                GetElementById('tick3-x').string=spectrum.lowBound_+spectrum.bandwidth_;
                GetElementById('tick1-y').string=0;
                GetElementById('tick2-y').string=spectrum.m_power/2;
                GetElementById('tick3-y').string=spectrum.m_power;
                GetElementById('tick1-z').string=0;
                GetElementById('tick2-z').string=-time_slices/2;
                GetElementById('tick3-z').string=-time_slices;	
            }
        });

        var settings=true;
        $("#SVC_CloseBtn").click(function() {
            $("#settingsDiv" ).toggle();
            settings=!settings;  
            $('#settings_button > :first-child').attr( "src",  "icons/settings.png");
        })

        $("#settings_button").click(function() {
            $("#settingsDiv" ).toggle();
            settings=!settings;
            if(settings) {
                $('#settings_button > :first-child').attr( "src",  "icons/settings.png");
                //send to server
                transparams.f=Number(GetElementById('f').value)*1000000;
                transparams.n=GetElementById('n').value;
                transparams.b=Number(GetElementById('b').value)*1000000;
                transparams.s=GetElementById('s').value;
                transparams.r=GetElementById('r').value;
                spectrum.updateParams(transparams);

                var time_slices = parseInt(GetElementById("time-slices").innerHTML);

                spectrum.updateTimeSlices(time_slices);
                GetElementById('tick1-x').string=spectrum.lowBound_;
                GetElementById('tick2-x').string=spectrum.lowBound_+spectrum.bandwidth_/2;
                GetElementById('tick3-x').string=spectrum.lowBound_+spectrum.bandwidth_;
                GetElementById('tick1-y').string=0;
                GetElementById('tick2-y').string=spectrum.m_power/2;
                GetElementById('tick3-y').string=spectrum.m_power;
                GetElementById('tick1-z').string=0;
                GetElementById('tick2-z').string=-time_slices/2;
                GetElementById('tick3-z').string=-time_slices;

                var yScaleComp = GetElementById("y-scale").innerHTML;
                GetElementById("elevationGridVis").scale='1 '+yScaleComp+' 1';

            } else {

                $('#settings_button > :first-child').attr( "src",  "icons/checkmark.png");
            }
        });

        $(document).keypress(function(e) {
            if(e.which == 13) {

                if(settings == false) {
                    $( "#settings_button" ).click();
                }

                if($('#game_button > :first-child').
                        attr( "src") == "icons/GameOn.png") {
                    $('#game_button > :first-child').attr("src", "icons/GameControllerOff.png");
                    $("#game_button").click();
                }
            }
        });

        $("#transmit_button").click(function() {
            spectrum.m_transmit=!spectrum.m_transmit;
            if (spectrum.m_transmit) {
                $('#transmit_button > :first-child').attr( "src", "icons/transmitOn.png");
                var e = GetElementById("mod_ctrl");
                var sel1 = e.options[e.selectedIndex].text;
                e = GetElementById("crc_ctrl");
                var sel2 = e.options[e.selectedIndex].text;
                e = GetElementById("ifec_ctrl");
                var sel3 = e.options[e.selectedIndex].text;
                e = GetElementById("ofec_ctrl");
                var sel4 = e.options[e.selectedIndex].text;

                //alert(sel1 + ' ' + sel2 + ' ' + sel3 + ' ' + sel4 + ' ' +
                // $( "#slider-delay" ).slider( "value" ) + ' ' +
                // $( "#slider-packet" ).slider( "value" ) + ' ' +
                // $( "#slider-power" ).slider( "value" ));
                //alert(spectrum.selectedCenter + ' ' + spectrum.selectedBandWidth);

                spectrum.setParamsCRTS({cfreq: Number(spectrum.selectedCenter) * 1000000,
                    bfreq: Number(spectrum.selectedBandWidth) * 1000000,
                    TXgain: $( "#slider-power" ).slider( "value" ),
                    packet: $( "#slider-packet" ).slider( "value" ),
                    delay: Number($( "#slider-delay" ).slider( "value" )) * 1000,
                    mod: sel1,
                    crc: sel2,
                    ifec: sel3,
                    ofec: sel4,
                    nodeID: 25
                });
                GetElementById('metrics_button').disabled=false;
            } else {
                $('#transmit_button > :first-child').attr("src", "icons/transmitPartialOn.png");
                spectrum.stopCTRS();
            }
        });
        $( "#metrics_dialog" ).dialog({
            autoOpen: false,
            show: {
                effect: "blind",
                duration: 500
            },
            hide: {
                effect: "explode",
                duration: 1000
            },
            position: { my: "center bottom", at: "center bottom-61", of: window },
            width: $(window).width()*0.3-14,
            height: $(window).height()/2-100,
            resizeStop: function(event, ui) {
                //alert("Width: " + $(this).innerWidth() + ", height: " + $(this).outerHeight());   
                //spectrum.redrawHeatmap($(this).innerWidth(), $(this).innerHeight());     
            }
            //resize will go faster
        });

        //$('#metrics_dialog').dialog({dialogClass:'semiTransparentWind'});

        // PERFORMANCE METRICS
        $( "#metrics_button" ).click(function() {
            var metricsDiv = GetElementById('performanceMetricDiv');
            var currentDisplayMode = metricsDiv.style.display; 
            if (currentDisplayMode === 'block')
            {
                metricsDiv.style.display = 'none'; 
            }
            else
            {
                spectrum.getMetrics();
                metricsDiv.style.display = 'block'; 
            } 
        });
        $('#PM_CloseBtn').click(function() {
            var metricsDiv = GetElementById('performanceMetricDiv');
            metricsDiv.style.display = 'none'; 
        });
        //slider
        $("#slider-power").slider({
            orientation: "horizontal",
            range: "min",
            min: 0,
            max: 31,
            value: 20,
            slide: function( event, ui ) {
                $( "#amount-power" ).html( ui.value );
                spectrum.m_power=ui.value;
                var size=28.571+(ui.value)*0.5714;
                $('#icon-power').width(size).height(1.5*size);
            }
        });
        $("#amount-power").val( $( "#slider-power" ).slider( "value" ) );
        $("#slider-packet").slider({
            orientation: "horizontal",
            range: "min",
            min: 1,
            step: 1,
            max: 100,
            value: 25,
            slide: function( event, ui ) {
                $( "#amount-packet" ).html( ui.value );
                //spectrum.m_power=ui.value;
                var size=20+(ui.value)*0.2;
                $('#icon-packet').width(1.2*size).height(1.2*size);
            }
        });
        $("#amount-packet").val( $( "#slider-packet" ).slider( "value" ) );
        $("#slider-delay").slider({
            orientation: "horizontal",
            range: "min",
            min: 100,
            max: 2000,
            value: 1000,
            slide: function( event, ui ) {
                $( "#amount-delay" ).html( ui.value );
                spectrum.m_power=ui.value;
                var size=19+(ui.value)*0.01;
                $('#icon-delay').width(size).height(1.5*size);
            }
        });
        $("#amount-delay").val( $( "#slider-delay" ).slider( "value" ) );


        $("#slider-y-scale").slider({
            orientation: "horizontal",
            range: "min",
            min: 3,
            max: 15,
            value: 10,
            slide: function( event, ui ) {
                $( "#y-scale" ).html( ui.value/10 );
            }
        });

        $("#y-scale").val( $( "#slider-y-scale" ).slider( "value" ) );


        $("#slider-time-slices").slider({
            orientation: "horizontal",
            range: "min",
            min: 2,
            max: 25,
            value: 10,
            slide: function( event, ui ) {
                $( "#time-slices" ).html( ui.value );
            }
        });

        $("#time-slices").val( $( "#slider-time-slices" ).slider( "value" ) );

        //***************************************************************************
        // spectrum.redrawHeatmap();
        //***************************************************************************
        var width = $(window).width()*0.3;
        var height = $(window).height()-49;
        $( "#help_dialog" ).dialog({
            autoOpen: false,
            show: {
                effect: "blind",
                duration: 500
            },
            hide: {
                effect: "explode",
                duration: 1000
            },
            position: { my: "left top", at: "left top", of: window },
            width: width,
            height: height
        });
        $('#help_dialog').dialog({dialogClass:'semiTransparentWind'});

        $("#waterfall_dialog").dialog({
            autoOpen: false,
            show: {
                effect: "blind",
                duration: 500
            },
            hide: {
                effect: "explode",
                duration: 1000
            },
            position: { my: "right top", at: "right top", of: window },
            width: $(window).width()*0.7-14,
            height: $(window).height()/2,
            resizeStop: function(event, ui) {
                //alert("Width: " + $(this).innerWidth() + ", height: " + $(this).outerHeight());   
                //spectrum.redrawHeatmap($(this).innerWidth(), $(this).innerHeight());     
            }
            //resize will go faster
        });

        $("#waterfall_button").click(function() {
            $( "#waterfall_dialog" ).dialog( "open" );
            //spectrum.redrawHeatmap();
        });

        $("#help_button").click(function() {
            $( "#help_dialog" ).dialog( "open" );
        });

        $('#slow_conn_checkbox').change(function() {
            var floorsGroupRender =
                GetElementById('floorsGroup').getAttribute('render');
            if(floorsGroupRender == "false")
            {
                if(this.checked)
                {
                    GetElementById('specGroup').setAttribute('render', 'false');
                    GetElementById('header').innerHTML='';
                }
                else
                {
                    // Get the last digits in IP
                    var lastDigitsIP = ($('#waterfall_dialog').
                            dialog("option","title")).split(".");
                    corStatus.showSpectrum(lastDigitsIP[3]);
                    GetElementById('header').innerHTML=
                        'Real-time spectrum sensing at node ' +
                        ipNetworkAddress + lastDigitsIP;
                }
            }	
        });
        var coverLayer = $('<div>').appendTo("body").css({
            "width" : "100%", "height" : "100%", "z-index" : "2",
            "background-color" : "rgba(0, 0, 0, 0.5)", "position" : "absolute"
        }).hide();
        
        $(".ui-dialog").on( "resizestart dragstart" , function( event, ui ) { 
            coverLayer.show();
            // here you can add some code that will pause webgl while user works
            // with ui, so resizing and moving will be faster and smoother
        });
        
        $(".ui-dialog").on( "resizestop dragstop" , function( event, ui ) { 
            coverLayer.hide();
            // here you unpause webgl
        });
        function pulseIn(control) {
            control.animate({
                backgroundColor: "rgba(255,0,0,0.9)"
            }, 1000, 'swing', function () {
                pulseOut(control);
            });
        }
        function pulseOut(control) {
            control.animate({
                backgroundColor: "rgba(50,50,50,0.5)"
            }, 1000, 'swing', function () {
                pulseIn(control);
            });
        }
        var help_button='#help_button';
        $(help_button).each(function(){
            pulseIn($(this));
        });
        setTimeout(function() {
            $(help_button).stop();
            $(help_button).css('background-color', 'rgba(50,50,50,0.5)');
        }, 10000);
    };

    // We use tag ids, for example: node3color floor1mat

    if (window.WebGLRenderingContext){
        corStatus.initialize();
        //oTooltip.init();
        jQueryStuff();
    } else {
        document.write('<div id="x3dEl"><img height="100%" width="100%" src="noWebGL.jpg"></div>');
    }
};



