this.CONTROLS=this.CONTROLS || {};

var CONTEXT = {
	selectedPcb : pcb1
	
};

var keyActions = {
	"Ctrl-Shift-Left" : function(evt){
	    pcb1.move(1,0);
	   
	},
	"Ctrl-Shift-Right" : function(evt){
	    pcb1.move(-1,0);
	   
	},
	"Ctrl-Shift-Up" : function(evt){
	    pcb1.move(0,1);
	   
	},
	"Ctrl-Shift-Down" : function(evt){
	    pcb1.move(0,-1);
	    
	},
	/* Ctrl plus */
	"Ctrl-U+00BB" : function(evt){
	    evt.preventDefault();
//	    pcb1.setScale([pcb1.scale[0]+1,pcb1.scale[1]+1]);
	    universe.changeScale(1);
	    
	},
	/* Ctrl minus */
	"Ctrl-U+00BD" : function(evt){
	    evt.preventDefault();
//	    pcb1.setScale([pcb1.scale[0]-1,pcb1.scale[1]-1]);
	    universe.changeScale(-1);
	    
	},
	/* Ctrl - Backspace */
	"Ctrl-U+0008" : function(evt){
	    universe.interactionHandler.undo();
	}
	
};

mapKeyEvent = function(evt){
    var out = "";
    
    if(evt.ctrlKey){
	out += "Ctrl-";
    }
    if(evt.altKey){
	out += "Alt-";
    }
    if(evt.shiftKey){
	out+="Shift-";
    }
    
    out += evt.keyIdentifier;
    console.log(out);
    return out;
};






function Tool(){
    
}

Tool.prototype = new InteractionHandler();
Tool.prototype.constructor = Tool;

/**
 * Called when the tool is selected
 */
Tool.prototype.onSelection =function(){
    
};

/**
 * Called when the tool is switched
 */
Tool.prototype.onDeselection =function(){
    
};


function MoveTool(){
    
}

MoveTool.prototype = new Tool();
MoveTool.prototype.constructor = MoveTool;


MoveTool.prototype.onObjectDrag=function(obj, universe, mousePos){
    obj.setPosition(mousePos.coords[0], mousePos.coords[1]);
};


function RotateTool(){
    
}

RotateTool.prototype = new Tool();
RotateTool.prototype.constructor = RotateTool;

RotateTool.prototype.onObjectClick=function(obj, universe, mousePos){
    obj.rotate(Math.PI/2);
};


function PathBuilderTool(){
    this.currentPath;
    this.mouseMoveListener;
}

PathBuilderTool.prototype = new Tool();
PathBuilderTool.prototype.constructor = PathBuilderTool;

PathBuilderTool.prototype.onSelection=function(){
    /* work only with terminals, so make components unselectable */
    
    CONTEXT.selectedPcb.components.forEach(function(c){
	c.footprint.selectable = false;
    });
    
    CONTEXT.selectedPcb.selectable = false;
};

PathBuilderTool.prototype.onDeselection=function(){
    /* work only with terminals, so make components unselectable */
    
    CONTEXT.selectedPcb.components.forEach(function(c){
	c.footprint.selectable = true;
    });
    
    this.currentPath = undefined;
    
    if(this.mouseMoveListener){
	universe.removeMouseEventListener(this.mouseMoveListener);
    }
    
};

