

function PcbElement(label,footprint) {
    this.label = label;

    /* an associated symbol to display in a circuit */
    this.symbol;

    /* a footprint on a pcb */
    if(footprint != undefined){
	this.footprint = footprint;
    }
    else{
	this.footprint = new Footprint();
    }
    this.footprint.element = this;

}

PcbElement.prototype = new PcbElement();
PcbElement.prototype.constructor = PcbElement;


PcbElement.prototype.toJSON = function(){
   
    return {
	label : this.label,
	footprint : this.footprint,
	_class : this.__proto__.constructor.name
    };
};

PcbElement.prototype.fromJSON=function(json){
  this.label = json.label;
  this.footprint.fromJSON(json.footprint);  
  this.footprint.element = this;
  
};


PcbElement.prototype.toGerber = function(exporter, scale){
    this.footprint.toGerber(exporter, scale);
};

PcbElement.prototype.setFootprint=function(footprint){
    this.footprint = footprint;
    this.footprint.element = this;
};


function ElectronicElement(label,footprint) {
    PcbElement.call(this, label, footprint);
}

ElectronicElement.prototype = new PcbElement();
ElectronicElement.prototype.constructor = ElectronicElement;


function Footprint(position, shape) {
    PhysicalObject.call(this, position, shape);
    /* the element that has this footprint */
    this.element;
}

Footprint.prototype = new PhysicalObject();
Footprint.prototype.constructor = Footprint;


function Connection(terminals) {

    /*
     * we will allow having more than 2 terminals for simplicity, however
     * physical paths need to be drawn to connect all of them
     */
    this.terminals = terminals;
}

Connection.prototype = new Connection();
Connection.prototype.constructor = Connection;

function Track(connection, label) {
    PcbElement.call(this, label);
}

Track.prototype = new PcbElement();
Track.prototype.constructor = Track;

/**
 * The representation of the abstraction of an electronic circuit
 */
function ElectronicCircuit() {
    this.devices = {};

    this.connections = [];
}

ElectronicCircuit.prototype = new ElectronicCircuit();
ElectronicCircuit.prototype.constructor = ElectronicCircuit;

ElectronicCircuit.prototype.addDevice = function(device) {
    this.devices[device.label] = device;
};

ElectronicCircuit.prototype.addConnection = function(conn) {
    this.connections.push(conn);
};

/**
 * Generates a PCB representation for this circuit
 */
ElectronicCircuit.prototype.createPCB = function() {
    var pcb = new PCB();

    for ( var d in this.devices) {
	pcb.addComponent(this.devices[d].comp);
    }

    for ( var c in this.connections) {
	pcb.addTrack(new Track(this.connections[c]));
    }

    return pcb;
};


/**
 * The representation of the abstraction of an electronic device
 */
function ElectronicDevice(type, label, comp, termMappings) {
    this.type = type;

    this.label = label;
    /* the physical component used */
    this.comp = comp;

    /* the mappings of the logical to the physical terminals */
    this.termMappings = termMappings;

    if (this.termMappings == undefined && this.comp != undefined
	    && this.type != undefined) {
	/* try to get the default mappings of the component for this device type */
	this.termMappings = this.comp.asDevice(this.type);
    }

    /* initialize the component as this device */
    if (this.comp != undefined && this.comp.init != undefined) {
	this.comp.init(this);
    }
}

ElectronicDevice.prototype = new ElectronicDevice();
ElectronicDevice.prototype.constructor = ElectronicDevice;

ElectronicDevice.prototype.toJSON=function(){
  return {
      type : this.type,
      termMappings : this.termMappings,
      _class : this.__proto__.constructor.name
  };  
};

ElectronicDevice.prototype.fromJSON=function(json){
    this.type = json.type;
    this.termMappings = json.termMappings;
};


ElectronicDevice.prototype.getTerminal = function(label) {
    var m = this.termMappings[label];
    if (m != undefined) {
	return this.comp.terminals[m];
    }
    ;
};

/**
 * A manager for the tracks on a pcb
 */
function TracksManager() {
    /** track points by their physical id */
    this.trackPoints = {};
}

