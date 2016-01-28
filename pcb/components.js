function DIL(pinsCount, label) {
    ElectronicComponent.call(this, label);
    this.createTerminals(pinsCount, "p", 0.35);

    /* a quorter from the number of pins */
    var qp = pinsCount / 4;

    for (var i = 0; i < pinsCount / 2; i++) {
	var t = this.terminals[i];
	t.footprint.shape = new Ellipse(PcbUtil.constants.dilTerminalXRadius,
		PcbUtil.constants.dilTerminalYRadius, undefined, '#000000');
	t.footprint.setRelativePos(PcbUtil.constants.dilXDif,
		(i - qp) * 2.538 + 1);
    }

    for (i = pinsCount; i > pinsCount / 2; i--) {
	t = this.terminals[i - 1];
	t.footprint.shape = new Ellipse(PcbUtil.constants.dilTerminalXRadius,
		PcbUtil.constants.dilTerminalYRadius, undefined, '#000000');
	t.footprint.setRelativePos(-PcbUtil.constants.dilXDif,
		(pinsCount - i - qp) * 2.538 + 1);
    }
}

DIL.prototype = new ElectronicComponent();
DIL.prototype.constructor = DIL;

/**
 * Generic diode component
 */
function DiodeComp(label) {
    ElectronicComponent.call(this, label);
    this.addTerminal(new THT("A"));
    this.addTerminal(new THT("C"));

    this.deviceMappings[DeviceTypes.DIODE.N] = {
	"A" : 0,
	"C" : 1
    };
};

DiodeComp.prototype = new ElectronicComponent();
DiodeComp.prototype.constructor = DiodeComp;

DiodeComp.prototype.init = function(device){
    
    var af = device.getAnode().footprint;
    af.shape = PcbUtil.generators.standardTerminalFootprint();
    af.setRelativePos(0, 5);

    var cf = device.getCathode().footprint;
    cf.shape = PcbUtil.generators.rectangleTerminalFootprint(2,2);
    cf.setRelativePos(0, -5);
    
};

function StandingDiodeComp(label){
    DiodeComp.call(this, label);
}


StandingDiodeComp.prototype = new DiodeComp();
StandingDiodeComp.prototype.constructor = StandingDiodeComp;


StandingDiodeComp.prototype.init = function(device){
    DiodeComp.prototype.init.apply(this, arguments);

    var af = device.getAnode().footprint;
   // af.shape = PcbUtil.generators.LEDanodeFootprint();
    af.setRelativePos(0, 0);

    var cf = device.getCathode().footprint;
   // cf.shape = PcbUtil.generators.LEDcathodeFootprint();
    cf.setRelativePos(0, -2.5);
    
    var shape = new Ellipse(1.25,1.25,'#000000');
    
    this.footprint.shape = shape;
};

StandingDiodeComp.prototype.toDevice=function(){
    return new Diode(this.label, this);
};


/**
 * A 5mm LED
 */
function LED_5mm(label) {
    DiodeComp.call(this, label);

}

LED_5mm.prototype = new DiodeComp();
LED_5mm.prototype.constructor = LED_5mm;

LED_5mm.prototype.init = function(device) {
    DiodeComp.prototype.init.apply(this, arguments);

    var af = device.getAnode().footprint;
   // af.shape = PcbUtil.generators.LEDanodeFootprint();
    af.setRelativePos(0, PcbUtil.constants.LEDDif);
    af.shape = PcbUtil.generators.circleTerminalFootprint(0.85);

    var cf = device.getCathode().footprint;
    cf.shape = PcbUtil.generators.LEDcathodeFootprint();
    cf.setRelativePos(0, -PcbUtil.constants.LEDDif);
    
    this.terminals.forEach(function(t){
	
	t.hole.setRadius(0.35);
    });

    var shape = new Shape('#000000');
    shape.radX = 2.75;
    shape.radY = 2.75;

    shape.draw = function(canvas, position, scale, rotation) {

	var coords = position.coords;

	canvas.beginPath();

	this.absolutePos = new Point([ scale[0] * coords[0],
		scale[1] * coords[1] ]);
	this.absoluteXRadius = this.radX * scale[0];
	this.absoluteYRadius = this.radY * scale[1];

	canvas.ellipse(this.absolutePos.coords[0], this.absolutePos.coords[1],
		this.absoluteXRadius, this.absoluteYRadius, rotation,
		-Math.PI / 3, -2 / 3 * Math.PI, false);

	/*
	 * var sqradx = Math.pow(this.absoluteXRadius,2); var sqrady =
	 * Math.pow(this.absoluteYRadius,2);
	 * 
	 * var y =
	 * Math.sqrt((sqradx*sqrady)/(sqradx+sqrady*Math.pow(Math.tan(Math.PI/6),2)));
	 * var x = y* Math.tan(Math.PI/6);
	 * 
	 * canvas.lineTo(this.absolutePos.coords[0]+x,this.absolutePos.coords[1]-y);
	 */

	canvas.closePath();

	if (this.fillColor) {
	    canvas.fillStyle = this.fillColor;
	    canvas.fill();
	}

	if (this.strokeColor) {
	    canvas.strokeStyle = this.strokeColor;
	    canvas.stroke();
	}
    };

    shape.hitTest = function(pos, mouseX, mouseY) {
	return Ellipse.prototype.hitTest.apply(this, arguments);

    };

    this.footprint.shape = shape;
};

