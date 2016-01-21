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
	"Ctrl-U+00BB" : function(evt){
	    evt.preventDefault();
//	    pcb1.setScale([pcb1.scale[0]+1,pcb1.scale[1]+1]);
	    universe.changeScale(1);
	    
	},
	"Ctrl-U+00BD" : function(evt){
	    evt.preventDefault();
//	    pcb1.setScale([pcb1.scale[0]-1,pcb1.scale[1]-1]);
	    universe.changeScale(-1);
	    
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
}

PathBuilderTool.prototype = new Tool();
PathBuilderTool.prototype.constructor = PathBuilderTool;

PathBuilderTool.prototype.onSelection=function(){
    /* work only with terminals, so make components unselectable */
    
    CONTEXT.selectedPcb.components.forEach(function(c){
	c.footprint.selectable = false;
    });
};

PathBuilderTool.prototype.onDeselection=function(){
    /* work only with terminals, so make components unselectable */
    
    CONTEXT.selectedPcb.components.forEach(function(c){
	c.footprint.selectable = true;
    });
    
    this.currentPath = undefined;
};

PathBuilderTool.prototype.onObjectClick=function(obj, universe, mousePos){
    /* if we're clicking on an existing object we either, begin a path or  end one */
    
    /* if no current path exists then we must be starting one right here */
    if(this.currentPath == undefined){
	this.currentPath = new Path();
	
	/* get a track point for the object */
	var ctp = CONTEXT.selectedPcb.getTrackPoint(obj);
	this.currentPath.addTrackPoint(ctp);
	CONTEXT.selectedPcb.addPath(this.currentPath);
	
    }
    /* if it already exists , then we're ending it */
    else{
	//todo
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

onkeydown = function(evt) {
    evt = evt || window.event;
    console.log(evt);

   var action = keyActions[mapKeyEvent(evt)];
   if(action != undefined){
       action(evt);
       universe.update();
   }
    
};


universe.interactionHandler = new PCBActionHandler();
