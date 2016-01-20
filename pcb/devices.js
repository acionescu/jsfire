this.DeviceTypes = this.DeviceTypes || {};

/* supply */
DeviceTypes.DC_SUPPLY = {
    /* name */
    N : "DC_SUPPLY",
    /* terminals */
    T : {
	GND : "GND",
	VCC : "VCC"
    }
};

/* voltage regulators */
DeviceTypes.L78XX = {
    N : "L78XX",
    /* terminals */
    T : {
	Vin : "Vin",
	Vout : "Vout",
	GND : "GND"
    }
};

/* output */

/* two terminals output */
DeviceTypes.OUTPUT2T = {
	N : "OUTPUT2T"
};

/* swithces */

DeviceTypes.PUSH_BUTTON = {
    N : "PUSH_BUTTON"
};

/* passives */

DeviceTypes.RESISTANCE = {
    N : "RES"
};

DeviceTypes.CAPACITOR = {
    N : "CAP",
    T : {
	A : "A", // anode
	C : "C" // cathode
    }
};

/* Semiconductors */

/* Diodes */

DeviceTypes.DIODE = {
    N : "DIO",
    T : {
	A : "A", // anode
	C : "C" // cathode
    }
};


/* Transistors */

DeviceTypes.BIPOLAR_TRANSISTOR={
	N : "TRANSISTOR",
	T : {
	    B : "B", // base
	    E : "E", // emiter
	    C : "C" // collector
	}
};


DeviceTypes.QUARTZ = {
	N : "QUARTZ"
};


/* MCUs */
DeviceTypes.ATMEGA_328 = {
    N : "Atmega328"
};

/**
 * A generic DC supply
 */
function DCSupply(label, comp, mappings) {

    ElectronicDevice.call(this, DeviceTypes.DC_SUPPLY.N, label, comp, mappings);

}

DCSupply.prototype = new ElectronicDevice();
DCSupply.prototype.constructor = DCSupply;

DCSupply.prototype.getGnd = function() {
    return this.getTerminal(DeviceTypes.DC_SUPPLY.T.GND);
};

DCSupply.prototype.getVcc = function() {
    return this.getTerminal(DeviceTypes.DC_SUPPLY.T.VCC);
};

/**
 * A generic Diode
 */
function Diode(label, comp, mappings) {
    ElectronicDevice.call(this, DeviceTypes.DIODE.N, label, comp, mappings);
}

Diode.prototype = new ElectronicDevice();
Diode.prototype.constructor = Diode;

Diode.prototype.getCathode = function() {
    return this.getTerminal(DeviceTypes.DIODE.T.C);
};

Diode.prototype.getAnode = function() {
    return this.getTerminal(DeviceTypes.DIODE.T.A);
};

/**
 * A generic LED
 */
function LED(label, comp, mappings) {
    Diode.call(this, label, comp, mappings);
}

LED.prototype = new Diode();
LED.prototype.constructor = LED;

/**
 * Generic resistance
 * 
 * @param label
 * @param comp
 * @param mappings
 */
function Resistance(label, comp, mappings) {
    ElectronicDevice
	    .call(this, DeviceTypes.RESISTANCE.N, label, comp, mappings);
}

Resistance.prototype = new ElectronicDevice();
Resistance.prototype.constructor = Resistance;


/**
 * Generic capacitor
 */
function Capacitor(label, comp, mappings) {
    ElectronicDevice.call(this, DeviceTypes.CAPACITOR.N, label, comp, mappings);
}

Capacitor.prototype = new ElectronicDevice();
Capacitor.prototype.constructor = Capacitor;

Capacitor.prototype.getCathode = function() {
    return this.getTerminal(DeviceTypes.CAPACITOR.T.C);
};

Capacitor.prototype.getAnode = function() {
    return this.getTerminal(DeviceTypes.CAPACITOR.T.A);
};

/**
 * A one position microswitch with 4 terminals , 2 pairs
 */
function PushButton4T(label, comp, mappings) {
    ElectronicDevice.call(this, DeviceTypes.PUSH_BUTTON.N, label, comp,
	    mappings);
}

PushButton4T.prototype = new ElectronicDevice();
PushButton4T.prototype.constructor = PushButton4T;


/**
 * L78XX voltage regulator
 */
function L78XX(label, comp, mappings) {
    ElectronicDevice.call(this, DeviceTypes.L78XX.N, label, comp, mappings);
}

L78XX.prototype = new ElectronicDevice();
L78XX.prototype.constructor = L78XX;

L78XX.prototype.getVin = function() {

    return this.getTerminal(DeviceTypes.L78XX.T.Vin);
};

L78XX.prototype.getVout = function() {
    return this.getTerminal(DeviceTypes.L78XX.T.Vout);
};

L78XX.prototype.getGnd = function() {
    return this.getTerminal(DeviceTypes.L78XX.T.GND);
};



function QuartzCrystal(label, comp, mappings) {
    ElectronicDevice.call(this, DeviceTypes.QUARTZ.N, label, comp,
	    mappings);
}

QuartzCrystal.prototype = new ElectronicDevice();
QuartzCrystal.prototype.constructor = QuartzCrystal;

/**
 * Two terminals output
 */
function Output2T(label, comp, mappings){
    ElectronicDevice.call(this, DeviceTypes.OUTPUT2T.N, label, comp,
	    mappings);
}


Output2T.prototype = new ElectronicDevice();
Output2T.prototype.constructor = Output2T;


function BipolarTransistor(label, comp, mappings){
    ElectronicDevice.call(this, DeviceTypes.BIPOLAR_TRANSISTOR.N, label, comp,
	    mappings);  
};


BipolarTransistor.prototype = new ElectronicDevice();
BipolarTransistor.prototype.constructor = BipolarTransistor;

BipolarTransistor.prototype.getBase = function() {
    return this.getTerminal(DeviceTypes.BIPOLAR_TRANSISTOR.T.B);
};

BipolarTransistor.prototype.getCollector = function() {
    return this.getTerminal(DeviceTypes.BIPOLAR_TRANSISTOR.T.C);
};

BipolarTransistor.prototype.getEmitor = function() {
    return this.getTerminal(DeviceTypes.BIPOLAR_TRANSISTOR.T.E);
};