function PushButton_B3F_1022(label) {
    ElectronicComponent.call(this, label);
    var t1 = new THT("1-1");
    var t2 = new THT("1-2");
    var t3 = new THT("2-1");
    var t4 = new THT("2-1");

    this.addTerminal(t1);
    this.addTerminal(t2);
    this.addTerminal(t3);
    this.addTerminal(t4);

    /* the distance between the connected terminals */
    var pairTermDist = 7 / 2;

    /* the distance between the disconnected terminals */
    var difTermDist = 5 / 2;

    /* t1 and t2 are connected and t3 with t4 */

    this.addInternalConnection(new Connection([ t1, t2 ]));
    this.addInternalConnection(new Connection([ t3, t4 ]));

    this.terminals[0].footprint.shape = PcbUtil.generators
	    .standardTerminalFootprint();
    this.terminals[1].footprint.shape = PcbUtil.generators
	    .standardTerminalFootprint();

    this.terminals[2].footprint.shape = PcbUtil.generators
	    .standardTerminalFootprint();
    this.terminals[3].footprint.shape = PcbUtil.generators
	    .standardTerminalFootprint();

    this.terminals[0].footprint.setRelativePos(-pairTermDist, -difTermDist);
    this.terminals[1].footprint.setRelativePos(pairTermDist, -difTermDist);

    this.terminals[2].footprint.setRelativePos(pairTermDist, difTermDist);
    this.terminals[3].footprint.setRelativePos(-pairTermDist, difTermDist);

    var shape = new Rectangle(9, 7, '#000000');

    /* dimensions of the button itself */
    shape.radX = 1.5;
    shape.radY = 1.5;

    shape.draw = function(canvas, position, scale, rotation) {
	Rectangle.prototype.draw.apply(this, arguments);
	Ellipse.prototype.draw.apply(this, arguments);
    };

    this.footprint.shape = shape;
}

PushButton_B3F_1022.prototype = new ElectronicComponent();
PushButton_B3F_1022.prototype.constructor = PushButton_B3F_1022;

PushButton_B3F_1022.prototype.toDevice = function() {
    return new PushButton4T(this.label, this);
};

function ResistanceComp(label) {
    ElectronicComponent.call(this, label);
    this.createTerminals(2);
}

ResistanceComp.prototype = new ElectronicComponent();
ResistanceComp.prototype.constructor = ResistanceComp;

ResistanceComp.prototype.toDevice = function() {
    return new Resistance(this.label, this);
};

function Resistance_Quorter_Watt(label) {
    ResistanceComp.call(this, label);

    this.terminals[0].footprint.shape = PcbUtil.generators
	    .standardTerminalFootprint();
    this.terminals[1].footprint.shape = PcbUtil.generators
	    .standardTerminalFootprint();

    this.terminals[0].footprint.setRelativePos(-5, 0);
    this.terminals[1].footprint.setRelativePos(5, 0);

    this.footprint.shape = new Rectangle(6, 2);
}

Resistance_Quorter_Watt.prototype = new ResistanceComp();
Resistance_Quorter_Watt.prototype.constructor = Resistance_Quorter_Watt;

/**
 * Degson 2 ways terminal block 24A ( DG300-5.0-02P-12-00A(H) ) {@link}
 * https://octopart.com/dg300-5.0-02p-12-00a(h)-degson-30865554
 * 
 * @param label
 */
