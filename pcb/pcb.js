

function ElectronicElement(label){
    this.label = label;
    
    /* an associated symbol to display in a circuit */
    this.symbol;
    
    /* a footprint on a pcb */
    this.footprint=new Footprint();

}


function Footprint(position,shape){
    PhysicalObject.call(this,position,shape);
}

Footprint.prototype = new PhysicalObject();
Footprint.prototype.constructor = Footprint;


/* The symbolic representation of a one to one connection */
function Path(){
    /* a path is actually a sequence of track points */
    this.trackPoints=[];
}

Path.prototype = new PhysicalObject();
Path.prototype.constructor = Path;

Path.prototype.addTrackPoint=function(trackPoint){
    this.trackPoints.push(trackPoint);
};


/**
 * A point on a track where two or more paths meet
 * It can also represent only an inflection point in a single path , or a terminal or any combination of the above
 */
function TrackPoint(footprint){
    /* a track point can be an arbitrary point or a terminal, if it's a terminal the footprint of that terminal needs to be passed */
    this.footprint=footprint;
}

TrackPoint.prototype = new PhysicalObject();
TrackPoint.prototype.constructor = TrackPoint;


/**
 * The representation of of a specific physical component
 */
function ElectronicComponent(label){
    ElectronicElement.call(this,label);
    /* a component can have more terminals */
    this.terminals=[];
    
    /* a component can have internal connections between terminals */
    this.connections=[];
    
    /* allow mappings to a specific device */
    this.deviceMappings = {};
}

/**
 * The representation of the abstraction of an electronic device
 */
function ElectronicDevice(type, label, comp, termMappings){
    this.type = type;
    
    
    this.label = label;
    /* the physical component used */
    this.comp = comp;
    
    
    /* the mappings of the logical to the physical terminals */
    this.termMappings = termMappings;
    
    if( this.termMappings == undefined && this.comp != undefined && this.type != undefined ){
	/* try to get the default mappings of the component for this device type */
	this.termMappings = this.comp.asDevice(this.type);
    }
    
    
    /* initialize the component as this device */
    if(this.comp != undefined && this.comp.init != undefined){
	this.comp.init(this);
    }
}


function Connection(terminals){
    
    /* we will allow having more than 2 terminals for simplicity, however physical paths need to be drawn to connect all of them */
    this.terminals = terminals;
}

Connection.prototype = new Connection();
Connection.prototype.constructor = Connection;



function Track(connection,label){
    ElectronicElement.call(this,label);
}

Track.prototype = new ElectronicElement();
Track.prototype.constructor = Track;

/**
 * The representation of the abstraction of an electronic circuit
 */
function ElectronicCircuit(){
    this.devices={};
    
    this.connections=[];
}

ElectronicCircuit.prototype = new ElectronicCircuit();
ElectronicCircuit.prototype.constructor = ElectronicCircuit;

ElectronicCircuit.prototype.addDevice=function(device){
    this.devices[device.label] = device;
};

ElectronicCircuit.prototype.addConnection=function(conn){
    this.connections.push(conn);
};

/**
 * Generates a PCB representation for this circuit
 */
ElectronicCircuit.prototype.createPCB=function(){
    var pcb = new PCB();
    
    for(var d in this.devices){
	pcb.addComponent(this.devices[d].comp);
    }
    
    
    for (var c in this.connections){
	pcb.addTrack(new Track(this.connections[c]));
    } 
    
    return pcb;
};





ElectronicElement.prototype = new ElectronicElement();
ElectronicElement.prototype.constructor = ElectronicElement;

ElectronicComponent.prototype = new ElectronicElement();
ElectronicComponent.prototype.constructor = ElectronicComponent;

ElectronicDevice.prototype = new ElectronicDevice();
ElectronicDevice.prototype.constructor = ElectronicDevice;

ElectronicDevice.prototype.getTerminal=function(label){
    var m = this.termMappings[label];
    if(m != undefined){
	return this.comp.terminals[m];
    };
};

/**
 * A manager for the tracks on a pcb
 */
function TracksManager(){
    /** track points by their physical id */
    this.trackPoints = {};
}

TracksManager.prototype.constructor = TracksManager;

/**
 * Returns a track point from a footprint
 * @param footprint
 */
TracksManager.prototype.getTrackPoint=function(footprint){
    /* see if we already have a track point for this */
    var tp = this.trackPoints[footprint.id];
    /* if not create one */
    if(tp == undefined){
	tp = new TrackPoint(footprint);
	this.trackPoints[footprint.id] = tp;
    }
    return tp;
};

