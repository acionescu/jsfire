
/**
 * The representation of a possible physical arrangement for an electronic circuit
 */
function PCB(){
    
    PhysicalObject.call(this);
    /* there are more components in circuit */
    this.components=[];
    
    /* there are more connections in circuit */
    this.connections=[];
    
}

function ElectronicElement(label){
    this.label = label;
    
    /* an associated symbol to display in a circuit */
    this.symbol;
    
    /* a footprint on a pcb */
    this.footprint=new Footprint();

}

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
    this.termMapppings = termMappings;
    
    if( this.termMappings == undefined && this.comp != undefined && this.type != undefined ){
	/* try to get the default mappings of the component for this device type */
	this.termMappings = this.comp.asDevice(this.type);
    }
    
    /* initialize the component as this device */
    if(this.comp != undefined && this.comp.init != undefined){
	this.comp.init(this);
    }
}


function Terminal(label){
    ElectronicElement.call(this,label);
    this.label=label;
}

function Connection(terminals){
    
    /* we will allow having more than 2 terminals for simplicity, however physical paths need to be drawn to connect all of them */
    this.terminals = terminals;
}

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
    
    pcb.connections = this.connections;
    
    return pcb;
};


function Footprint(position,shape){
    PhysicalObject.call(this,position,shape);
}


PCB.prototype = new PhysicalObject();
PCB.prototype.constructor = PCB;

ElectronicElement.prototype = new ElectronicElement();
ElectronicElement.prototype.constructor = ElectronicElement;

ElectronicComponent.prototype = new ElectronicElement();
ElectronicComponent.prototype.constructor = ElectronicComponent;

ElectronicDevice.prototype = new ElectronicDevice();
ElectronicDevice.prototype.constructor = ElectronicDevice;


Terminal.prototype = new ElectronicElement();
Terminal.prototype.constructor = Terminal;

Connection.prototype = new PhysicalObject();
Connection.prototype.constructor = Connection;

Footprint.prototype = new PhysicalObject();
Footprint.prototype.constructor = Footprint;



ElectronicDevice.prototype.getTerminal=function(label){
    var m = this.termMappings[label];
    if(m != undefined){
	return this.comp.terminals[m];
    }
};





PCB.prototype.addComponent = function(component){
    this.components.push(component);
    this.addPart(component.footprint);
};


PCB.prototype.draw = function(canvas) {
    if (this.shape) {
	this.shape.draw(canvas, this.position, this.scale);
    }
};

PCB.prototype.addConnection = function(connection){
    this.connections.push(connection);
};

ElectronicComponent.prototype.addTerminal=function(terminal){
    this.terminals.push(terminal);
    this.footprint.addPart(terminal.footprint);
};

ElectronicComponent.prototype.addInternalConnection = function(connection){
    this.connections.push(connection);
};


ElectronicComponent.prototype.createTerminals=function(count,terminalPrefix){
    if(terminalPrefix == undefined){
	terminalPrefix="t";
    }
    
    for(var i=0;i<count;i++){
	var t=new Terminal(terminalPrefix+(i+1));
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


Terminal.prototype.onReady = function(){
    /* initialize label with id if undefined */
    if(this.label == undefined){
	this.label = this.id;
    }
};


Terminal.prototype.setLabel=function(label){
    this.label = label;
};



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
}

console.log(PcbUtil);