function DG300_5_0_2P12(label) {
    ElectronicComponent.call(this, label);

    /* terminals are labeled starting from left to right looking from the front */
    this.addTerminal(new THT("1",new Hole(0.6)));
    this.addTerminal(new THT("2",new Hole(0.6)));

    this.deviceMappings[DeviceTypes.DC_SUPPLY.N] = {
	"GND" : 0,
	"VCC" : 1
    };

    this.terminals[0].footprint.shape = PcbUtil.generators
	    .circleTerminalFootprint(1.2);
    this.terminals[1].footprint.shape = PcbUtil.generators
	    .circleTerminalFootprint(1.2);

    this.terminals[0].footprint.setRelativePos(0.5, -2.5);
    this.terminals[1].footprint.setRelativePos(0.5, 2.5);

    this.footprint.shape = new Rectangle(9, 11);

}

DG300_5_0_2P12.prototype = new ElectronicComponent();
DG300_5_0_2P12.prototype.constructor = DG300_5_0_2P12;

function TO220(label) {
    ElectronicComponent.call(this, label);
    this.createTerminals(3);

    this.terminals[0].footprint.shape = PcbUtil.generators
	    .standardTerminalFootprint();
    this.terminals[1].footprint.shape = PcbUtil.generators
	    .standardTerminalFootprint();
    this.terminals[2].footprint.shape = PcbUtil.generators
	    .standardTerminalFootprint();

    this.terminals[0].footprint.setRelativePos(-2.5, 1);
    this.terminals[1].footprint.setRelativePos(0, 1);
    this.terminals[2].footprint.setRelativePos(2.5, 1);

    this.footprint.shape = new Rectangle(10, 4);
}

TO220.prototype = new ElectronicComponent();
TO220.prototype.constructor = TO220;

/* voltage regulator */
function L78XXComp(label) {
    TO220.call(this, label);

    this.terminals[0].setLabel("Vin");
    this.terminals[1].setLabel("GND");
    this.terminals[2].setLabel("Vout");

    this.deviceMappings[DeviceTypes.L78XX.N] = {
	"Vin" : 2,
	"GND" : 1,
	"Vout" : 0
    };
}

L78XXComp.prototype = new TO220();
L78XXComp.prototype.constructor = L78XXComp;

L78XXComp.prototype.toDevice = function() {
    return new L78XX(this.label, this);
};

/**
 * @param fi -
 *                the diameter of the capacitor
 * @param raster -
 *                the distance between legs
 */
function ElectrolyticCapComp(label, fi, raster) {
    ElectronicComponent.call(this, label);

    this.fi = fi;
    this.raster = raster;

    this.addTerminal(new THT("A",new Hole(0.3)));
    this.addTerminal(new THT("C",new Hole(0.3)));

    this.deviceMappings[DeviceTypes.CAPACITOR.N] = {
	"A" : 0,
	"C" : 1
    };
};

ElectrolyticCapComp.prototype = new ElectronicComponent();
ElectrolyticCapComp.prototype.constructor = ElectrolyticCapComp;

ElectrolyticCapComp.prototype.init = function(device) {

    if (this.raster == undefined) {
	throw "Raster not defined for " + this.label;
    }

    if (this.fi == undefined) {
	throw "Fi not defned for " + this.label;
    }

    var af = device.getAnode().footprint;
    af.shape = PcbUtil.generators.LEDcathodeFootprint();
    af.setRelativePos(0, PcbUtil.constants.LEDDif);

    var cf = device.getCathode().footprint;
    cf.shape = PcbUtil.generators.LEDanodeFootprint();
    cf.setRelativePos(0, -PcbUtil.constants.LEDDif);

    var shape = new Ellipse('#000000');
    shape.radX = this.fi / 2;
    shape.radY = this.fi / 2;

    this.footprint.shape = shape;
};

ElectrolyticCapComp.prototype.toDevice = function() {
    return new Capacitor(this.label, this);
};

function CeramicCapComp(label, raster, w, h) {
    ElectronicComponent.call(this, label);

    this.raster = raster;

    this.addTerminal(new THT("1",new Hole(0.3)));
    this.addTerminal(new THT("2",new Hole(0.3)));

    this.terminals[0].footprint.shape = PcbUtil.generators
	    .circleTerminalFootprint(0.8);
    this.terminals[1].footprint.shape = PcbUtil.generators
	    .circleTerminalFootprint(0.8);

    this.terminals[0].footprint.setRelativePos(-raster / 2, 0);
    this.terminals[1].footprint.setRelativePos(raster / 2, 0);

    this.footprint.shape = new Ellipse(w / 2, h / 2);

}

CeramicCapComp.prototype = new ElectronicComponent();
CeramicCapComp.prototype.constructor = CeramicCapComp;

CeramicCapComp.prototype.toDevice = function() {
    return new Capacitor(this.label, this);
};

