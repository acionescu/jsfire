

var keyActions = {
	"Ctrl-Left" : function(evt){
	    pcb1.move(1,0);
	   
	},
	"Ctrl-Right" : function(evt){
	    pcb1.move(-1,0);
	   
	},
	"Ctrl-Up" : function(evt){
	    pcb1.move(0,1);
	   
	},
	"Ctrl-Down" : function(evt){
	    pcb1.move(0,-1);
	    
	},
	"Ctrl-U+00BB" : function(evt){
	    evt.preventDefault();
	    pcb1.setScale([pcb1.scale[0]+1,pcb1.scale[1]+1]);
	    
	},
	"Ctrl-U+00BD" : function(evt){
	    evt.preventDefault();
	    pcb1.setScale([pcb1.scale[0]-1,pcb1.scale[1]-1]);
	    
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
	out+="Shift";
    }
    
    out += evt.keyIdentifier;
    console.log(out);
    return out;
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