/**
 * The representation of a possible physical arrangement for an electronic circuit
 */
function PCB(){
    
    PhysicalObject.call(this);
    /* components on this pcb */
    this.components=[];
    
    /* tracks on this pcb */
    this.tracks=[];
    
    this.layers={
	    silkscreen : {
		visible : true
	    },
	    soldermask : {
		visible : true
	    },
	    tracks : {
		visible : true
	    }
	    
    };
    
    this.tracksManager = new TracksManager();
    
    this.paths = new PhysicalObject();
    
    this.addPart(this.paths);
    
}

PCB.prototype = new PhysicalObject();
PCB.prototype.constructor = PCB;


PCB.prototype.addComponent = function(component){
    this.components.push(component);
    this.addPart(component.footprint);
};


PCB.prototype.addTrack = function(track){
    this.tracks.push(track);
    this.addPart(track.footprint);
};

PCB.prototype.setComponentsVisible=function(visible){
  for(var c in this.components){
      var fp = this.components[c].footprint;
      
      if(fp.shape){
	  fp.shape.visible = visible;
      }
  };  
};

PCB.prototype.getTrackPoint=function(footprint){
    return this.tracksManager.getTrackPoint(footprint);
};

PCB.prototype.addPath = function(path){
    this.paths.addPart(path);
};


ElectronicComponent.prototype.addTerminal=function(terminal){
    this.terminals.push(terminal);
    this.footprint.addPart(terminal.footprint);
    if(terminal.hole != undefined){
	terminal.footprint.addPart(terminal.hole);
    }
};

ElectronicComponent.prototype.addInternalConnection = function(connection){
    this.connections.push(connection);
};


ElectronicComponent.prototype.createTerminals=function(count,terminalPrefix){
    if(terminalPrefix == undefined){
	terminalPrefix="t";
    }
    
    for(var i=0;i<count;i++){
	var t=new THT(terminalPrefix+(i+1));
	this.addTerminal(t);
    }
};

ElectronicComponent.prototype.onReady = function(){
    /* initialize label with id if undefined */
    if(this.label == undefined){
	this.label = this.id;
    }
};

/**
 * Allow a component to provide terminal mappings to a specific device type
 */
ElectronicComponent.prototype.asDevice=function(deviceType){
    return this.deviceMappings[deviceType];
};

function Terminal(label){
    ElectronicElement.call(this,label);
    this.label=label;
}

Terminal.prototype = new ElectronicElement();
Terminal.prototype.constructor = Terminal;


Terminal.prototype.onReady = function(){
    /* initialize label with id if undefined */
    if(this.label == undefined){
	this.label = this.id;
    }
};


Terminal.prototype.setLabel=function(label){
    this.label = label;
};

/**
 * Through hole terminal
 * @param - the hole is actually the footprint of the hole needed to pass this terminal through
 */
function THT(label,hole){
    Terminal.call(this,label);
    this.hole;
    
    if(hole != undefined){
	this.hole = hole;
    }
    else{
	/* by default use a circle hole with the diameter of one ( radius 0.5 ) */
	this.hole = new Hole(0.5);
    }
    
}

THT.prototype = new Terminal();
THT.prototype.constructor = THT;


function Hole(radius){
    Footprint.call(this);
    this.shape = new Circle(radius,'#000000','#ffffff');
}

Hole.prototype = new Footprint();
Hole.prototype.constructor = Hole;


this.PcbUtil = this.PcbUtil || { constants : {}, generators : {}};

PcbUtil.constants.standardTerminalRadius = 0.8;

PcbUtil.constants.dilTerminalXRadius = 1;
PcbUtil.constants.dilTerminalYRadius = 0.75;
/* the horizontal distance from the center to the pins */
PcbUtil.constants.dilXDif = 3.75;
/* the distance from the center to each of the terminals */
PcbUtil.constants.LEDDif = 1;

PcbUtil.generators.LEDanodeFootprint = function(){
    return new Circle(PcbUtil.constants.standardTerminalRadius,'#000000','#000000');
};

PcbUtil.generators.LEDcathodeFootprint = function(){
    return new Rectangle(1.25,1.25,'#000000','#000000');
};


PcbUtil.generators.standardTerminalFootprint = function(){
    return new Circle(PcbUtil.constants.standardTerminalRadius,'#000000','#000000');
};

PcbUtil.generators.circleTerminalFootprint = function(radius){
    return new Circle(radius,'#000000','#000000');
};

console.log(PcbUtil);

