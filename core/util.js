function createGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
	return v.toString(16);
    });
}


function copyDiv(sourceId,destId){
    var firstDivContent = document.getElementById(sourceId);
    var secondDivContent = document.getElementById(destId);
    if(firstDivContent && secondDivContent){
	secondDivContent.innerHTML = firstDivContent.innerHTML;
    }
    else if(secondDivContent){
	secondDivContent.innerHTML="";
    }
  }


function createObjectFromJson(json,namespace,preventFromJson){
    /*expects a _class property specifying the class function */
    if(!json ||!json._class){
	throw "json undefined or no _class property present";
    }
    
    var obj = new namespace[json._class]();
    if(!obj){
	console.log(json);
	throw "Couldn't create object from class "+json._class;
    }
    if(!preventFromJson){
	obj.fromJSON(json);
    }
    
    return obj;
}

/**
 * Handles the user interaction with the objects in the {@link Universe}
 */
function InteractionHandler() {
    this.lastKeyEvent;
}

// InterractionHandler.prototype=new InterractionHandler();
InteractionHandler.prototype.constructor = InteractionHandler;

InteractionHandler.prototype.onObjectClick = function(obj, universe, mousePos) {

};

InteractionHandler.prototype.onEmptyClick = function(obj, universe, mousePos) {

};

InteractionHandler.prototype.onObjectDrag = function(obj, universe, mousePos) {

};

InteractionHandler.prototype.onObjectDrop = function(obj, universe, mousePos) {

};

InteractionHandler.prototype.onKeyDown = function(evt) {
    this.lastKeyEvent = evt;
};

InteractionHandler.prototype.onKeyUp = function(evt) {
    this.lastKeyEvent = evt;
};

InteractionHandler.prototype.isCtrlDown=function(){
    if(this.lastKeyEvent != undefined){
	return this.lastKeyEvent.ctrlKey;
    }
    return false;
};

InteractionHandler.prototype.isShiftDown=function(){
    if(this.lastKeyEvent != undefined){
	return this.lastKeyEvent.shiftKey;
    }
    return false;
};

InteractionHandler.prototype.isAltDown=function(){
    if(this.lastKeyEvent != undefined){
	return this.lastKeyEvent.altKey;
    }
    return false;
};