TracksManager.prototype.constructor = TracksManager;


/**
 * Returns a track point from a footprint
 * 
 * @param footprint
 * @param create
 */
TracksManager.prototype.getTrackPoint = function(footprint, create) {
    /* see if we already have a track point for this */
    var tp = this.trackPoints[footprint.id];
    /* if not create one */
    if (tp == undefined && create) {
	tp = new TrackPoint(footprint);
	this.trackPoints[footprint.id] = tp;
    }
    return tp;
};

TracksManager.prototype.removeTrackPoint = function(tp) {
    delete this.trackPoints[tp.footprint.id];
};



/**
 * A point on a track where two or more paths meet It can also represent only an
 * inflection point in a single path , or a terminal or any combination of the
 * above
 */
function TrackPoint(footprint) {
    /*
     * a track point can be an arbitrary point or a terminal, if it's a terminal
     * the footprint of that terminal needs to be passed
     */
    this.footprint = footprint;

    this.parentPaths = [];
    /*
     * set it true if this is an auxiliary track point, needs to be false if
     * this is a terminal
     */
    this.auxiliary;
}

TrackPoint.prototype = new TrackPoint();
TrackPoint.prototype.constructor = TrackPoint;

TrackPoint.prototype.toJSON = function(){
    var json = {
	footprintId : this.footprint.id,
	auxiliary : this.auxiliary,
	parentPathsIds : this.parentPaths.map(function(p){ return p.id; })
    };
    
    /* if auxiliary add also the position as we won't be able to get it at restore for somewhere else */
    if(this.auxiliary){
	json.position = this.footprint.getPosition();
	json.selectable=this.footprint.selectable;
	json.visible =this.footprint.isVisible();
    }
    
    return json;
};


TrackPoint.prototype.addToPath = function(path) {
    this.parentPaths.push(path);
};

TrackPoint.prototype.removeFromPath = function(path) {
    var index = this.parentPaths.indexOf(path);
    this.parentPaths.splice(index, 1);
};




/**
 * The representation of a possible physical arrangement for an electronic
 * circuit
 */
