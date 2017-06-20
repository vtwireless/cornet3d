
const { exec } = require('child_process'),
    path = require('path'),
    net = require('net');


exports.radiosStatus = function(config, func) {

    var execCount = 0;
    var returnCount = 0;

    var radiosStatus = []; // What we return.

    // This is a request for a list of what radios are configured and a
    // report of a test run of 'uhd_find_devices' on those radios.  This
    // should be a pretty good parallel running code that queries the
    // status of the radios (RSRPs).  This should be many times faster
    // then running these 'uhd_find_devices' commands in series.
    if(config.floors !== undefined)
        for(floorName in config.floors) {
            if(config.floors[floorName].radios !== undefined) {

                var floor = config['floors'][floorName];
                var radios = config['floors'][floorName]['radios'];
                console.log('    floor ' + floorName + ':');

                radios.forEach(function(radio) {
                    ++execCount;
                    // build and run a command
                    //console.log('    radio['+ radio['index'] +
                    //        '] = ' + JSON.stringify(radio));
                    var command = ''
                        if(radio.host !== 'localhost')
                            command += 'ssh ' + radio.host + ' ';
                    command += 'uhd_find_devices'
                        if(radio.addr !== undefined)
                            command += ' --args="addr=' + radio.addr + '"';

                    exec(command, function(error, stdout, stderr) {
                        if(error) {
                            console.error('exec error: ' + error +
                                    ': failed to run:\n   ' + command);
                            return;
                        }
                        console.log(stdout);
                        console.log(stderr);
                    }).on('exit', function(ecode) {
                        radiosStatus[radio.index] = {
                            'tag': radio.tag,
                            'materialId': radio.materialId,
                            'shapeId': radio.shapeId,
                            'spectrumPort': radio.spectrumPort,
                            'addr': radio.addr,
                            'host': radio.host,
                            'status': ecode
                        };
                        ++returnCount;
                        /*console.log('  radio[' + radio['index'] + ']=' +
                                JSON.stringify(radiosStatus[radio['index']]));*/
                        if(returnCount === execCount) {
                            // The last exec returned now return
                            // radiosRet via function callback.
                            console.log('radiosStatus=' +
                                    JSON.stringify(radiosStatus));
                            func(radiosStatus);
                        }
                    });
                });
            }
        }
};



// TODO: add a cornet3d_spectrumServer launcher process that:
//
//   * lets you know that the listening socket was created
//
function startSpectrum(radio, socket, successFunc) {

    var command = '';
    if(radio.host !== 'localhost')
        command += 'ssh ' + radio.host + ' ';
    command +=
        'nohup ' +
        path.join(__dirname, './cornet3d_spectrumServer') +
        ' -f ' + radio.f +
        ' -b ' + radio.b +
        ' -n ' + radio.n +
        ' -r ' + radio.r +
        ' -p ' + radio.spectrumPort +
        ' -a ' + radio.addr +
        ' 2>>' +
        path.join(__dirname, 'cornet3d_spectrumServer_log') +
        ' 2>&1 &';
    
    exec(command, function(error, stdout, stderr) {
        
        if(error) {
            console.log('exec error: ' + error +
                ': failed to run:\n   ' + command);
            return;
        } 
        console.log(stdout);
        console.log(stderr);
    }).on('exit', function(ecode) {

        if(ecode !== 0)
            console.log('Failed to execute: ' + command);
        else {
            console.log('Successfully Executed: ' + command);
            if(successFunc)
                successFunc();
        }
    });
}


function tcpConnectToSpectrum(radio, socket, failFunc) {

    stopSpectrum(socket);
    
    var tcpClient = new net.Socket();
    tcpClient.Connected = false;
    // We only let there be one of these.
    socket.TcpSpectrumClient = tcpClient;

    tcpClient.connect(radio.spectrumPort, radio.host, function() {
	console.log(address + ' Connected to spectrumServer');
        tcpClient.Connected = true;
        tcpClient.write('parameters=' + JSON.stringify({
            'f': radio.f,
            'n': radio.n,
            'b': radio.b,
            'r': radio.r,
            'port': radio.spectrumPort,
            'addr': radio.addr
        }));

    });

    tcpClient.on('data', function(data) {
        console.log('Received: ' + data);
	//tcpClient.destroy(); // kill client after server's response
        tcpClient.write('spectrum');
    });

    tcpClient.on('error', function(e) {
        console.log(tcpClient.remoteAddress +
            ' spectrumServer error: ' + e +
            tcpClient.Connected?'':'\n  was connected');
        if(!tcpClient.Connected) {
            if(failFunc)
                failFunc();
        }
    });

    tcpClient.on('close', function() {
        console.log(tcpClient.remoteAddress +
            ' Connection closed to spectrumServer');
    });
}


function stopSpectrum(socket) {

    // There is only one TcpSpectrumClient for each WebSocket socket at a
    // time.

    if(socket.TcpSpectrumClient !== undefined) {
        // Make the TCP connection to
        // cornet3d_spectrumServer disconnect
        socket.TcpSpectrumClient.destroy();
        delete socket.TcpSpectrumClient;
        // now socket.TcpSpectrumClient is undefined again.
    }
}


exports.stopSpectrum = stopSpectrum;


exports.connectToSpectrum = function(radio, socket, successFunc) {

    tcpConnectToSpectrum(radio, socket, function() {
        // if fails to connect do:
        startSpectrum(radio, socket, function() {
            // if we succeed in launching cornet3d_spectrumServer
            // try to connect again.  TODO: add a cornet3d_spectrumServer
            // launcher that exits after cornet3d_spectrumServer sets up
            // the listening socket, then remove this timeout.
            setTimeout(function() {
                tcpConnectToSpectrum(radio, socket);
            }, 1400 /*milliseconds*/,
            '');
        });
    });
};


