/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var g_tutorials = [];

function GetTutorialConfig()
  {
      g_tutorials =
        [
          {tutorialName: "Demo",
           tutorialShortDesc: "This demo tutorial allows the user to modify signal characteristics to see how they affect signal quality.", 
           tutorialDescArray: ["This is a simple CRTS Demo.<br> Use the game controls to modify the signal."],            
           tutorialId: 'tutorial_0',
           nodes: [ 
                    {nodeId: 'node1',
                     role: 'transmitter',
                     controllable:  true},
                    {nodeId: 'node2',
                     role: 'receiver',
                     controllable:  false}
                  ],
           scenarioFile: "cornet_3d_demo.cfg", 
           gameControls: [g_cornetControls.MOD, 
                          g_cornetControls.CRC, 
                          g_cornetControls.IFEC, 
                          g_cornetControls.OFEC, 
                          g_cornetControls.FREQ,
                          g_cornetControls.BW,
			  g_cornetControls.GAIN] 
           
           },

          {tutorialName: "Additive White Gaussian Noise with Static Interference",
           tutorialShortDesc: "This demo tutorial broadcasts a signal in the presense of AWGN", 
           tutorialDescArray: ["<p align=\"left\">Goals:<br>a. Observe the behavior of the Transmitted Signal and the Noise Signal in spectrum view.<br>b. Change the parameters of the transmitted signal and observe the changes in spectrum view and performance metrices.</p> ", "<p align=\"left\">Methodology:<br>a. Select the Transmitter, Receiver and Interferer nodes from the same floor.<br>b. Start experiment by selecting \"launch the tutorial\" option.<br>c. Select the \"game control\" option (which is beside \"Exit\" option) and change the parameters as per requirement.<br>d.  Select the \"Performance Metrices\" option (which is on the left side of the \"game control\" option) to observe the packet error rate.</p>"],
           tutorialId: 'tutorial_1',
           nodes: [ 
                    {nodeId: 'node1',
                     role: 'transmitter',
                     controllable: true},
                    {nodeId: 'node2',
                     role: 'receiver',
                     controllable: true},
                    {nodeId: 'node3',
                     role: 'interferer',
                     controllable: false}
                  ],
           scenarioFile: "awgn_interference.cfg",
           gameControls: [g_cornetControls.GAIN] 
           },/*
          
	   {tutorialName: "Additive White Gaussian Noise with Dynamic Interference",
           tutorialShortDesc: "This demo tutorial broadcasts a signal in the presense of dynamic AWGN", 
           tutorialDescArray: ["<p align=\"left\">Goals:<br>a. Observe the behavior of the Transmitted Signal and the Noise Signal in spectrum view.<br>b. Change the parameters of the transmitted signal and observe the changes in spectrum view and performance metrices.</p> ", "<p align=\"left\">Methodology:<br>a. Select the Transmitter, Receiver and Interferer nodes from the same floor.<br>b. Start experiment by selecting \"launch the tutorial\" option.<br>c. Select the \"game control\" option (which is beside \"Exit\" option) and change the parameters as per requirement.<br>d.  Select the \"Performance Metrices\" option (which is on the left side of the \"game control\" option) to observe the packet error rate.</p>"],
           tutorialId: 'tutorial_2',
           nodes: [ 
                    {nodeId: 'node1',
                     role: 'transmitter',
                     controllable: true},
                    {nodeId: 'node2',
                     role: 'receiver',
                     controllable: true},
                    {nodeId: 'node3',
                     role: 'interferer',
                     controllable: false}
                  ],
           scenarioFile: "AWGN_DYNAMIC.cfg",
           gameControls: [g_cornetControls.GAIN] 
           },
          
	   {tutorialName: "Additive white Gaussian Noise with Semi-Static Interference",
           tutorialShortDesc: "This demo tutorial broadcasts a signal in the presense of semistatic AWGN", 
           tutorialDescArray: ["<p align=\"left\">Goals:<br>a. Observe the behavior of the Transmitted Signal and the Noise Signal in spectrum view.<br>b. Change the parameters of the transmitted signal and observe the changes in spectrum view and performance metrices.</p> ", "<p align=\"left\">Methodology:<br>a. Select the Transmitter, Receiver and Interferer nodes from the same floor.<br>b. Start experiment by selecting \"launch the tutorial\" option.<br>c. Select the \"game control\" option (which is beside \"Exit\" option) and change the parameters as per requirement.<br>d.  Select the \"Performance Metrices\" option (which is on the left side of the \"game control\" option) to observe the packet error rate.</p>"],
           tutorialId: 'tutorial_3',
           nodes: [ 
                    {nodeId: 'node1',
                     role: 'transmitter',
                     controllabel: false},
                    {nodeId: 'node2',
                     role: 'receiver',
                     controllable: false},
                    {nodeId: 'node3',
                     role: 'interferer',
                     controllable: false}
                  ],
           scenarioFile: "AWGN_SEMISTATIC.cfg",
           gameControls: [g_cornetControls.GAIN] 
           },*/

	   {tutorialName: "Spectrum Sensing",
           tutorialShortDesc: "This is a non-interactive demonstration of a spectrum-sensing radio that utilizes basic frequency hopping to attempt to maintain a robust signal.", 
           tutorialDescArray: ["This is a non-interactive demonstration of a spectrum-sensing radio that utilizes basic frequency hopping to attempt to maintain a robust signal."],
           tutorialId: 'tutorial_2',
           nodes: [ 
                    {nodeId: 'node1',
                     role: 'transceiver',
                     controllable: false},
                    {nodeId: 'node2',
                     role: 'transceiver',
                     controllable: false},
                    {nodeId: 'node3',
                     role: 'transceiver',
                     controllable: false},
                    {nodeId: 'node4',
                     role: 'transceiver',
                     controllable: false}
                  ],
           scenarioFile: "cornet_3d_spectrum_sensing.cfg",
           gameControls: []
           }/*,           
	   
		{tutorialName: "Hopper",
           tutorialShortDesc: "This is a non-interactive demonstration of a spectrum-sensing radio that utilizes basic frequency hopping to attempt to maintain a robust signal.", 
           tutorialDescArray: ["This is a non-interactive demonstration of a spectrum-sensing radio that utilizes basic frequency hopping to attempt to maintain a robust signal."],
           tutorialId: 'tutorial_5',
           nodes: [ 
                    {nodeId: 'node1',
                     role: 'transmitter',
                     controllable: true},
                    {nodeId: 'node2',
                     role: 'receiver',
                     controllable: false},
                    {nodeId: 'node3',
                     role: 'transmitter',
                     controllable: true},
                    {nodeId: 'node4',
                     role: 'receiver',
                     controllable: false}
                  ],
           scenarioFile: "Scoreboard_demo.cfg",
           gameControls: [g_cornetControls.MOD, 
                          g_cornetControls.CRC, 
                          g_cornetControls.IFEC, 
                          g_cornetControls.OFEC, 
                          g_cornetControls.FREQ,
                          g_cornetControls.BW,
			  g_cornetControls.GAIN]
	}*/ 
        ]; 
    }

