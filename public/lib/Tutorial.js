/* 
 * ============================================================================
 *  Purpose:  This file exists to support the javascript programming for the 
 *            UI for the Tutorial module. 
 * Externals: This file is dependent on a global configuration object
 *            for the tutorials.  Currently it should be supplied in the 
 *            file:  ../config/TutorialConfig.js 
 * ============================================================================
 */


// -----------------------------------------------------------------------
//  Global variables used by the UI
// -----------------------------------------------------------------------
var g_selectedTutorial = -1; 
var g_descTotalNumSlides = -1; 
var g_descCurrentSlideNum = -1; 
var g_tutorialLaunchNodeIndex = null; 

var g_availableNodesIndexArray = []; 
var g_availableNodesArray = []; 
var g_assignedNodesArray = []; 
var g_assignedNodeObjArray = []; 

// dictionary structure to get node-id from node-index value
var g_nodeIndexArray = {};

// dictionary structure to get node-index from node-id value
var g_nodeIdArray = {};  

// main object structure to hold information related to the 
// game controller and all of the values 

function RefreshSelectNodeTable()
{
    if(($('#SelectTutorialNodes').hasClass('ui-dialog-content')) &&
            ($('#SelectTutorialNodes').dialog('isOpen') === true))
        SelectANode();
}

function RescanNodes()
{
    document.getElementById('selectNodeTable').style.display = 'none';
    document.getElementById('displayLoading').style.display = 'block'; 
    corStatus.initialize();
}

function CloseADialog(selector)
{
    if(($(selector).hasClass('ui-dialog-content')) &&
            ($(selector).dialog('isOpen') === true))
        $(selector).dialog('close'); 
}

function CloseAllTutorialDialogs()
{
    var tutorialDialogSelectors = ['#SelectTutorialPopUp',
    '#SelectTutorialNodes',
    '#DisplayTutorialDescriptionPopUp']; 
    for (var i = 0; i < tutorialDialogSelectors.length; i++)
    {
        var selector = tutorialDialogSelectors[i]; 
        CloseADialog(selector); 
    }
}


function HideTheLaunchTutorialButton()
{
    document.getElementById('launch_tutorials').style.display = 'none';
}  

function ShowTheLaunchTutorialButton()
{
    document.getElementById('launch_tutorials').style.display = 'inline-block';
}  

function HideTheUpdateTutorialButton()
{
    document.getElementById('update_tutorials').style.display = 'none';
}  

function ShowTheUpdateTutorialButton()
{
    document.getElementById('update_tutorials').style.display = 'inline-block';
}  


// TO DO ... probably need two functions (1) to actually initially launch the tutorial 
// and (2) one that simply updates the values of the node for the tutorial 
function LaunchTutorial()
{
    var tutorial = g_tutorials[g_selectedTutorial]; 
    var lastDigitsIP = document.getElementById('header').innerHTML.slice(-2);
    var nodeSelectObj = document.getElementById('GameControllerCurrentNode');
    var currentNodeId = g_gameController.currentNodeId; 
    var currentNodeIndex = g_gameController.currentNodeIndex; 

    if ((typeof nodeSelectObj === "undefined") ||
            (nodeSelectObj === null)) {
        console.log('first time in launch tutorial function'); 
        $( "#SelectTutorialNodes" ).dialog('close');
        DisplayGameControls(); 
        HideTheLaunchTutorialButton();     
        DisableAllGameControls(); 
        EnableGameControls(); 
    }

    SetUIControlValuesFromNode(currentNodeId); 

    var values = GetValuesFromUIForNode(); 
    SetValuesForANodeId(currentNodeId, values)


        var parameters = {}; 
    parameters.mod = values.mod_value;
    parameters.crc = values.crc_value;
    parameters.ifec = values.ifec_value;
    parameters.ofec = values.ofec_value;
    if (values.freq === '') {
        parameters.freq = -1;
    } else {
        parameters.freq = values.freq * 1000000;
    }

    if (values.bandwidth === '') {
        parameters.bandwidth = -1;
    } else {
        parameters.bandwidth = values.bandwidth * 1000000;
    }

    parameters.gain = values.gain;

    // Append the index value of the node to be controlled
    parameters.currentNodeId = currentNodeIndex;
    console.log('parameters for tutorial:  ');
    console.log(parameters);

    // Add object properties specific to tutorials 
    // scenario file name and nodes object array.
    var nodes = []; 
    for (var i in g_assignedNodeObjArray)
    {
        var currentNode = g_assignedNodeObjArray[i]; 
        var tempNode = {nodeId:  currentNode.nodeId, 
            role: currentNode.role, 
            lastIP: currentNode.lastIP}; 
        nodes.push(tempNode);
    }
    parameters.nodes = nodes; 
    parameters.scenarioFileName = tutorial.scenarioFile; 
    spectrum.launchTutorial(lastDigitsIP, parameters);

}

