/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


var g_cornetControls = {
    MOD:  {id: 'mod_ctrl', disabled: true},
    CRC:  {id: 'crc_ctrl', disabled: true}, 
    IFEC: {id: 'ifec_ctrl', disabled: true},
    OFEC: {id: 'ofec_ctrl', disabled: true},
    FREQ: {id: 'freq_input', disabled: true},
    BW:   {id: 'bandwidth_input', disabled: true},
    GAIN: {id: 'gainSlider', disabled: true},
    }; 
    
function SetGameControlsFromConfig(configControlList)    
  {
  for (var i in configControlList)  
    {
    configControlList[i].disabled = false; 
    }
  }

function SetUIGameControls()
  {
      /*
  for (var i in g_cornetControls)   
    {
    var theControl = g_cornetControls[i]; 
    var elem = document.getElementById(theControl.id);
    elem.disabled = theControl.disabled; 
    }
    */
  }
/*
function DisableAllGameControls()
  {
  for (var i in g_cornetControls)   
    {
    g_cornetControls[i].disabled = true; 
    }  
  SetUIGameControls();    
  }
  
function EnableAllGameControls()
  {
  for (var i in g_cornetControls)   
    {
    g_cornetControls[i].disabled = false; 
    }  
  SetUIGameControls();
  }  
  */