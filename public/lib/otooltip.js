var oTooltip = new (function() {
  var nLeftPos, nTopPos, oNode, bOff = true;
  this.follow = function (oMsEvnt1) {
    if (bOff) { return; }
    var nMoveX =  oMsEvnt1.clientX, nMoveY =  oMsEvnt1.clientY;
    
    if(nMoveX<(window.innerWidth - oNode.offsetWidth - 20)) {
    	oNode.style.left = nMoveX + 20 + "px";
    } else {
    	oNode.style.left = nMoveX - oNode.offsetWidth + "px";
    }

    if(nMoveY<(window.innerHeight - oNode.offsetHeight - 20)) {
    	oNode.style.top = nMoveY + 20 + "px";
    } else {
    	oNode.style.top = nMoveY - oNode.offsetHeight  + "px";
    }
  };
  this.remove = function () {
    if (bOff) { return; }
    bOff = true; document.body.removeChild(oNode);
  };
  this.append = function (oMsEvnt2, sTxtContent) {
    oNode.innerHTML = sTxtContent;
    if (bOff) { document.body.appendChild(oNode); bOff = false; }
    var nMoveX =  oMsEvnt2.clientX, nMoveY =  oMsEvnt2.clientY;
    
    if(nMoveX<(window.innerWidth - oNode.offsetWidth - 20)) {
    	oNode.style.left = nMoveX + 20 + "px";
    } else {
    	oNode.style.left = nMoveX - oNode.offsetWidth + "px";
    }

    if(nMoveY<(window.innerHeight - oNode.offsetHeight - 20)) {
    	oNode.style.top = nMoveY + 20 + "px";
    } else {
    	oNode.style.top = nMoveY - oNode.offsetHeight  + "px";
    }
  };
  this.init = function() {
    oNode = document.createElement("div");
    oNode.className = "tooltip";
    oNode.style.position = "absolute";
  };


  this.show = function(text, matlID) {
    oNode.innerHTML=text;
    oNode.style.display = "block";
    document.getElementById(matlID).setAttribute('emissiveColor', '0.2 0.2 0');
    document.getElementById('x3dEl').style.cursor = 'pointer';
  };

  this.hide = function(matlID) {
    oNode.style.display = "none";
    document.getElementById(matlID).setAttribute('emissiveColor', '0 0 0');
    document.getElementById('x3dEl').style.cursor = 'default';  
  };
})();