function CheckNode(e)
{
    e = e || window.event; 
    var target = e.target || e.srcElement; 
    var targetId = target.id; 
    var selectedPortNum = $('#' + targetId).val(); 

    // turn off the submit button 
    var theBtn = document.getElementById('continueToSubmission');    
    theBtn.style.display = 'none';

    // initialize assigned nodes array
    g_assignedNodesArray = []; 
    var numSelectedNodes = 0; 
    $('.tutorialNodeSelect').each(function() 
            {
                var theId = $(this).attr('id'); 
                var theValue = $(this).val(); 
                if (theValue > 7000)
                {
                    if (theId != targetId)
                    {
                        numSelectedNodes++;   
                        g_assignedNodesArray.push(theValue);
                    }
                }
            }); 

    // remove object from array 
    for (var i = 0; i < g_assignedNodeObjArray.length; i++)
    {
        var currentNodeObj = g_assignedNodeObjArray[i]; 
        var currentNode = currentNodeObj.uiId; 
        if (currentNode == targetId)
        {
            g_assignedNodeObjArray.splice(i, 1); 
        }
    }

    // check if node is already assigned 
    if (selectedPortNum > 7000)
    {
        if ($.inArray(selectedPortNum, g_assignedNodesArray) !== -1)
        {
            alert('ERROR:  Node already assigned.  Please select a different node'); 
            $("#" + targetId).val(-1);
        }
        else
        {
            var parts = targetId.split("_", 2); 
            var role = parts[1]; 
            var nodeId = targetId.substring(8 + role.length); 
            var lastIP = selectedPortNum - 6990; 
            var nodeAssignmentObj = {uiId:  targetId, 
                nodeId:  nodeId, 
                role: role, 
                value: selectedPortNum,
                lastIP: lastIP};
            g_assignedNodeObjArray.push(nodeAssignmentObj);
            g_assignedNodesArray.push(selectedPortNum);

            var numAssignedNodes = g_assignedNodesArray.length; 
            var tutorial = g_tutorials[g_selectedTutorial]; 
            var numNodesNeeded = tutorial.nodes.length; 
            if (numAssignedNodes == numNodesNeeded)
            {
                theBtn.style.display = 'block';   
            }
        }
    }
}



