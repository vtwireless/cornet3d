/* 
 * This file contains the javascript code for 
 * front end of the Game Controller Dialog 
 */

var g_gameController = 
  {
  currentNodeId:  '',
  currentNodeIndex: -1, 
  activeControls: [],
  nodeArray: []  
  }; 

function InitializeGameController()
  {
  g_gameController.currentNodeId = '';
  g_gameController.currentNodeIndex = 0; 
  g_gameController.activeControls = []; 
  g_gameController.nodeArray = [];
  g_nodeIndexArray = {};
  g_nodeIdArray = {}; 
  }

function GetDefaultValuesForADisabledNode()
  {
  var values = { mod_value: '-1',
                 mod_text: '',
                 crc_value: '-1',
                 crc_text: '',
                ifec_value: '-1',
                ifec_text: '',
                ofec_value: '-1', 
                ofec_text: '',
                freq: '',
                bandwidth: '',
                gain: '-1'
                }
  return values;     
  }

function GetDefaultValuesForAnEnabledNode()
  {
  var values = { mod_value: '40',
                 mod_text: 'QPSK',
                 crc_value: '6',
                 crc_text: '32',
                ifec_value: '12',
                ifec_text: 'CONV-V29',
                ofec_value: '1', 
                ofec_text: 'none', 
                freq: '770',
                bandwidth: '1',
                gain: '20'
                }
  return values; 
  }

function GetDefaultValuesForControls(activeControlArray)
  {
  var ret =  GetDefaultValuesForADisabledNode();
  var defaultControlValues = GetDefaultValuesForAnEnabledNode(); 
  var controlLength = activeControlArray.length; 
  for (var i = 0; i < controlLength; i++)
    {
    var currentControl = activeControlArray[i];
    switch (currentControl.id)
      {
      case 'mod_ctrl':
        ret.mod_text = defaultControlValues.mod_text; 
        ret.mod_value = defaultControlValues.mod_value; 
        break;
      case 'crc_ctrl':
        ret.crc_text = defaultControlValues.crc_text; 
        ret.crc_value = defaultControlValues.crc_value; 
        break;
      case 'ifec_ctrl':
        ret.ifec_text = defaultControlValues.ifec_text;
        ret.ifec_value = defaultControlValues.ifec_value;             
        break;
      case 'ofec_ctrl':
        ret.ofec_text = defaultControlValues.ofec_text;
        ret.ofec_value = defaultControlValues.ofec_value;
        break;
      case 'freq_input':
        ret.freq = defaultControlValues.freq;
        break;
      case 'bandwidth_input':
        ret.bandwidth = defaultControlValues.bandwidth;
        break;
      case 'gainSlider':
        ret.gain = defaultControlValues.gain; 
        break;  
      }
  }
  return ret; 
  }

function GetValuesForANodeId(nodeId)
  {
  var nodeIndex = GetNodeConfigIndexValueFromNodeId(nodeId);
  var values = g_gameController.nodeArray[nodeIndex].values; 
  return values; 
  }

function SetValuesForANodeId(nodeId, values)
  {
  var nodeIndex = GetNodeConfigIndexValueFromNodeId(nodeId);    
  g_gameController.nodeArray[nodeIndex].values = values; 
  }

function GetValuesFromUIForNode()
  {
  var values = GetDefaultValuesForADisabledNode(); 
  var modControl = document.getElementById('mod_ctrl');
  var crcControl = document.getElementById('crc_ctrl');
  var ifecControl = document.getElementById('ifec_ctrl');
  var ofecControl = document.getElementById('ofec_ctrl'); 
  var freqControl = document.getElementById('freq_input');
  var bandwidthControl = document.getElementById('bandwidth_input');
  var gainControl = document.getElementById('gainSlider'); 
  var updateBtn = document.getElementById('updateGameControls');
  
  if (modControl.disabled === false)
    {
    values.mod_value = modControl.options[modControl.selectedIndex].value; 
    values.mod_text = modControl.options[modControl.selectedIndex].text;     
    }
    
  if (crcControl.disabled === false)  
    {
    values.crc_value = crcControl.options[crcControl.selectedIndex].value;         
    values.crc_text = crcControl.options[crcControl.selectedIndex].text; 
    }
    
  if (ifecControl.disabled === false)  
    {
    values.ifec_value = ifecControl.options[ifecControl.selectedIndex].value;        
    values.ifec_text = ifecControl.options[ifecControl.selectedIndex].text; 
    }
    
  if (ofecControl.disabled === false)  
    {
    values.ofec_value = ofecControl.options[ofecControl.selectedIndex].value;        
    values.ofec_text = ofecControl.options[ofecControl.selectedIndex].text; 
    }
  
  if (freqControl.disabled === false)  
    {
    values.freq = freqControl.value;
    }
    
  if (bandwidthControl.disabled === false)  
    {
    values.bandwidth = bandwidthControl.value;
    }    
    
  if (gainControl.display !== 'none')  
    {
    //values.gain = document.getElementById('amount-power').value; 
    var gain = $( "#slider-power" ).slider( "value" );
    gain = gain.toString();
    if(gain.length === 1)
      {
      gain = "0" + gain;
      }
    values.gain = gain; 
    }        
  return values; 
  }