function TO220Transistor(label) {
    TO220.call(this, label);

    this.terminals[0].setLabel("B");
    this.terminals[1].setLabel("C");
    this.terminals[2].setLabel("E");

    this.deviceMappings[DeviceTypes.BIPOLAR_TRANSISTOR.N] = {
	"B" : 2,
	"C" : 1,
	"E" : 0
    };

};

TO220Transistor.prototype = new TO220();
TO220Transistor.prototype.constructor = TO220Transistor;

TO220Transistor.prototype.toDevice = function() {
    return new BipolarTransistor(this.label, this);
};

function TO92Comp(label) {
    ElectronicComponent.call(this, label);
    this.createTerminals(3);

    this.terminals[0].footprint.shape = PcbUtil.generators
	    .standardTerminalFootprint();
    this.terminals[1].footprint.shape = PcbUtil.generators
	    .standardTerminalFootprint();

    this.terminals[2].footprint.shape = PcbUtil.generators
	    .standardTerminalFootprint();

    this.terminals[1].footprint.setRelativePos(0, 0);
    this.terminals[0].footprint.setRelativePos(-2.5, 0);
    this.terminals[2].footprint.setRelativePos(2.5, 0);

    var shape = new Shape('#000000');
    shape.radX = 2.1;
    shape.radY = 2.1;

    shape.draw = function(canvas, position, scale, rotation) {

	var coords = position.coords;

	canvas.beginPath();

	this.absolutePos = new Point([ scale[0] * coords[0],
		scale[1] * coords[1] ]);
	this.absoluteXRadius = this.radX * scale[0];
	this.absoluteYRadius = this.radY * scale[1];

	canvas.ellipse(this.absolutePos.coords[0], this.absolutePos.coords[1],
		this.absoluteXRadius, this.absoluteYRadius, rotation,
		5 * Math.PI / 6, Math.PI / 6, false);

	/*
	 * var sqradx = Math.pow(this.absoluteXRadius,2); var sqrady =
	 * Math.pow(this.absoluteYRadius,2);
	 * 
	 * var y =
	 * Math.sqrt((sqradx*sqrady)/(sqradx+sqrady*Math.pow(Math.tan(Math.PI/6),2)));
	 * var x = y* Math.tan(Math.PI/6);
	 * 
	 * canvas.lineTo(this.absolutePos.coords[0]+x,this.absolutePos.coords[1]-y);
	 */

	canvas.closePath();

	if (this.fillColor) {
	    canvas.fillStyle = this.fillColor;
	    canvas.fill();
	}

	if (this.strokeColor) {
	    canvas.strokeStyle = this.strokeColor;
	    canvas.stroke();
	}
    };

    shape.hitTest = function(pos, mouseX, mouseY) {
	return Ellipse.prototype.hitTest.apply(this, arguments);

    };

    this.footprint.shape = shape;
}


TO92Comp.prototype = new ElectronicComponent();
TO92Comp.prototype.constructor = TO92Comp;

function TO92Transistor(label) {
    TO92Comp.call(this, label);

    this.terminals[0].setLabel("C");
    this.terminals[1].setLabel("B");
    this.terminals[2].setLabel("E");

    this.deviceMappings[DeviceTypes.BIPOLAR_TRANSISTOR.N] = {
	"C" : 0,
	"B" : 1,
	"E" : 2
    };

}

TO92Transistor.prototype = new TO92Comp();
TO92Transistor.prototype.constructor = TO92Transistor;

TO92Transistor.prototype.toDevice = function() {
    return new BipolarTransistor(this.label, this);
};

function QuartzCrystalHC49_S(label) {
    ElectronicComponent.call(this, label);
    this.createTerminals(2);

    this.terminals[0].footprint.shape = PcbUtil.generators
	    .standardTerminalFootprint();
    this.terminals[1].footprint.shape = PcbUtil.generators
	    .standardTerminalFootprint();

    this.terminals[0].footprint.setRelativePos(-2.5, 0);
    this.terminals[1].footprint.setRelativePos(2.5, 0);

    var shape = new Rectangle(11, 4, '#000000');
    shape.radX = 5.5;
    shape.radY = 2;

    shape.draw = function(canvas, position, scale, rotation) {
	Rectangle.prototype.draw.apply(this, arguments);
	Ellipse.prototype.draw.apply(this, arguments);
    };

    this.footprint.shape = shape;

}

QuartzCrystalHC49_S.prototype = new ElectronicComponent();
QuartzCrystalHC49_S.prototype.constructor = QuartzCrystalHC49_S;

QuartzCrystalHC49_S.prototype.toDevice = function() {
    return new QuartzCrystal(this.label, this);
};