function BuildNodeArrayFromIndicies()
{
    var i; 
    var floorNum = 0;
    var nodeName = 0; 
    var portNum = 0;
    var ipAddressBase = ipNetworkAddress; 
    var nodeText = ''; 
    g_availableNodesArray = []; 
    // ------------------------------------------------------
    // Get Floor Num
    // ------------------------------------------------------  
    for (i = 0; i < g_availableNodesIndexArray.length; i++)  
    {
        nodeIndex = Number(g_availableNodesIndexArray[i]);
        if (nodeIndex !== g_tutorialLaunchNodeIndex)
        {
            if (nodeIndex < 12)
            {
                floorNum = '1'; 
                nodeNum = (nodeIndex + 1); 
            }
            else if (nodeIndex < 24)
            {
                floorNum = '2'; 
                nodeNum = (nodeIndex - 11);  
            }
            else if (nodeIndex < 36)
            {
                floorNum = '3';  
                nodeNum = (nodeIndex - 23);  
            }
            else 
            {
                floorNum = '4';   
                nodeNum = (nodeIndex - 35);  
            }
            nodeNumStr = pad(nodeNum, 2); 
            nodeName = 'node: ' + floorNum + '-' + nodeNumStr;      
            portNum = (nodeIndex + 7001); 
            nodeText = 
                nodeName + ' | ' + 
                'port: ' + portNum + ' | ' +
                'ip: ' + ipAddressBase + (nodeIndex + 11).toString(); 
            nodeObj = {key: portNum, value: nodeText, floor: floorNum}; 
            g_availableNodesArray.push(nodeObj); 
        }    
    }
}

// -----------------------------------------------------------------------
//  Function to execute when a tutorial is selected in the UI
//  and takes the user to the detailed description of the 
//  tutorial 
// -----------------------------------------------------------------------
function SelectTutorial(e)
{
    CloseAllTutorialDialogs(); 
    document.getElementById('displayLoading').style.display = 'none';
    document.getElementById('selectNodeTable').style.display = 'block'; 
    e = e || window.event; 
    var target = e.target || e.srcElement; 
    var name = target.id; 
    var nameArray = name.split("_");
    var num = nameArray[1]; 
    g_selectedTutorial = num; 
    currentNodeId = -1; 
    InitializeGameController(); 
    LoadGameControllerWithTutorial(); 
    var desc = document.getElementById("theTutorialDescription");
    var descTextArray = g_tutorials[g_selectedTutorial].tutorialDescArray; 
    g_descTotalNumSlides = descTextArray.length; 
    g_descCurrentSlideNum = 1; 
    DisplayDescSlide(); 
    $( "#DisplayTutorialDescriptionPopUp" ).dialog(
            {title: 'CRTS Tutorial System',
                draggable: false,
                width: 600,
                dialogClass: 'tutorialDialog'}); 
}