PathBuilderTool.prototype.onObjectClick=function(obj, universe, mousePos){
    /* Ctrl Shift is down , then delete the point ( if an auxiliary point ) and the paths that contain it */
    
    if(this.isCtrlDown() && this.isShiftDown() ){
	console.log("delete it");
	
	/* get the track point for this object */
	var tp = CONTEXT.selectedPcb.getTrackPoint(obj,false);
	if(tp != undefined){
	    /* delete the track point */
	    CONTEXT.selectedPcb.removeTrackPoint(tp);
	}
	
	return;
    }
    
    
    
    /* if we're clicking on an existing object we either, begin a path or  end one */
    
    /* if no current path exists then we must be starting one right here */
    if(this.currentPath == undefined){
	this.currentPath = CONTEXT.selectedPcb.createNewPath();
	
	
	/* get a track point for the starting point */
	var ctp = CONTEXT.selectedPcb.getTrackPoint(obj,true);
	/* and add it to the path */
	this.currentPath.addTrackPoint(ctp);
	
	
	/* then we need to create a point that will follow the current position of the mouse */
	
	this.createNewPoint(mousePos);
	this.createNewPoint(mousePos);
	
	/* and an intermediary point to allow 45 degrees transitions */
	  var pp = this.currentPath.getPrevPoint(1);
	    pp.footprint.setSelectable(false);
	    pp.footprint.setVisible(false);
	
	this.mouseMoveListener = universe.registerMouseMove(this.onMouseMove,this);
	
	
	
    }
    /* if it already exists , then we're ending it */
    else{
	//todo
	
	
	/* get a track point for the starting point */
	var ctp = CONTEXT.selectedPcb.getTrackPoint(obj,true);
	
	/* don't allow circular paths */
	if(ctp != this.currentPath.getFirstPoint()){
	    this.currentPath.removeLastPoint(true);
	    /* add last point to the path */
	    this.currentPath.addTrackPoint(ctp);
	    
	    
	    this.updateIntermediaryPoint(ctp.footprint.getPosition());
	    /* remove the mouse move listener */
		universe.removeMouseEventListener(this.mouseMoveListener);
		
		this.currentPath.setComplete();
		
		this.currentPath = undefined;
	}
	
    }
};

PathBuilderTool.prototype.createNewPoint=function(pos){
    /* we'll use a small circle as handler */
//	var handler = new Footprint();
//	handler.shape = new Circle(1, '#ff0000');
//	handler.setPosition(pos.coords[0],pos.coords[1]);
//	handler.setSelectable(false);
//	this.currentPath.addPart(handler);
//	
//	/* get a track point for the handler */
//	var ltp = CONTEXT.selectedPcb.getTrackPoint(handler,true);
//	ltp.auxiliary = true;
	
	var ltp = CONTEXT.selectedPcb.createNewTrackPoint(pos);
	this.currentPath.addTrackPoint(ltp);
	
	
	
};


/**
 * This should be called only while we're building a path
 */
PathBuilderTool.prototype.onMouseMove = function(universe, mousePos){
   var prev = this.currentPath.getPrevPoint(2);
   
   var prevPos = prev.footprint.getPosition();
   /*
   var dif = mousePos.subtract(prevPos);
   
   var angle = Math.atan2(-dif.coords[1], dif.coords[0]);
   
   var constAngle = CONSTANTS.constrainToCardinal(angle);
   
   var radius = mousePos.distance(prevPos);
   
   var newPos = new Point([Math.cos(constAngle)*radius,-Math.sin(constAngle)*radius]);
   newPos = newPos.add(prevPos);
    
    
   this.currentPath.updateLastPointPos(newPos);
   
   
   */
   
   var interPoint = this.getIntermediaryPoint(prevPos,mousePos);
   

   this.currentPath.updatePointPos(this.currentPath.size()-2,interPoint);
   this.currentPath.updateLastPointPos(mousePos);
   
   universe.update();
};

PathBuilderTool.prototype.updateIntermediaryPoint = function(pos){
    var prev = this.currentPath.getPrevPoint(2);
    
    var prevPos = prev.footprint.getPosition();
    
    var interPoint = this.getIntermediaryPoint(prevPos,pos);
    

    this.currentPath.updatePointPos(this.currentPath.size()-2,interPoint);
};

PathBuilderTool.prototype.getIntermediaryPoint=function(sp,ep){
    var dif = ep.subtract(sp);
    var angle = Math.atan2(-dif.coords[1], dif.coords[0]);
    
    var constAngle = CONSTANTS.constrainToOblique(angle);
    
    var intery = ep.coords[1];
    var interx = sp.coords[0] - (intery - sp.coords[1])*Math.tan(constAngle);
    
    if(interx > Math.max(sp.coords[0],ep.coords[0]) || interx < Math.min(sp.coords[0],ep.coords[0])){
	interx = ep.coords[0];
	intery = sp.coords[1] - ( interx - sp.coords[0])/Math.tan(constAngle);
    }
    
    return new Point([interx,intery]);
};


PathBuilderTool.prototype.onEmptyClick=function(universe, mousePos){

    if(this.currentPath){
	if(this.currentPath.size() > 2){
	    
	  
	    
	    var lp = this.currentPath.getLastPoint();
	    lp.footprint.setSelectable(false);
	    lp.footprint.setVisible(false);
	}
	
	
	this.createNewPoint(mousePos);
	this.createNewPoint(mousePos);
	
	  var pp = this.currentPath.getPrevPoint(1);
	    pp.footprint.setSelectable(false);
	    pp.footprint.setVisible(false);
    }
};


