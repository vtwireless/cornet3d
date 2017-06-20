// This file is to configure the cornet3d_webServer
//
// Among other things, this file lists the USRP Software Defined Radios
// that the web server, "cornet3d_webServer", can provide access to.

// We define an address to as either an IP address like '192.168.1.6' or a
// DNS (domain name service lookup) 'example.com', or some kind of alias
// like 'localhost'.  It just has to be able to be mapped to an IP
// address.

// Each configured USRP is connected to one or more controller computers
// at an address and the radio has an address.  The choice of controller
// computer is not unique to a given radio, that is more than one
// controller computer may have access to a USRP.  The controller
// computers just need Ethernet (UDP/TCP/IP) access to the USRP.  There
// may be more than one USRP that is controlled by a given controller
// computer.

// The access to the USRP is defined by three strings:
//
//    "descriptor", ("address of control computer", "address of USRP")
//
// the "address of USRP" is as seen on the control computer; the
// descriptors must be unique; and the address 'localhost' is used to refer to
// the computer that is running cornet3d_webServer.

exports.configure = function configure() {


    console.log('loading: ' + __filename);

    // Currently just the list of USRPs
    // and how to represent them in CORNET3D.

    return {

        //'httpPort': 8888, // The default web server HTTP port

        //'httpsPort': 4343, // The default web server HTTPS port

        // The port for the cornet3d_spectrumServer on the first radio
        // (USRP), each USRP get a different spectrum port so that a host
        // may have many USRP cornet3d_spectrumServer programs running:
        //'spectrumPortStart': 5000, // default


        'floors' : { // Each floor is a group of radios

            'floor1' : {
                'translation': '-10.005 0 3',
                'rotation': '1 0 0 3.1415926',

                'radios': [
                    {
                        'tag': '<b>radio 1</b>',
                        'host': 'localhost',
                        'addr': '192.168.10.1',
                        'translation': '1 0 1',
                        'shape': 'cylinder'
                    },
                    {
                        'addr': '192.168.10.2',
                        'translation': '2 0 1',
                        'shape': 'cylinder'
                    },
                    {
                        'addr': '192.168.10.3',
                        'shape': 'sphere'
                    },
                    {
                        'addr': '192.168.10.4',
                        'translation': '-1 0 1',
                        'shape': 'sphere'
                    }
                ],
            },

            'floor2' : {
                'image': 'plan.png',
                'translation': '-9 1 3',

                'radios': [
                    {
                        'addr': '192.168.10.5',
                        'translation': '1 1 4'
                    },
                    {
                        'addr': '192.168.10.6',
                        'translation': '1 1 6'
                    },
                    {
                        'addr': '192.168.10.7',
                        'translation': '3 1 6'
                    },

                ],
            }

        } // floors
    }

} // function configure()