function pad(num, size) 
{
    var s = num + "";
    while (s.length < size) 
    {
        s = "0" + s;
    }
    return s;
}
// -----------------------------------------------------------------------
//  Function to execute when the user is finished examining the 
//  detailed description of the tutorial and ready to continue to 
//  the step of selecting the actual nodes 
// -----------------------------------------------------------------------
function SelectANode()
{
    CloseAllTutorialDialogs();  
    document.getElementById('continueToSubmission').style.display = 'none'; 
    document.getElementById('displayLoading').style.display = 'none'; 
    document.getElementById('selectNodeTable').style.display = 'block'; 
    var theTransmitterList = document.getElementById('SelectTransmitterNodes');
    var theReceiverList = document.getElementById('SelectReceiverNodes');
    var theTransceiverList = document.getElementById('SelectTransceiverNodes');
    var theInterfererList = document.getElementById('SelectInterfererNodes');      

    // ----------------------------------------------------------------------
    //  Clear any old HTML from divs
    // ----------------------------------------------------------------------
    theTransmitterList.innerHTML = '';   
    theTransceiverList.innerHTML = '';   
    theReceiverList.innerHTML = ''; 
    theInterfererList.innerHTML = ''; 
    theSelectObj = null; 
    // ----------------------------------------------------------------------
    //  Set Up Transmitter selection 
    // ----------------------------------------------------------------------
    var theTutorial = g_tutorials[g_selectedTutorial]; 
    var nodeCount = theTutorial.nodes.length;
    var transmitterCount = 0; 
    var receiverCount = 0; 
    var interfererCount = 0;
    var transceiverCount = 0;
    var unknownCount = 0; 

    BuildNodeArrayFromIndicies(); 

    var i; 
    var currentFloor = ''; 
    var lastFloor = ''; 
    for (i = 0; i < nodeCount; i++)
    {
        // insert header row
        if (i == 0)
        {
            var theDiv = document.createElement('div'); 
            theDiv.id = 'NodeHeaderRow'; 
            theDiv.className = 'selectNodeRowHeader';
            var theIdDiv = document.createElement('div');
            theIdDiv.className = 'nodeIdColumn';
            theIdDiv.innerHTML = 'Node ID'; 
            var theRoleDiv = document.createElement('div');
            theRoleDiv.className = 'nodeRoleColumn';
            theRoleDiv.innerHTML = 'Role'; 
            var theActualDiv = document.createElement('div');
            theActualDiv.className = 'nodeActualColumn';
            theActualDiv.innerHTML = 'Actual Node'; 
            theDiv.appendChild(theIdDiv);
            theDiv.appendChild(theRoleDiv);
            theDiv.appendChild(theActualDiv);
            theTransmitterList.appendChild(theDiv);
        }

        var theNode = theTutorial.nodes[i]; 
        var nodeType = theNode.role; 
        var nodeId = theNode.nodeId; 
        var theList = document.getElementById('tutorialList');
        switch (nodeType)
        {
            case 'transmitter':
                transmitterCount++;
                theList = theTransmitterList; 
                break;
            case 'receiver':
                receiverCount++;
                theList = theReceiverList; 
                break;
            case 'transceiver':
                transceiverCount++;
                theList = theTransceiverList; 
                break;
            case 'interferer':
                // displayText = 'Interferer ' + transmitterCount + ' node id: ' + nodeId; 
                interfererCount++;
                theList = theInterfererList; 
                break;
            default:
                unknownCount++; 
                break;
        }


        var theDiv = document.createElement('div'); 
        theDiv.id = nodeId; 
        var theIdDiv = document.createElement('div');
        theIdDiv.className = 'nodeIdColumn';
        theIdDiv.innerHTML = nodeId; 
        var theRoleDiv = document.createElement('div');
        theRoleDiv.className = 'nodeRoleColumn';
        theRoleDiv.innerHTML = nodeType; 
        theDiv.className = "selectNodeRow"; 
        var theActualDiv = document.createElement('div');
        theActualDiv.className = 'nodeActualColumn';
        var theSelectObj = document.createElement('select'); 
        var theId = 'select_' + nodeType + '_' + nodeId; 
        theSelectObj.id = theId; 
        theSelectObj.name = theId; 
        theSelectObj.className = 'tutorialNodeSelect'; 
        for (var j = 0; j < g_availableNodesArray.length; j++)
        {
            if (j == 0)
            {
                // insert the select one option
                var option = document.createElement('option');
                option.value = -1; 
                option.text = ' - select a node - '; 
                theSelectObj.appendChild(option); 

            }
            // insert first floor grouping 
            currentFloor = g_availableNodesArray[j].floor; 
            if (currentFloor !== lastFloor)
            {
                var groupTag = document.createElement('optgroup');
                groupTag.label = ' --- Floor' + currentFloor + ' --- '; 
                theSelectObj.appendChild(groupTag); 
                lastFloor = currentFloor; 
            }

            var option = document.createElement('option');
            option.value = g_availableNodesArray[j].key; 
            option.text = g_availableNodesArray[j].value; 
            theSelectObj.appendChild(option); 
        }

        theActualDiv.appendChild(theSelectObj); 
        theDiv.appendChild(theIdDiv);
        theDiv.appendChild(theRoleDiv);
        theDiv.appendChild(theActualDiv);
        theList.appendChild(theDiv);
        $('#' + theId).change(CheckNode); 
    }


    $("#SelectTutorialNodes").dialog(
            {title: 'CRTS Tutorial System',
                draggable: false,
                width: 600,
                dialogClass: 'tutorialDialog'}
    );
}