PathBuilderTool.prototype.undo = function(){
    if(this.currentPath){
        if(this.currentPath.size() > 1 ){
    	this.currentPath.removeLastPoint(true);  
            var lp = this.currentPath.getLastPoint();
            lp.footprint.setVisible(true);
        }
        else{
    	CONTEXT.selectedPcb.removePath(this.currentPath);
    	 /* remove the mouse move listener */
	universe.removeMouseEventListener(this.mouseMoveListener);
	
	this.currentPath = undefined;
        }
    }
};


var toolMappings = {
	"Move" : new MoveTool(),
	"Rotate" : new RotateTool(),
	"PathBuilder" : new PathBuilderTool()
};


function updateSelectedTool(){
    
    var toolId = document.getElementById("toolSelector").selectedOptions[0].value;
    
    if(CONTROLS.selectedTool != undefined){
	CONTROLS.selectedTool.onDeselection();
    }
    
    /* initialize current tool */
    CONTROLS.selectedTool = toolMappings[toolId];
    CONTROLS.selectedTool.onSelection();
    console.log("selected tool - "+toolId);
}


/* register lister for the tools combo */
document.getElementById("toolSelector").onchange = function(evt){
    console.log(evt.target.selectedOptions[0].value);
    updateSelectedTool();
};

updateSelectedTool();


/**
 * Define a handler for user actions
 */
function PCBActionHandler(){
    
};

PCBActionHandler.prototype=new InteractionHandler();
PCBActionHandler.prototype.constructor=PCBActionHandler;


PCBActionHandler.prototype.onObjectClick=function(obj,universe,mousePos){
    CONTROLS.selectedTool.onObjectClick(obj,universe,mousePos);
    universe.update();
};

PCBActionHandler.prototype.onObjectDrag=function(obj,universe,mousePos){
    CONTROLS.selectedTool.onObjectDrag(obj,universe,mousePos);
    universe.update();
};

PCBActionHandler.prototype.onObjectDrop=function(obj,universe,mousePos){
    CONTROLS.selectedTool.onObjectDrop(obj,universe,mousePos);
    universe.update();
};

PCBActionHandler.prototype.onEmptyClick=function(universe,mousePos){
    CONTROLS.selectedTool.onEmptyClick(universe,mousePos);
    universe.update();
};

PCBActionHandler.prototype.undo = function(){
    CONTROLS.selectedTool.undo();
    universe.update();
};

PCBActionHandler.prototype.onKeyDown = function(evt){
    CONTROLS.selectedTool.onKeyDown(evt);
};

PCBActionHandler.prototype.onKeyUp = function(evt){
    CONTROLS.selectedTool.onKeyUp(evt);
};

onkeydown = function(evt) {
    evt = evt || window.event;
    console.log(evt);

   var action = keyActions[mapKeyEvent(evt)];
   if(action != undefined){
       action(evt);
       universe.update();
   }
   else{
       universe.interactionHandler.onKeyDown(evt);
   }
    
};

onkeyup = function(evt){
    universe.interactionHandler.onKeyUp(evt);
};

universe.interactionHandler = new PCBActionHandler();


var comandManager = {
	
	onSave : function(){
//	    console.log(JSON.stringify(tip127_1));
	    var url = 'data:text/json;charset=utf8,' + encodeURIComponent("var savedPcbData="+JSON.stringify(CONTEXT.selectedPcb));
	    window.open(url, '_blank');
	    window.focus();
	},
	exportToImage : function(){
	    var newCanvas = document.createElement('canvas');
	    var context = newCanvas.getContext('2d');
	    
	    newCanvas.width = 2048;
	    newCanvas.height = 2048;
	    
	    var c = document.getElementById("commSimCanvas");
	   
	    universe.canvas = context;
	    var prevScale = universe.scale;
	    universe.scale = [15,15];
	    universe.update();
	    universe.scale = prevScale;
	    universe.canvas = c.getContext('2d');
	    
	    
	    window.open(newCanvas.toDataURL(),'_blak');
	    window.focus();
	}
};



