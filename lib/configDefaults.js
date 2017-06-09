// This file uses the configuration info from users cornet3d_config.js to
// make a usable configuration by adding needed values that depend on user
// values that were set in cornet3d_config.js.  Also, if some values are
// not set in cornet3d_config.js, default values are set here.

exports.configDefaults = function(config) {

    // Set a value if it is undefined
    function checkSet(obj, name, value) {
        if(obj !== undefined && obj[name] === undefined)
            obj[name] = value;
    }


    checkSet(config, 'httpPort', 8888);
    checkSet(config, 'httpsPort', 4343);
    checkSet(config, 'spectrumPort', 5000);


    var floorIndex = 0;
    var radioIndex = 0;

    if(config['floors'] !== undefined) {
        var floors = config['floors'];
        for(var floorName in floors) {
            var floor = floors[floorName];
            checkSet(floor, 'translation', '0 0 0');
            // This should be the only place these tag ids are set, so we
            // just need them to be unique.  A prefix and sequence counter
            // do the trick.
            floor['elevationgridId'] = 'floorElevationgrid_' + floorIndex;
            floor['groupId'] = 'floorGroup_' + floorIndex;
            floor['materialId'] = 'floorMaterial_' + floorIndex;
            floor['index'] = floorIndex;
            ++floorIndex;

            if(floor['radios'] !== undefined) {
                floor['radios'].forEach(function(radio) {
                    checkSet(radio, 'translation', '0 0 0');
                    checkSet(radio, 'shape', 'cylinder');
                    checkSet(radio, 'host', 'localhost');
                    // A unique radio tag is not required, but makes it
                    // easier for the user to distinguish between the
                    // different radios when selecting one.
                    checkSet(radio, 'tag', '<b>radio ' + radioIndex + '</b><br>' + radio['addr']);
                    // This should be the only place these tag ids are
                    // set, so we just need them to be unique.  A prefix
                    // and sequence counter do the trick.
                    radio['materialId'] = 'radioMaterial_' + radioIndex;
                    radio['shapeId'] = 'radioShape_' + radioIndex;
                    radio['index'] = radioIndex;
                    ++radioIndex;
                })
            }
        }
    }

    return config;
}