// ----------------------------------------------------------------------
//  Function to display error messages 
// ----------------------------------------------------------------------
function DisplayFatalError(msg)
{
    document.getElementById('errorMsg').innerHTML = msg; 
    $( "#FatalErrorPopUp" ).dialog(
            {title: 'Tutorial Module:  Error Dialog',
                draggable: false,
                width: 600});    
}

function DisplayDescSlide()
{
    var desc = document.getElementById("theTutorialDescription");
    var descTextArray = g_tutorials[g_selectedTutorial].tutorialDescArray; 
    g_descTotalNumSlides = descTextArray.length; 
    desc.innerHTML = descTextArray[g_descCurrentSlideNum - 1];     
    document.getElementById('prevBtn').style.visibility = 'hidden';
    document.getElementById('nextBtn').style.visibility = 'hidden';
    if (g_descCurrentSlideNum != 1)
    {
        document.getElementById('prevBtn').style.visibility = 'visible';
    }
    if (g_descCurrentSlideNum != g_descTotalNumSlides)
    {
        document.getElementById('nextBtn').style.visibility = 'visible';
    }
    document.getElementById('SlideCounterText').innerHTML = 
        'Description slide ' + g_descCurrentSlideNum + 
        ' of ' + g_descTotalNumSlides; 

    if (g_descTotalNumSlides == g_descCurrentSlideNum)
    {
        document.getElementById('continueToNodeSelection').style.visibility = 'visible'; 
    }
    else
    {
        document.getElementById('continueToNodeSelection').style.visibility = 'hidden'; 
    }
}

function DisplayPrevDescSlide()
{
    g_descCurrentSlideNum--;
    DisplayDescSlide();
}

function DisplayNextDescSlide()
{
    g_descCurrentSlideNum++;
    DisplayDescSlide();
}


// ----------------------------------------------------------------------
//  JQuery listener for dom:onload completed
//  This sets up all of the event listeners and initializes variables
// ----------------------------------------------------------------------
$(function() {
    GetTutorialConfig(); 
    // ----------------------------------------------------------------------
    //  Assert for global tutorial config object
    // ----------------------------------------------------------------------      
    if ((typeof(g_tutorials) === "undefined") ||
            (typeof(g_tutorials) != "object") ||
            (g_tutorials.length < 1))
    {
        var msg = 
            "<p>" + 
            "An error has occurred related to accessing the global tutorial " +
            "configuration object.  It may not exist, or may be of the wrong " +
            "type.  " +
            "</p>" +
            "<p>" +
            "Review the file ../config/TutorialConfig.js " +       
            "</p>";
        DisplayFatalError(msg);
    }

    // ----------------------------------------------------------------------
    //  Set Tutorial variables
    // ----------------------------------------------------------------------
    var tutorials = g_tutorials; 
    var tutorialCount = tutorials.length;    

    // ----------------------------------------------------------------------
    //  Set Up tutorial selection dialog
    // ----------------------------------------------------------------------
    var i; 
    for (i = 0; i < tutorialCount; i++)
    {
        var theTutorial = tutorials[i];
        var theId = theTutorial.tutorialId;
        var displayText = theTutorial.tutorialName;
        var titleText = theTutorial.tutorialShortDesc; 
        var theButton = document.createElement("input");
        theButton.type = "button"; 
        theButton.id = theId; 
        theButton.value = displayText; 
        theButton.title = titleText; 
        theButton.className = "tutorialSelectButton"; 
        var theList = document.getElementById('tutorialList');
        theList.appendChild(theButton);
        $('#' + theId).click(SelectTutorial);
    }



    // ----------------------------------------------------------------------
    //  Set Event Listen on Launch Tutorials
    // ----------------------------------------------------------------------
    $('#launch_tutorials').click(function () {
        $("#SelectTutorialPopUp").dialog({
            title: 'CRTS Tutorial System',
            draggable: true,
            width: 600,
            dialogClass: 'tutorialDialog'}
        );
    });

});