function SetUIControlValuesFromNode(nodeId)
  {
  var values = GetValuesForANodeId(nodeId); 
  for (var i in g_gameController.activeControls)
      {
      var activeControl = g_gameController.activeControls[i]; 
      var controlId = activeControl.id; 
      
      // set select objects 
      if ((controlId === 'mod_ctrl') ||
        (controlId === 'crc_ctrl') ||
        (controlId === 'ifec_ctrl') ||
        (controlId === 'ofec_ctrl'))
        {
        var controlObj = document.getElementById(controlId); 
        controlObj.disabled = false;
        controlObj.style.backgroundColor = ''; 
        var selectValue = GetControlValue(controlId, values); 
        var x, y; 
        for(x = 0; x < controlObj.options.length; ++x)
          {
          if (controlObj.options[x].value === selectValue)
            {
            controlObj.selectedIndex = x;   
            }
          }
        }
        
      // set input text fields   
      if ((controlId === 'freq_input') ||
          (controlId === 'bandwidth_input'))
        {
        var controlObj = document.getElementById(controlId); 
        controlObj.disabled = false;
        controlObj.style.backgroundColor = ''; 
        controlObj.value = GetControlValue(controlId, values); 
        }
        
      // set slider objects   
      // TO DO:  Set slider value
      if (controlId === 'gainSlider')
        {
        var controlObj = document.getElementById(controlId); 
        controlObj.style.display = 'block'; 
        $( "#slider-power" ).slider("option", "value", GetControlValue(controlId, values)); 
        document.getElementById('amount-power').innerHTML =  $( "#slider-power" ).slider("option", "value"); 
        }
      }
    }

function LoadGameControllerWithTutorial()
  {
  var tutorial = g_tutorials[g_selectedTutorial];
  g_gameController.nodeArray = tutorial.nodes;
  g_gameController.activeControls = tutorial.gameControls;   
  var numNodes = g_gameController.nodeArray.length; 
  if (numNodes > 0)
    {
    for (var i = 0; i < numNodes; i++)  
      {
      var currentNode = g_gameController.nodeArray[i];
      var nodeIndex = i;
      var nodeId = g_gameController.nodeArray[i].nodeId; 
      g_nodeIndexArray[i] = nodeId;
      g_nodeIdArray[nodeId] = i;
      if (i === 0)
        {
        g_gameController.currentNodeId = nodeId;
        g_gameController.currentNodeIndex = nodeIndex;
        }
      var values = {}; 
      if (currentNode.controllable === true)
        {
        var values = GetDefaultValuesForControls(g_gameController.activeControls);
        } 
      g_gameController.nodeArray[i].values = values; 
      }
    }
  }


function DisableAllGameControls()
  {
  var modControl = document.getElementById('mod_ctrl');
  var crcControl = document.getElementById('crc_ctrl');
  var ifecControl = document.getElementById('ifec_ctrl');
  var ofecControl = document.getElementById('ofec_ctrl'); 
  var freqControl = document.getElementById('freq_input');
  var bandwidthControl = document.getElementById('bandwidth_input');
  var gainControl = document.getElementById('gainSlider'); 
  var updateBtn = document.getElementById('updateGameControls');
  
  modControl.style.backgroundColor = '#dddddd'; 
  crcControl.style.backgroundColor = '#dddddd';
  ifecControl.style.backgroundColor = '#dddddd';
  ofecControl.style.backgroundColor = '#dddddd';
  
  modControl.selectedIndex = 0; 
  ifecControl.selectedIndex = 0; 
  crcControl.selectedIndex = 0; 
  ofecControl.selectedIndex = 0; 
  freqControl.value = '';
  bandwidthControl.value = '';
  
  modControl.disabled = true;   
  crcControl.disabled = true; 
  ifecControl.disabled = true; 
  ofecControl.disabled = true; 
  freqControl.disabled = true;
  bandwidthControl.disabled = true; 

  gainControl.style.display = 'none'; 
  updateBtn.style.display = 'none'; 
  }

function GetControlValue(controlId, values)
  {
  ret = -1; 
  switch (controlId)
    {
    case 'mod_ctrl':
      ret = values.mod_value; 
      break;
    case 'crc_ctrl':
      ret = values.crc_value; 
      break;
    case 'ifec_ctrl':
      ret = values.ifec_value;                 
      break;
    case 'ofec_ctrl':
      ret = values.ofec_value; 
      break;
    case 'freq_input':
      ret = values.freq; 
      break;
    case 'bandwidth_input':
      ret = values.bandwidth;                 
      break;
    case 'gainSlider':
      ret = values.gain; 
      break;  
    }
  return ret; 
  }

