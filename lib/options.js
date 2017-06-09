
// This provides command-line argument options for
// cornet3d_webServer

// Usage: require(THISFILE).parse(config)

/* config -- is a JSON object that has some values set and this
 *           will append values to it. */
exports.parse = function(config) {

    var path = require('path'),
        process = require('process'),
        fs = require('fs');

    var program_name = path.basename(require.main.filename);
    var default_seperator = ',';
    var environment_prefix = program_name.toUpperCase() + '_';

    // The options list is longer than the code that parses the options.
    var options = {

    //////////////////////////////////////////////////////////////////////
    //            ADD OPTIONS HERE in alphabetical order
    //////////////////////////////////////////////////////////////////////

    help: {
        type: 'bool',
        help: 'print this help.'
    },
    httpPort: {
        type: 'string', dflt: config.httpPort,
        help: 'set the server HTTP port to HTTP_PORT. ' +
            'The HTTP (non-secure) service is only available ' +
            'to localhost. Setting the HTTP_PORT to "0" will ' +
            'disable HTTP part of this service.'
    },
    httpsPort: {
        type: 'string', dflt: config.httpsPort,
        help: 'set the server HTTPS port to HTTPS_PORT.  '+
            'Setting the HTTP_PORT to "0" will ' +
            'disable the HTTPS part of this service.'
    },
    local: {
        type: 'bool',
        dflt: false, // false will let the http service run on
        // the internet, true will restrict the http service to
        // localhost.
        help: 'make the http service just for localhost.  By default' +
            ' the server will server to any address.'
    },
    passcode: {
        type: 'string',
        dflt: '',
        help: 'set client passcode to PASSCODE, if set the initial URL' +
            ' for the service should be appended with something like:' +
            ' https://example.com/?passcode=PASSCODE' +
            ' after which additional client requests will be secured' +
            ' with cookies that only the client and server know.'
    }

    //////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////
    
    }; // options

    // strip off httpPort and httpPort from config, so we don't keep
    // it in two places.  We keep them in the returned object.
    delete config.httpPort;
    delete config.httpsPort;


    var error = '';

    function addError(str) {
        if(error.length > 0)
            error += ' ' + str;
        else
            error = '\n  bad option(s): ' + str;
    }
 
    var spaces = '                                                  ' +
        '                                                           ' +

        '                           ',
        right0 = 4,  // chars left margin
        right1 = 31, // position to left side of help
        min_width = 50, // minimum width
        width = 78;  // width of text

    function write(str) {
        process.stdout.write(str);
    }

    function print(str, right, next_right) {

        var i;
        var out = '';


        while(str.length > 0 && str.substr(0,1) == ' ') str = str.substr(1);
        out = spaces.substr(0,right) + str;
        if(arguments.length > 2)
            right = next_right;

        while(out.length > width) {
            for(i=width; i>min_width && out.substr(i,1) != ' '; --i);
            if(i == min_width)
                // We failed to find a space so show it all.
                i = width;

            write(out.substr(0,i) + "\n");
            out = out.substr(i);
            while(out.length > 0 && out.substr(0,1) == ' ') out = out.substr(1);
            if(out.length > 0)
                out = spaces.substr(0,right) + out;
        }
        write(out + "\n");
    }

    // Convert from camel-case to underscore:
    function toUnderscore(str) {
        var ret = '';
        for(var i=0, len=str.length; i<len; i++) {
            if(str[i] >= 'A' && str[i] <= 'Z')
                ret += '_' + str[i].toLowerCase();
            else
                ret += str[i];
        }
        return ret;
    }


    function usage() {

        write('\n   Usage: ' + program_name + " [OPTIONS]\n\n");
        print('Run a ' + program_name + ' HTTP/webSocket server. ' +
            program_name +
            ' is a nodejs web server that provides monitoring' +
            ' of USRPs (Universal Software Radio Peripherals)' +
            ' via HTTP, HTTPS, Web Sockets and Web Sockets' +
            ' over TLS.', 2);
        write("\n");
        print(
            'The following options may be set using the command line ' +
            'or via an environment variable with a with the name being ' +
            'prefixed with ' + environment_prefix + ' and in all caps ' +
            'like for example (bash shell):', 2);
        write("\n      " + environment_prefix + 'HTTP_PORT="5555" ' +
                program_name + "\n\n");

        print('will set the --http_port option to "5555".' +
                ' These options may also be set using a single dash' +
                ' and with or without \'=\' as in for example:' +
                ' --http_port="5555" or -http_port "5555".', 2);

        write("\n\n                 --------- OPTIONS --------\n\n");

        var keys = Object.keys(options);
        for(var i=0; i<keys.length; ++i) {
            var optName = toUnderscore(keys[i]);
            var pre = '--' + optName;
            var opt = options[keys[i]];
            if(opt.type === 'string' ||
                    opt.type === 'regexp' ||
                    opt.type === 'number')
                pre += ' ' + opt.argument;

            if(pre.length < right1 - right0)

                pre += spaces.substr(0, right1 - right0 - pre.length);
            else
                pre += ' ';

            if(typeof(opt.default_print) === 'undefined' && opt.dflt) {
                if(opt.type === 'string')
                    var dflt = ' The default value of ' +
                        opt.argument + ' is "' + opt.dflt + '".';
                else if(opt.type === 'number')
                    var dflt = ' The default value of ' +
                        opt.argument + ' is ' + opt.dflt + '.';
                else if(opt.type === 'regexp')
                    var dflt = ' The default value of ' +
                        opt.argument + ' is /' + opt.dflt + '/.';
                else // if(opt.type === 'bool')
                    var dflt = ' This is not set by default.';
            } else {
                var dflt = '';
            }

            print(pre + options[keys[i]].help + dflt, right0, right1);
            write("\n");
        }

        console.log('\n  ================= The ' + keys.length +
        ' option values found ===================\n');
        for(var j=0; j<keys.length; ++j)
            console.log('     ' + j + '  ' + keys[j] + '=' +
                    options[keys[j]].value.toString());
        console.log(
            '\n  =================================' +
            '===============================\n');

        process.exit(1);
    }

    var keys = Object.keys(options);
    var alen = process.argv.length;


    // initialize all options values
    for(var j=0; j<keys.length; ++j) {
        var name = keys[j];
        var opt = options[name];
        var type = opt.type;
        if(type === 'bool') {
            opt.value = false;
            continue;
        }
        if(type === 'string' || type === 'regexp' || type === 'number') {
            if(opt.dflt)
                opt.value = opt.dflt;
            else
                opt.value = '';
            
            if(opt.len && opt.len > 1) {
                if(typeof(opt.seperator) === 'undefined')
                    opt.seperator = default_seperator;
                if(typeof(opt.dflt) != 'array')
                    opt.value = [];
                else
                    opt.value = opt.dflt;
            } else
                opt.len = 1;

            if(!opt.argument)
                opt.argument = toUnderscore(name).toUpperCase();

            continue;
        }
        error = 'bad option parsing opbject with name: ' + name;
        process.exit(1);
    }


    for(var i=2; i < alen; ++i) {
        var arg = process.argv[i];
        for(var k=0; k<keys.length; ++k) {
            var opt = options[keys[k]];
            var name = toUnderscore(keys[k]);
            var type = opt.type;
            //console.log(name);
            if(type === 'string' || type === 'regexp' || type === 'number') {
                if(('--'+name === arg || '-'+name === arg) && alen > i+1) {
                    // --option val   -option val
                    arg = process.argv[++i];
                    if(opt.len === 1)
                        opt.value = arg;
                    else {
                        // Getting multiple values into an array of values
                        // --option val0 --option val1 --option val2 ...
                        // or
                        // --option "val0 val1 val2"
                        var a = arg.split(opt.seperator)
                        opt.value = opt.value.concat(a);
                    }
                    break; // got it
                }

                var optlen = arg.indexOf('=') + 1;
                if(optlen > 0 && ('--'+name+'=' === arg.substr(0,optlen) ||
                            '-'+name+'=' === arg.substr(0, optlen)) &&
                            arg.length > optlen) {
                    if(opt.len === 1) {
                         opt.value = arg.substr(optlen);
                    } else {
                        // Getting multiple values into an array of values
                        // --option=val0 --option=val1 --option=val2 ...
                        // or
                        // --option="val0 val1 val2"
                        // or
                        // "--option=val0 val1 val2"
                        var a = arg.substr(optlen).split(opt.seperator);
                        opt.value = opt.value.concat(a);
                    }
                    break;
                }
                // TODO: add short options like the list command 'ls -al'
            }

            if(type && type == 'bool') {
                if('--'+name === arg || '-'+name === arg) {
                    // --option  -option
                    opt.value = true;
                    break;
                }
            }
        }
        if(k === keys.length) 
            addError(arg);
    }

    // Check that array values are either 0 length or the len length
    for(var j=0; j<keys.length; ++j) {
        var key = keys[j];
        var opt = options[key];
        if(opt.len > 1 &&
                (opt.value.length != 0 && opt.value.length != opt.len))
            addError(key + ' got ' + opt.value.length +
                    ' values, needed ' + opt.len);
    }


    // now parse the environment
    for(var j=0; j<keys.length; ++j) {
        var key = keys[j];
        var name = environment_prefix + toUnderscore(key).toUpperCase();
        var env = process.env[name];
        if(env) {
            var opt = options[key];
            if(opt.type === 'string' || opt.type === 'regexp'
                    || opt.type === 'number') {
                if(opt.len === 1)
                    opt.value = env;
                else /* if(len > 1) */ {
                    opt.value = env.split(opt.seperator);
                    if(opt.value.length < opt.len)
                        addError('env: ' + name + '=' + env);
                }
            }
            if(opt.type === 'bool') {
                // Default to true unless it's a false thing like '0' or
                // 'no' etc...
                opt.value = true;
                if(/(f|F|n|N|0).*/.test(env))
                    opt.value = false;
            }
        }
    }

    // Now convert the options that are numbers from strings to numbers
    // and the regexp from strings to regexp.
    for(var j=0; j<keys.length; ++j) {
        var key = keys[j];
        var opt = options[key];
        if(opt.type === 'number') {
            if(opt.len === 1) {
                opt.value = parseInt(opt.value);
            } else {
                for(var i=0; i<opt.value.length; ++i)
                    opt.value[i] = parseInt(opt.value[i]);
            }
        } else if(opt.type === 'regexp') {
            if(opt.value.substr(0,1) == '/')
                opt.value = opt.value.substr(1);
            if(opt.value.substr(opt.value.length-1,1) == '/')
                opt.value = opt.value.substr(0, opt.value.length-1);
            opt.value = new RegExp(opt.value);
        }
    }

    if(error.length > 0) {
        console.log(error + "\n");
        options.help.value = true;
    }

    if(options.help.value)
        usage();

    if(options.httpPort.value === '0' || options.httpPort.value.length === 0)
        options.httpPort.value = false;
    if(options.httpsPort.value === '0' || options.httpsPort.value.length === 0)
        options.httpsPort.value = false;

    if(options.httpPort === false && options.httpsPort === false) {
        print('  Neither HTTP_PORT or HTTPS_PORT where set.  One' +
            ' or both must be set.\n');
        write('\n');
        usage();
    }

    var ret = {};

    for(var key in options)
        ret[key] = options[key].value;
    // Don't need help now.
    delete ret['help'];


    var keys = Object.keys(ret);
    console.log('\n  ================= The ' + keys.length +
        ' opts values set ===================\n');
    for(var j=0; j<keys.length; ++j) {
        if(ret[keys[j]] !== null) {
            console.log('     ' + j + '  ' + keys[j] + '=' +
                ret[keys[j]].toString());
        } else {
            console.log('     ' + j + '  ' + keys[j] + '=' +
                'null');
        }
    }
    console.log(
            '\n  =================================' +
            '===============================\n');

    return ret;
}