function PCB() {

    PhysicalObject.call(this);
    /* components on this pcb */
    this.components = [];
    
    /* holes on this pcb */
    this.holes = [];

    /* tracks on this pcb */
    this.tracks = [];

    this.layers = {
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
    
    this.componentsLayer = new PhysicalObject();
    this.componentsLayer.selectable=false;

    this.paths = new PhysicalObject();
    this.paths.selectable = false;
    
    this.holesLayer = new PhysicalObject();
    this.holesLayer.id="holes_layer";
    this.holesLayer.selectable = false;
    
    this.auxPoints = new PhysicalObject();
    this.auxPoints.selectable = false;

    this.addPart(this.paths);
    this.addPart(this.componentsLayer);
    this.addPart(this.holesLayer);
    this.addPart(this.auxPoints);

}

PCB.prototype = new PhysicalObject();
PCB.prototype.constructor = PCB;

PCB.prototype.toJSON=function(){
    var json = PhysicalObject.prototype.toJSON.apply(this, arguments);
    
    json.components = this.components;
    json.pathsArray = this.paths.parts;
    json.tracksmanager = this.tracksManager;
    json.holes =this.holes;
  
    return json;
};

PCB.prototype.fromJSON = function(json){
    
    if(json == undefined){
	console.log("No saved data found!");
	return;
    }
    
    PhysicalObject.prototype.fromJSON.apply(this,arguments);
    
    /* we expect the component to be in the exact same order */
    
    for(var i in json.components){
	var saved = json.components[i];
	var current = this.components[i];
	if(current){
	    current.fromJSON(saved);
	}
	else{
	    var c = createObjectFromJson(saved,window,true);
	    this.addComponent(c);
	    c.fromJSON(saved);
	}
    }
    
    if(this.onComponentsPopulated){
	this.onComponentsPopulated(this);
    }
    
    for(var i in json.pathsArray){
	var sp = json.pathsArray[i];
	var path = new Path(this);
	path.id = sp.id;
	this.addPath(path);
	path.fromJSON(sp);
	
    }
    
    for(var  i in json.holes){
	var sh = json.holes[i];
	var h = createObjectFromJson(sh,window,true);
	this.addHole(h);
	h.fromJSON(sh);
    }
    
};

PCB.prototype.pathsToGerber=function(exporter){
    exporter.setLevelPolarity(1);
    exporter.setLinearInterpolation();
    this.paths.parts.forEach(function(p){
	p.toGerber(exporter);
    });
};

/**
 * Export terminals footprints
 * @param exporter
 */
PCB.prototype.terminalsToGerber=function(exporter){
    this.components.forEach(function(c){
	c.terminals.forEach(function(t){
	   t.toGerber(exporter);
	});
    });
};


PCB.prototype.holesToGerber=function(exporter){
    exporter.setLevelPolarity(1);
    exporter.setLinearInterpolation();
    
    this.components.forEach(function(c){
	c.terminals.forEach(function(t){
	   /* export holes for THTs */
	    if(t.hole){
		t.hole.toGerber(exporter);
	    }
	});
    });
    
    /* export screw holes */
    this.holesLayer.parts.forEach(function(p){
	p.toGerber(exporter);
    });
    
};

PCB.prototype.addComponent = function(component,id) {
    this.components.push(component);
//    this.addPart(component.footprint);
    this.componentsLayer.addPart(component.footprint);
    
};

PCB.prototype.addTrack = function(track) {
    this.tracks.push(track);
    this.addPart(track.footprint);
};

PCB.prototype.addHole = function(hole){
    this.holes.push(hole);
    this.holesLayer.addPart(hole.footprint);
};

PCB.prototype.setComponentsVisible = function(visible) {
    for ( var c in this.components) {
	var fp = this.components[c].footprint;

	if (fp.shape) {
	    fp.shape.visible = visible;
	}
    }
    ;
};

PCB.prototype.setPathsVisible = function(visible){
    this.paths.parts.forEach(function(p){
	if(p.shape){
	    p.shape.visible = visible;
	}
    });
};

PCB.prototype.setHolesVisible = function(visible){
    this.holesLayer.parts.forEach(function(p){
	if(p.shape){
	    p.shape.visible = visible;
	}
    });
};

PCB.prototype.setTerminalsVisible = function(visible){
    this.components.forEach(function(c){
	c.terminals.forEach(function(t){
	   t.footprint.setVisible(visible); 
	});
    });
};

PCB.prototype.getTrackPoint = function(footprint, create) {
    return this.tracksManager.getTrackPoint(footprint, create);
};

PCB.prototype.addPath = function(path) {
    this.paths.addPart(path);
};

PCB.prototype.removePath = function(path) {
    path.clean();
    this.paths.removePart(path, true);
};

PCB.prototype.removePointFromPath = function(tp, path) {
    tp.removeFromPath(path);
    if (tp.parentPaths.length <= 0) {
	this.tracksManager.removeTrackPoint(tp);
	if (tp.auxiliary) {
	    this.auxPoints.removePart(tp.footprint, true);
	}
    }

};

PCB.prototype.removeTrackPoint = function(tp) {
    /* remove all the paths this point belongs to */
    var self = this;
    tp.parentPaths.forEach(function(path) {
	console.log("removing path " + path.id);
	self.removePath(path);
    });

    this.tracksManager.removeTrackPoint(tp);
    if (tp.auxiliary) {
	this.auxPoints.removePart(tp.footprint, true);
    }

};

PCB.prototype.createNewPath = function(width) {
    var path = new Path(this,width);
    this.addPath(path);

    return path;
};

PCB.prototype.createNewTrackPoint = function(pos,id) {
    var handler = new Footprint();
    handler.shape = new Circle(1, '#ff0000');
    handler.setSelectable(false);
    handler.id = id;
   
    /* add the handler under the paths object */
    this.auxPoints.addPart(handler);
    handler.setPosition(pos.coords[0], pos.coords[1]);

    var tp = this.getTrackPoint(handler, true);
    tp.auxiliary = true;

    return tp;
};




/* The symbolic representation of a one to one connection */
function Path(pcb,width) {
    /* a path is actually a sequence of track points */
    this.trackPoints = [];
    this.pcb = pcb;
    
  

    this.selectable = false;
    /* the width of the track in millimeters */
    this.width=width;
    if(!this.width){
	this.width=0.5;
    }
    this.shape = new CustomShape();
    this.shape.lineWidth = this.width;
    this.shape.strokeColor = '#ff0000';
}

Path.prototype = new PhysicalObject();
Path.prototype.constructor = Path;

Path.prototype.toJSON=function(){
    var json = PhysicalObject.prototype.toJSON.apply(this, arguments);
    json.trackPoints = this.trackPoints;
    json.pcbId = this.pcb.id;
    json.width = this.width;
    
    return json;
};


Path.prototype.fromJSON = function(json){
    if(json == undefined){
	return;
    };
    if(json.trackPoints == undefined){
	return;
    }
    var self = this;
    
    this.setWidth(json.width);
    
    json.trackPoints.forEach(function(stp){
	/* see if a footprint with the specified id exists */
	var footprint = self.universe.getObjectById(stp.footprintId);
	
	
	
	var tp;
	if(footprint != undefined){
	    tp = self.pcb.getTrackPoint(footprint,true);
	}
	/* if no footprint exists then we're dealing with an auxiliary point */
	else{
	    console.log("add point "+stp.footprintId +" auxiliary "+stp.auxiliary);
	    tp = self.pcb.createNewTrackPoint(stp.position,stp.footprintId);
	    tp.footprint.setSelectable(stp.selectable);
	    tp.footprint.setVisible(stp.visible);
	    
	}
	/* add the point to the path */
	self.addTrackPoint(tp);
    });
    
    this.setComplete();
};


Path.prototype.toGerber = function(writer){
    if(this.trackPoints.length <=0 ){
        return;
    }  
    writer.setCircleAperture(this.width);
    PhysicalObject.prototype.toGerber.apply(this,arguments);
  };


Path.prototype.setWidth = function(width){
    if(width == undefined || width <= 0){
	return;
    }
    this.width = width;
    this.shape.lineWidth = width;
};


Path.prototype.addTrackPoint = function(trackPoint) {
    this.trackPoints.push(trackPoint);
    trackPoint.addToPath(this);

    this.shape.points.push(trackPoint.footprint.getPosition()
	    .subtract(this.position));

    // var points = [];
    // var self = this;
    // this.trackPoints.forEach(function(value,index){
    // points.push(value.footprint.position.subtract(self.position));
    //	
    // });
    //
    // this.shape.points=points;

};
/**
 * 
 * @param removeHandler -
 *                if true will remove the footprint too
 */
Path.prototype.removeLastPoint = function() {
    // var tp = this.trackPoints.pop();
    // this.shape.points.pop();
    // if(removeHandler){
    // this.removePart(tp.footprint,true);
    // }

    this.removePoint(this.trackPoints.length - 1);
};

Path.prototype.removePoint = function(index) {
    var tp = this.trackPoints.splice(index, 1)[0];
    this.shape.points.splice(index, 1);
    this.pcb.removePointFromPath(tp, this);

    // if(removeHandler){
    // this.removePart(tp.footprint,true);
    // };
};

Path.prototype.getFirstPoint = function() {
    return this.trackPoints[0];
};

Path.prototype.getPrevPoint = function(count) {
    if (count == undefined) {
	count = 2;
    } else {
	count++;
    }
    return this.trackPoints[this.trackPoints.length - count];
};

Path.prototype.getLastPoint = function() {
    return this.trackPoints[this.trackPoints.length - 1];
};

Path.prototype.updateLastPointPos = function(pos) {
    var lp = this.getLastPoint();
    lp.footprint.setPosition(pos.coords[0], pos.coords[1]);
    this.shape.points[this.trackPoints.length - 1] = pos
	    .subtract(this.position);
};

Path.prototype.updatePointPos = function(index, pos) {
    this.trackPoints[index].footprint.setPosition(pos.coords[0], pos.coords[1]);
    this.shape.points[index] = pos.subtract(this.position);
};

/**
 * how many points
 */
Path.prototype.size = function() {
    return this.trackPoints.length;
};

/**
 * Mark this path as complete
 */
Path.prototype.setComplete = function() {
    for (var i = 1; i < this.trackPoints.length; i++) {
	this.trackPoints[i].footprint.setSelectable(true);
    }
    this.shape.strokeColor='#000000';
};

/**
 * Will remove all points
 */
Path.prototype.clean = function(){
    while(this.trackPoints.length > 0){
	this.removeLastPoint();
    };
};


/**
 * The representation of of a specific physical component
 */
function ElectronicComponent(label) {
    ElectronicElement.call(this, label);
    /* a component can have more terminals */
    this.terminals = [];

    /* a component can have internal connections between terminals */
    this.connections = [];

    /* allow mappings to a specific device */
    this.deviceMappings = {};
    
    /* what kind of device this component is */
    this.device;
}

ElectronicComponent.prototype = new ElectronicElement();
ElectronicComponent.prototype.constructor = ElectronicComponent;

ElectronicComponent.prototype.toJSON=function(){
    var json = ElectronicElement.prototype.toJSON.apply(this,arguments);
    json.terminals = this.terminals;
    json.connections = this.connections;
    json.deviceMappings = this.deviceMappings;
    json.device = this.device;
    return json;
};


ElectronicComponent.prototype.fromJSON = function(json){
    
  
    
    
    try {
	
	this.device = createObjectFromJson(json.device, window);
	this.device.comp =this;
	this.init(this.device);
    } catch (e) {

//	throw e;
    }
    ;

    ElectronicElement.prototype.fromJSON.apply(this,arguments);
   
   
    
    var self = this;
    
    
    if(json.terminals){
	
	for(var i=0;i<json.terminals.length;i++){
	   
	    this.terminals[i].fromJSON(json.terminals[i]);
	}
       
    }
//    if(json.connections){
//	this.connections = json.connections;
//    }
//    this.deviceMappings = json.deviceMappings;
};

ElectronicComponent.prototype.addTerminal = function(terminal) {
    if(!terminal){
	return;
    }
    this.terminals.push(terminal);
    this.footprint.addPart(terminal.footprint);
    if (terminal.hole != undefined) {
	terminal.footprint.addPart(terminal.hole);
    }
};

ElectronicComponent.prototype.addInternalConnection = function(connection) {
    this.connections.push(connection);
};

ElectronicComponent.prototype.createTerminals = function(count, terminalPrefix, radius) {
    if (terminalPrefix == undefined) {
	terminalPrefix = "t";
    }

    for (var i = 0; i < count; i++) {
	var t = new THT(terminalPrefix + (i + 1),new Hole(radius));
	this.addTerminal(t);
    }
};

ElectronicComponent.prototype.onReady = function() {
    /* initialize label with id if undefined */
    if (this.label == undefined) {
	this.label = this.id;
    }
};

ElectronicComponent.prototype.init = function(device){
    this.device = device;
};

/**
 * Allow a component to provide terminal mappings to a specific device type
 */
ElectronicComponent.prototype.asDevice = function(deviceType) {
    return this.deviceMappings[deviceType];
};

function Terminal(label) {
    ElectronicElement.call(this, label);
    this.label = label;
}

Terminal.prototype = new ElectronicElement();
Terminal.prototype.constructor = Terminal;

Terminal.prototype.onReady = function() {
    /* initialize label with id if undefined */
    if (this.label == undefined) {
	this.label = this.id;
    }
};

Terminal.prototype.setLabel = function(label) {
    this.label = label;
};

/**
 * Through hole terminal
 * 
 * @param -
 *                the hole is actually the footprint of the hole needed to pass
 *                this terminal through
 */
function THT(label, hole) {
    Terminal.call(this, label);
    this.hole;

    if (hole != undefined) {
	this.hole = hole;
    } else {
	
	this.hole = new Hole(0.5);
    }

}

THT.prototype = new Terminal();
THT.prototype.constructor = THT;


THT.prototype.toJSON=function(){
  var json = Terminal.prototype.toJSON.apply(this,arguments);
  json.hole = this.hole;
  return json;
};

THT.prototype.fromJSON=function(json){
    Terminal.prototype.fromJSON.apply(this,arguments);
    if(json.hole){
	this.hole.fromJSON(json.hole);
    }
};


function Hole(radius) {
    Footprint.call(this);
    if(!radius){
	/* by default use a circle hole with the diameter of one ( radius 0.5 ) */
	radius = 0.5;
    }
    this.shape = new Circle(radius, undefined, '#ffffff');
}

Hole.prototype = new Footprint();
Hole.prototype.constructor = Hole;

Hole.prototype.toJSON=function(){
    var json = Footprint.prototype.toJSON.apply(this,arguments);
    json.radius =this.shape.radius;
    return json;
};

Hole.prototype.fromJSON=function(json){
    Footprint.prototype.fromJSON.apply(this,arguments);
    if(json.radius){
	this.setRadius(json.radius);
    }
    
};

Hole.prototype.setRadius=function(radius){
    this.shape= new Circle(radius, this.shape.strokeColor, this.shape.fillColor);
    console.log("hole set radius "+radius);
};


function ScrewHole(label,radius){
    PcbElement.call(this,label);
    var hole = new Hole(radius);
    this.setFootprint(hole);
    this.footprint.shape = new ScrewHoleShape(radius, '#000000');
    
    hole.setRadius=function(radius){
	this.shape= new ScrewHoleShape(radius, this.shape.strokeColor, this.shape.fillColor);
    };
};

ScrewHole.prototype = new PcbElement();
ScrewHole.prototype.constructor = ScrewHole;

ScrewHole.prototype.toGerber=function(context){
  this.footprint.toGerber(context);  
};

function ScrewHoleShape(radius, strokeColor, fillColor) {
   
    Circle.call(this, radius, strokeColor, fillColor);
}

ScrewHoleShape.prototype = new Circle();
ScrewHoleShape.prototype.constructor = ScrewHoleShape;

ScrewHoleShape.prototype.draw = function(canvas, position, scale, rotation){
	Ellipse.prototype.draw.apply(this, arguments);
	
	canvas.beginPath();
	
	canvas.moveTo(this.absolutePos.coords[0], this.absolutePos.coords[1]-this.absoluteYRadius);
	canvas.lineTo(this.absolutePos.coords[0], this.absolutePos.coords[1]+this.absoluteYRadius);
	
	canvas.moveTo(this.absolutePos.coords[0]-this.absoluteXRadius,  this.absolutePos.coords[1]);
	canvas.lineTo(this.absolutePos.coords[0]+this.absoluteXRadius, this.absolutePos.coords[1]);
	
	if (this.strokeColor) {
		canvas.strokeStyle = this.strokeColor;
		canvas.stroke();
	}
};


this.PcbUtil = this.PcbUtil || {
    constants : {},
    generators : {}
};

PcbUtil.constants.standardTerminalRadius = 1;

PcbUtil.constants.dilTerminalXRadius = 1;
PcbUtil.constants.dilTerminalYRadius = 0.75;
/* the horizontal distance from the center to the pins */
PcbUtil.constants.dilXDif = 3.75;
/* the distance from the center to each of the terminals */
PcbUtil.constants.LEDDif = 1;

PcbUtil.generators.LEDanodeFootprint = function() {
    return new Circle(0.8, undefined,
	    '#000000');
};

PcbUtil.generators.LEDcathodeFootprint = function() {
    return new Rectangle(1.5, 1.5, undefined, '#000000');
};

PcbUtil.generators.standardTerminalFootprint = function() {
    return new Circle(PcbUtil.constants.standardTerminalRadius, undefined,
	    '#000000');
};

PcbUtil.generators.circleTerminalFootprint = function(radius) {
    return new Circle(radius, undefined, '#000000');
};

PcbUtil.generators.rectangleTerminalFootprint = function(w,h) {
    return new Rectangle(w, h, undefined, '#000000');
};