function EnableGameControls()
  {
  if (g_gameController.currentNodeId !== -1)
    {
 
    }
  var updateBtn = document.getElementById('updateGameControls');
  updateBtn.style.display = 'block'; 
  }

function GetSelectObjForControllableNodes()
  {
  // get controller pieces
  var controller = document.getElementById('sliderHider');      

  // TODO need to determine which controls are "enabled" for this 
  // tutorial
    
  var theSelectObj;
  var controllableNodes = GetArrayOfControllableNodes();
  if (controllableNodes.length === 0)
    {
    var txtmsg = 'Tutorial has no controllable nodes';
    theSelectObj = document.createElement('span');
    theSelectObj.style.color = '#FF0000';
    theSelectObj.style.fontWeight = 'bold';
    var textNode = document.createTextNode(txtmsg); 
    theSelectObj.appendChild(textNode); 
    DisableAllGameControls(); 
    controller.style.backgroundColor = "#CCCCCC"; 
    }
  else 
    {
    // ==============================================
    // Show Controller as enabled
    // ==============================================   
    EnableGameControls(); 
    controller.style.backgroundColor = "#ffffff"; 

    theSelectObj = document.createElement('select');
    var theId = 'GameControllerCurrentNode';
    theSelectObj.id = theId;
    theSelectObj.name = theId;
    theSelectObj.className = 'tutorialNodeSelect';
    theSelectObj.title = 'Use this drop-down list to select the NODE in the tutorial that you want to control';
        
    for (var j = 0; j < controllableNodes.length; j++)
        {
        var currentNode = controllableNodes[j];
        var nodeText =
             'port: ' + currentNode.portNum + ' | ' +
             'ip: ' + ipNetworkAddress + currentNode.lastIP.toString();
        var key = currentNode.nodeId;
        var value = currentNode.nodeId + ' | ' +
                    currentNode.role + ' | ' +
                    nodeText;
        var option = document.createElement('option');
        option.value = key;
        option.text = value;
        theSelectObj.appendChild(option);
        }
    }
  return theSelectObj;
  }

function IsNodeControllable(nodeId)
  {
  var ret = false;
  var tutorial = g_tutorials[g_selectedTutorial];
  var nodeArray = tutorial.nodes;
  for (var i = 0; i < nodeArray.length; i++)
    {
    var currentNode = nodeArray[i];
    if (currentNode.nodeId === nodeId)
      {
      if (currentNode.controllable === true)
        {
        ret = true;
        }
      }
    }
  return ret;
  }

function GetNodeConfigIndexValueFromNodeId(nodeId)
  {
  var ret = -1;
  var tutorial = g_tutorials[g_selectedTutorial];
  var nodeArray = tutorial.nodes;
  for (var i = 0; i < nodeArray.length; i++)
    {
    var currentNode = nodeArray[i];
    if (currentNode.nodeId === nodeId)
      {
      ret = i;
      }
    }
  return ret;
  }

function GetNodeConfigIdValueFromNodeIndex(nodeIndex)
  {
  var ret = -1;
  var tutorial = g_tutorials[g_selectedTutorial];
  var nodeArray = tutorial.nodes;
  var numNodes = nodeArray.length; 
  if (nodeIndex < numNodes)
    {
    var currentNode = nodeArray[nodeIndex];
    ret = currentNode.nodeId; 
    }
  return ret;
  }



function GetArrayOfControllableNodes()
  {
  var ControllableNodes = [];
  for (var i in g_assignedNodeObjArray)
    {
    var currentNode = g_assignedNodeObjArray[i];
    var tempNode = {nodeId:  currentNode.nodeId,
                    role: currentNode.role,
                    portNum: currentNode.value,
                    lastIP: currentNode.lastIP};
    if (IsNodeControllable(tempNode.nodeId))
      {
      ControllableNodes.push(tempNode);
      }
    }
  return ControllableNodes;
  }
  
function UpdateGameControllerModel()
  {
  var nodeId = g_gameController.currentNodeId;
  var values = GetValuesFromUIForNode(); 
  SetValuesForANodeId(nodeId, values); 
  }
  
function ChangeGameControllerNode()
  {
  // set new selected node       
  var selectedIndex = document.getElementById('GameControllerCurrentNode').selectedIndex; 
  var nodeId = document.getElementById('GameControllerCurrentNode').options[selectedIndex].value; 
  g_gameController.currentNodeId = nodeId; 
  g_gameController.currentNodeIndex = selectedIndex;
  
  SetUIControlValuesFromNode(nodeId); 
  
  }
