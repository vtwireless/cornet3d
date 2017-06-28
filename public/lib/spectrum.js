/************************************************************************
 *   spectrum   is a javaScript global singleton object
 *
 *  spectrum has 3 different HTML page displayed plots all in
 *  different HTML <div> or <canvas> elements:
 *
 *      1 - X3D canvas 3D water fall plotter
 *
 *      2 - 2D water fall (scaler field contour) plotter
 *
 *      3 - 2D scope-like function trace plotter
 *
 *
 *    Not all 3 plots are necessarily displayed in the browser page at
 *    once.  All 3 plotters use the same input feed.
 *
 *
 ************************************************************************/
var spectrum = (function () {
    var m_specrumTimeSlices;
    var m_colorTimeSlices;
    var m_arrSpecrumTimeSlices;
    var m_grid;
    var m_slices;
    var m_width;
    var m_count;
    var m_gridID;
    var m_gridColorID;
    var m_heatmapDivID;
    var m_IPID;
    var empty;
    var m_maxval=4;
    var m_canvasID="cvs";
    var graphData = [400, 800, 300, 400, 600, 900, 500, 900, 100];
    var graphLabels = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    var m_showfloors;
    var fineGrain=true;
    var m_showStatus;

    // period that the data is sent at from the spectrum server
    var m_period;
    var m_highBand; // in Mega Hz as float
    var m_lowBand; // in Mega Hz as float
    var m_numBins; // integer
    // TODO: What is the "Number of sweeps" shown in the widget

    //var transparams= {f: '855000000', n: 256, b: '10000000', r:12, s: 1};

    //var m_overlay;
    var leftGraphMargin=70;
    var rightGraphMargin=30;
    var thisModule = {};
    thisModule.m_transmit=false;
    thisModule.m_power=50;
    var scoreDiv='scoreDiv';
    var scoreTotal=0;
    var crtsSocket;
    //in MHZ
    //var centerF_=855;
    //thisModule.bandwidth_=12;
    //thisModule.lowBound_=centerF_-thisModule.bandwidth_/2;
    //thisModule.selectedBandWidth=0;
    //var highBound_=centerF_+thisModule.bandwidth_/2;

    var trans_x = [];
    trans_x.push({translation:0 , bandwidth:0});
    // for coloring the boxes
    var diffue_color = ['green','blue','red','teal','lightsalmon','orange'];
    var spectrum_data;
    /* accepts parameters
     * h  Object = {h:x, s:y, v:z}
     * OR 
     * h, s, v
     */

    function isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    function numberWithCommas(x) {
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    }

    function processResponse(data, radio) {
        //alert(data[2]);
        //TODO: why we are mapping the data here?

        console.log("SPECTRUM data= " + data);

        //var data = data.map(function(x) { return Math.log(x)*0.5 + 4; });
        spectrum_data = data;
        //to avoid displaying negative data values as height and color	
        for(var i=0; i<data.length; i++)
            if(data[i] < 0)
                data[i]= 0;

        if(data.length<2){
            m_showfloors();
            m_showStatus('<span style="color:red;">Spectral data not available.  ' +
                    'Please try a different node or turn on random mode.</span>');
            return true; // We are done processing.
        }

        //Graph
        graphLabels=[];
        var nticks=10;
        for(var i=0; i<=nticks; i++)
            graphLabels.push(Math.round(m_lowBand + i*m_bandWidth/(nticks)));

        makeGraph(m_canvasID, data, graphLabels);

        m_grid=GetElementById(m_gridID);

        var colorGrid=GetElementById(m_gridColorID);
        //alert(colorGrid.id);
        if(m_count==0) {
            m_width=data.length;
            m_specrumTimeSlices=[];
            m_colorTimeSlices=[];
            m_arrSpecrumTimeSlices=[];
            empty = Array.apply(null, new Array(m_width)).map(Number.prototype.valueOf,0);
            //var emptyColor = Array.apply(null, new Array(m_width)).map(Number.prototype.valueOf,1);
            //m_specrumTimeSlices.push(data.join(" "));
            m_specrumTimeSlices.push(data.join(" "));
            m_colorTimeSlices.push(dataToColor(data).join(" "));
            m_arrSpecrumTimeSlices.push(data);


            for(var i=0; i<(m_slices); i++) {
                m_specrumTimeSlices.push(empty.join(" "));
                m_colorTimeSlices.push(dataToColor(empty).join(" "));
                m_arrSpecrumTimeSlices.push(empty);
            }

            m_count=1;
        } else {
            for(var i=0;i<2;i++){
                m_specrumTimeSlices.pop();
                m_colorTimeSlices.pop();
                m_arrSpecrumTimeSlices.pop();
            }
            if(data.length>m_width){
                data=data.slice(0,m_width);
            }
            if(data.length<m_width){
                data.push(empty.slice(0, (m_width-data.length)));
            }

            m_specrumTimeSlices.unshift(data.join(" "));
            m_colorTimeSlices.unshift(dataToColor(data).join(" "));
            m_arrSpecrumTimeSlices.unshift(data);
        }
        empty = Array.apply(null, new Array(m_width)).map(Number.prototype.valueOf,0);
        m_specrumTimeSlices[m_slices] = empty.join(" ");
        m_colorTimeSlices[m_slices] = dataToColor(empty).join(" ");
        m_arrSpecrumTimeSlices[m_slices] = empty;
        //2D d3.js heatmap
        thisModule.redrawHeatmap();

        var gridStr = m_specrumTimeSlices.join(" ");
        var colorStr = m_colorTimeSlices.join(" ");

        colorGrid.color = colorStr;
        m_grid.setAttribute("xDimension", m_width);
        m_grid.setAttribute("zDimension", m_slices+1);
        m_grid.setAttribute("xspacing", 20.25/(m_width-1));
        m_grid.setAttribute("zspacing", 6.81/(m_slices-1));
        m_grid.setAttribute("height", gridStr);

        //alert(colorStr.split(' ').length + ' ' + gridStr.split(' ').length);

        //reload
        var container = m_grid.parentNode;
        var content = container.innerHTML;
        container.innerHTML = content;
        return false; // sucess
    }

    function fitToContainer(canvas){
        // Make it visually fill the positioned parent
        canvas.style.width ='100%';
        canvas.style.height='100%';
        // ...then set the internal size to match
        canvas.width  = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }

    function makeGraph(m_canvasID, graphData, graphLabels) {
        var canvas = GetElementById(m_canvasID);
        fitToContainer(canvas);

        var ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = "#C0C0C0";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        var line = new RGraph.Line(m_canvasID, graphData);
        line.Set('chart.labels', graphLabels);
        line.Set('chart.text.size', 11);
        line.Set('chart.colors', ['red']);
        line.Set('chart.linewidth', 3);
        //line.Set('chart.spline', !RGraph.isOld());
        //line.Set('chart.scale.decimals', 2);
        //line.Set('chart.background.barcolor2', 'rgba(0,0,0,0.4)');
        line.Set('chart.background.barcolor1', 'rgba(0,0,0,0.3)');
        //line.Set('chart.filled', true);
        //line.Set('chart.fillstyle', 'rgba(0,0,0,0.5)');
        //line.Set('chart.shadow', true);
        line.Set('chart.hmargin', 0);
        line.Set('chart.gutter.left', leftGraphMargin);
        line.Set('chart.gutter.right', rightGraphMargin);
        line.Set('chart.title.yaxis.pos', 0.2);
        line.Set('chart.title.xaxis', "Frequency, MHz");
        line.Set('chart.gutter.bottom', 50);
        line.Set('xaxispos', 'center');
        line.Set('chart.title.yaxis', "Energy (Uncalibrated)");
        //line.Set('numyticks', 2);
        line.Draw();
    }

    function dataToColor(data) {
        var colorArray=[];

        for (var i=0; i<data.length; i++)
            colorArray.push(data[i]/2+' '+data[i]/2+ ' '+data[i]/2);

        return colorArray;
    }

    thisModule.redrawHeatmap = function() {
        var width = $('#'+m_heatmapDivID).width();
        height = $('#'+m_heatmapDivID).height();

        var data=m_arrSpecrumTimeSlices;
        (function(heatmap) {
            var dx = heatmap[0].length,
            dy = heatmap.length;

            // Fix the aspect ratio.
            // var ka = dy / dx, kb = height / width;
            // if (ka < kb) height = width * ka;
            // else width = height / ka;

            var x = d3.scale.linear()
                .domain([/*thisModule.lowBound_*/0, highBound_])
                .range([0, width]);

            var y = d3.scale.linear()
                .domain([0, dy])
                .range([height, 0]);

            var color = d3.scale.linear()
                .domain([0, m_maxval/4, 2*m_maxval/4, 3*m_maxval/4, 4*m_maxval/4])
                .range(["blue", 'cyan', "green", 'yellow', "red"]);

            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("top")
                .ticks(width/100);

            var heatmapArea=GetElementById(m_heatmapDivID);
            heatmapArea.innerHTML='';
            d3.select(heatmapArea).append("canvas")
                .attr("width", dx)
                .attr("height", dy)
                //.attr('id', 'heatCanv')
                .style("width", width + "px")
                .style("height", height + "px")
                .call(drawImage);

            var svg = d3.select(heatmapArea).append("svg")
                .attr("width", width)
                .attr("height", height);

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis)
                .call(removeZero);
            /*    
                  svg.append("g")
                  .attr("class", "y axis")
                  .call(yAxis)
                  .call(removeZero);
                  */


            //add Legend
            if (width>400 && height>200){
                var svgWidth = width,
                    svgHeight = height,
                    x1 = width-250,
                    barWidth = 200,
                    y1 = height-90,
                    barHeight = 50,
                    numberHues = 10;
                var idGradient = "legendGradient";

                var svgForLegendStuff = d3.select(heatmapArea).append("svg")
                    .attr("width", svgWidth)
                    .attr("height", svgHeight);

                //create the empty gradient that we're going to populate later
                svgForLegendStuff.append("g")
                    .append("defs")
                    .append("linearGradient")
                    .attr("id",idGradient)
                    .attr("x1","0%")
                    .attr("x2","100%")
                    .attr("y1","0%")
                    .attr("y2","0%"); // x1=0, x2=100%, y1=y2 results in a horizontal gradient
                // it would have been vertical if x1=x2, y1=0, y2=100%
                // See
                // http://www.w3.org/TR/SVG/pservers.html#LinearGradients
                // for more details and fancier things you can do
                //create the bar for the legend to go into
                // the "fill" attribute hooks the gradient up to this rect
                svgForLegendStuff.append("rect")
                    .attr("fill","url(#" + idGradient + ")")
                    .attr("x",x1)
                    .attr("y",y1)
                    .attr("width",barWidth)
                    .attr("height",barHeight)
                    .attr("rx",20) //rounded corners, of course!
                    .attr("ry",20)
                    .attr("stroke-width",2)
                    .attr("stroke",'white');

                //add text on either side of the bar

                var textY = y1 + barHeight/2 + 15;
                svgForLegendStuff.append("text")
                    .attr("class","legendText")
                    .attr("text-anchor", "middle")
                    .attr("x",x1 - 10)
                    .attr("y",textY-5)
                    .attr("dy",0)
                    .text("0");

                svgForLegendStuff.append("text")
                    .attr("class","legendText")
                    .attr("text-anchor", "left")
                    .attr("x",x1 + barWidth + 5)
                    .attr("y",textY-5)
                    .attr("dy",0)
                    .text(numberHues);

                svgForLegendStuff.append("text")
                    .attr("class","legendText")
                    .attr("text-anchor", "left")
                    .attr("x",(width-barWidth)/2)
                    .attr("y",height-30)
                    .attr("dy",0)
                    .text("Frequency, MHz");

                //we go from a somewhat transparent blue/green (hue = 160º, opacity = 0.3)
                //to a fully opaque reddish (hue = 0º, opacity = 1)

                var hueStart = 240, hueEnd = 0;
                var opacityStart = 1, opacityEnd = 1.0;
                var theHue, rgbString, opacity,p;

                var deltaPercent = 1/(numberHues-1);
                var deltaHue = (hueEnd - hueStart)/(numberHues - 1);
                var deltaOpacity = (opacityEnd - opacityStart)/(numberHues - 1);

                //kind of out of order, but set up the data here
                var theData = [];
                for (var i=0;i < numberHues;i++) {
                    theHue = hueStart + deltaHue*i;
                    //the second parameter, set to 1 here, is the saturation
                    // the third parameter is "lightness"
                    rgbString = d3.hsl(theHue,1,0.6).toString();
                    opacity = opacityStart + deltaOpacity*i;
                    p = 0 + deltaPercent*i;
                    //onsole.log("i, values: " + i + ", " + rgbString + ", " + opacity + ", " + p);
                    theData.push({"rgb":rgbString, "opacity":opacity, "percent":p});
                }

                //now the d3 magic (imo) ...
                var stops = d3.select('#' + idGradient).selectAll('stop')
                    .data(theData);
                stops.enter().append('stop');
                stops.attr('offset',function(d) {
                    return d.percent;
                })
                .attr('stop-color',function(d) {
                    return d.rgb;
                })
                .attr('stop-opacity',function(d) {
                    return d.opacity;
                });

            }


            // Compute the pixel colors; scaled by CSS.
            function drawImage(canvas) {
                var context = canvas.node().getContext("2d"),
                image = context.createImageData(dx, dy);

                for (var y = 0, p = -1; y < dy; ++y) {
                    for (var x = 0; x < dx; ++x) {
                        var c = d3.rgb(color(heatmap[y][x]));
                        image.data[++p] = c.r;
                        image.data[++p] = c.g;
                        image.data[++p] = c.b;
                        image.data[++p] = 255;
                    }
                }

                context.putImageData(image, 0, 0);
            }

            function removeZero(axis) {
                axis.selectAll("g").filter(function(d) { return !d; }).remove();
            }
        })(data);
    }


    function startSpectrum(host, radio_address, spectrumPort) {

        // Get the spectrum parameters from the HTML 5 widgets that are in
        // the page index.html.  Set these variables (m_*) here in this
        // function only, under penalty of death.  Read only anywhere
        // else.
        console.log('STARTING: startSpectrum(host="' + host +
                    '", radio_address="' + radio_address + '")');

        // Width of whole plot in MHz
        var b = Number(GetElementById('b').value);
        // Center frequency in Hz
        var f = Number(GetElementById('f').value);

        // Center frequency in Hz as a string
        var centerFreq = (Number(GetElementById('f').value) * 1000000).toString();
        // Total spectrum width in Hz as a string
        var bandWidth = (b * 1000000).toString();
        var rate = GetElementById('r').value; // Sample rate of feed in Hz

        // TODO: What is this 's' thing?  Does not seem to be used.
        //m_s = Number(GetElementById('s').value);

        // TODO: Why the 800 below?  Is it a graphics scale factor?
        m_period = 800/(rate); // Get period from rate
        rate = rate.toString();

        m_highBand = f - b/2; // in MHz
        m_lowBand = f + b/2; // in MHz
        m_bandWidth = b; // in MHz
        // Number of samples
        m_numBins = Number(GetElementById('n').value);

        // Tell the web server to start sending spectrum data
        // with these parameters:
        socket.emit ('startSpectrum', {

            // All of these are strings:
            //
            host: host, // host computer that sends the data
            addr: radio_address, // USRP (radio) IP address
            spectrumPort: spectrumPort,
            f: centerFreq, // frequency in Hz
            n: m_numBins.toString(), // number of bins
            b: bandWidth, // bandwidth in Hz
            r: rate // Number of times per second the data is sent
        });

        console.log('FINISHED: startSpectrum(host="' + host +
                    '", radio_address="' + radio_address + '")');

        // The server should respond with many emissions of 'updateSpectrum' 
    }


    //thisModule.initialize = function (lastDigitsIP, nTimeSlices, gridID,
    //        gridColorID, heatmapDivID, show_floors, showStatus, transParams, crtsMetricsId) {

    // Do not call this until socket and radio states are set up.
    thisModule.initialize = function(radio, cleanupFunc) {

        console.log('calling spectrum.initialize(radio tag="'+radio['tag']+
                    '", host="'+radio['host']+'",addr="'+radio['addr']+'",)');

        selOverlay(GetElementById('layer2'), leftGraphMargin, rightGraphMargin);

        var prevTime = 0;
        socket.on('updateSpectrum', function(data) {

            console.log('updateSpectrum DATA=' + JSON.stringify(data));
            
            if(new Date().getTime() - prevTime >= m_period) {

                if(processResponse(data, radio)) {
                    cleanupFunc();
                    return;
                }
                prevTime = new Date().getTime();
            }
        });

        socket.on('stopSpectrum', function(radio) {
            console.log('stopSpectrum for radio: host=' +
                radio['host'] + ' addr=' + radio['addr']);
            //TODO: More code here.
        });

        socket.on('error', function(error) { console.error(error) });

        startSpectrum(radio['host'], radio['addr'], radio['spectrumPort']);
    }

    thisModule.launchScoreboard = function()
    {
        var lastDigitsIP = GetElementById('header').innerHTML.slice(-2);
        socket.emit('launchScoreboard', lastDigitsIP);   
    }

    thisModule.launchTutorial = function(lastDigitsIP, parameters) {
        var crtsParams={};
        crtsParams.nodeID = parseInt(lastDigitsIP);
        //crtsParams.txNodeID = parseInt(GetElementById('tx_node_crts_options').value)%7000 + 10;
        //crtsParams.rxNodeID = parseInt(GetElementById('rx_node_crts_options').value)%7000 + 10;
        //Temporary hard coding for demo
        crtsParams.txNodeID = 47;
        crtsParams.rxNodeID = 48;
        crtsParams.params = parameters;
        socket.emit('launchTutorial', crtsParams);

        // Get the response from the server
        socket.on('crtsMetrics', function(data) {
            console.log('CRTS METRICS: '+data.toString());
        });
    }

    thisModule.launchCRTS = function(lastDigitsIP, parameters) {
        var crtsParams={};
        crtsParams.nodeID = parseInt(lastDigitsIP);
        //crtsParams.txNodeID = parseInt(GetElementById('tx_node_crts_options').value)%7000 + 10;
        //crtsParams.rxNodeID = parseInt(GetElementById('rx_node_crts_options').value)%7000 + 10;
        //Temporary hard coding for demo
        crtsParams.txNodeID = 47;
        crtsParams.rxNodeID = 48;
        crtsParams.params = parameters;

        socket.emit('launchCRTS', crtsParams);

        // Get the response from the server
        socket.on('crtsMetrics', function(data) {
            console.log('CRTS METRICS: '+data.toString());
        });
    }

    thisModule.fit = function () {
        fitToContainer(GetElementById('layer2'));
    }

    thisModule.disconnect = function (lastDigitsIP) {
        socket.emit ('closeSSH', lastDigitsIP);
        m_specrumTimeSlices = [];
        m_colorTimeSlices = [];
        m_arrSpecrumTimeSlices = [];

        m_grid=GetElementById(m_gridID);
        m_grid.innerHTML = '<color id="specGridColor" color="0 0 0 0 0 0 0 0 0 0 0 0"></color>';
        m_grid.height="0.0 0.0 0.0 0.0";
        m_grid.solid="false";
        m_grid.xdimension = "2";
        m_grid.zdimension = "2";
        m_grid.xspacing = "20.25";
        m_grid.zspacing = "6.81";

        GetElementById(m_heatmapDivID).innerHTML = '';
    }

    thisModule.updateTimeSlices = function(time_slices) {
        m_slices = time_slices;
    }

    thisModule.displayUsers =  function(transParams) {
        socket.emit ('users_req');
    }

    thisModule.setParamsCRTS = function (paramsCRTS) {
        socket.emit('getSettingsCRTS', paramsCRTS);
    }

    thisModule.stopCTRS = function () {
        socket.emit('stopCRTS');
    }


    var firstMetrics;
    thisModule.getMetrics = function(transParams) {
        socket.on('receiveMetrics', function(data) {
            var array=data.split(';');
            array.shift();
            array.pop();
            for (var i=0;i<array.length;i++) {
                array[i]=parseFloat(array[i]);
            }
            if (firstMetrics){
                firstMetrics=false;
                maxes=array.slice(0);
                mins=array.slice(0);
                maxes[0]='--';
                mins[0]='--';
                maxes[1]='--';
                mins[1]='--';
                maxes[2]='--';
                mins[2]='--';
            }
            fiveFrames.push(array);
            if (fiveFrames.length>5){
                fiveFrames.shift();
            }

            scoreTotal+=2*array[2]-1;
            GetElementById(scoreDiv).innerHTML=scoreTotal;

            GetElementById('metrics_table').innerHTML=makeTable(array);
        });
        socket.emit ('getMetrics', {nodeID: '25'});
        firstMetrics=true;
        fiveFrames=[];
    }

    var maxes=['--','--','--','--','--','--','--','--','--'];
    var mins=['--','--','--','--','--','--','--','--','--'];
    var avgs=['--','--','--','--','--','--','--','--','--'];
    var targets = [
        '--','<span class="check"></span>',
        '<span class="check"></span>',
        '-35','0','0','0','0','0'
    ];
    var fiveFrames;

    function makeTable(data){
        var tstr='<tr><th></th>';
        var headings=[
            'Frame #',
            'Valid Header',
            'Valid Payload',
            'EVM, dB',
            'RSSI',
            'PER',
            'Payload Byte Errors',
        'BER: Last Packet',
        'Payload Bit Errors'
        ];

        for (var i=0;i<headings.length;i++)
            tstr+='<th>'+headings[i]+'</th>';

        tstr+='</tr>';

        updateMaxMinAvg(data);
        data=addCheckmarks(data);
        //mins2=addCheckmarks(mins);
        //maxes2=addCheckmarks(maxes);

        tstr+=addRow('Current', data);
        tstr+=addRow('5 Frame Average', avgs);
        tstr+=addRow('Maximum', maxes);
        tstr+=addRow('Minimum', mins);
        tstr+=addRow('Target', targets);

        tstr+='</table>';
        return tstr;
    }

    function updateMaxMinAvg(data){
        for(var i=3;i<data.length;i++){
            if(mins[i]>data[i]){
                mins[i]=data[i];
            }
            if(maxes[i]<data[i]){
                maxes[i]=data[i];
            }
        }

        for(var j=3;j<avgs.length;j++){
            avgs[j]=0;
        }
        for(var i=0;i<fiveFrames.length;i++){
            for(var j=3;j<avgs.length;j++){
                avgs[j]+=fiveFrames[i][j];
            }
        }
        for(var j=3;j<avgs.length;j++){
            avgs[j]=avgs[j]/fiveFrames.length;
        }
    }

    function addCheckmarks(oldData){
        var data=oldData;
        data[1]=Math.round(data[1]);
        if (data[1]==1) {
            data[1]='<span class="check"></span>';
        } else {
            data[1]='<span style="color:red">X<span>';
        }

        data[2]=Math.round(data[2]);
        if (data[2]==1){
            data[2]='<span class="check"></span>';
        } else {
            data[2]='<span style="color:red">X<span>';
        }
        return data;
    }

    function addRow(name, data){
        var tstr='<tr><th>'+name+'</th>';
        for (var i=0;i<data.length;i++) {
            if (i==3 || i==4 || i==5 || i == 6 || i == 7) {
                tstr+='<td>'+parseFloat(data[i]).toFixed(4)+'</td>';
            } else {
                tstr+='<td>'+data[i]+'</td>';
            }

        }
        tstr+='</tr>';
        return tstr;
    }

    return thisModule;
}());
