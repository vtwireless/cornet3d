const { exec } = require('child_process'),
      path = require('path');

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
                            console.log('radiosStatus=' + JSON.stringify(radiosStatus));
                            func(radiosStatus);
                        }
                    });
                });
            }
        }
};


// TODO: add a cornet3d_spectrumServer launcher that:
//
//   * lets you know that listening socket was created
//
exports.startSpectrum = function(radio, socket, config, func) {

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
        ' -p ' + config.spectrumPort +
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
            func(null, 'Failed to execute: ' + command);
        else
            func('Successfully Executed: ' + command, null);
    });
};

