var universe = new Universe();

/* solar tracker circuit */
var stc = new ElectronicCircuit();

var ic1 = new ElectronicDevice(DeviceTypes.ATMEGA_328.N, "MCU", new DIL(28));

var led1 = new LED("LED", new LED_5mm("LED"));

var pushb = new PushButton_B3F_1022("button").toDevice();

var led_R = new Resistance_Quorter_Watt("LED RES").toDevice();

var supply = new DCSupply("supply", new DG300_5_0_2P12("supply"), {
    "GND" : 1,
    "VCC" : 0
});

var l7812 = new L78XXComp("L7812ABV").toDevice();

var l7805 = new L78XXComp("L7805ABV").toDevice();

var cap033uF = new ElectrolyticCapComp("C033uF", 5, 2).toDevice();
var cap100nFReg = new ElectrolyticCapComp("C100nFReg", 5, 2).toDevice();

var quartz = new QuartzCrystalHC49_S("Quartz").toDevice();

var motorOut = new Output2T("MOUT", new DG300_5_0_2P12("MOUT"));

var xtalCap1 = new CeramicCapComp("xtalcap1", 2, 3, 2).toDevice();

var xtalCap2 = new CeramicCapComp("xtalcap2", 2, 3, 2).toDevice();

var arefCap = new CeramicCapComp("arefCap", 4, 6, 2).toDevice();

var resetRes = new Resistance_Quorter_Watt("ResetRes").toDevice();

var mControlRes1 = new Resistance_Quorter_Watt("mControlRes1").toDevice();
var mControlRes2 = new Resistance_Quorter_Watt("mControlRes2").toDevice();

var bc337_1 = new TO92Transistor("BC337-1").toDevice();
var bc337_2 = new TO92Transistor("BC337-2").toDevice();

var tip122_1 = new TO220Transistor("TIP122-1").toDevice();
var tip122_2 = new TO220Transistor("TIP122-2").toDevice();

var tip127_1 = new TO220Transistor("TIP127-1").toDevice();
var tip127_2 = new TO220Transistor("TIP127-2").toDevice();

var d1 = new StandingDiodeComp("d1").toDevice();
var d2 = new StandingDiodeComp("d2").toDevice();
var d3 = new StandingDiodeComp("d3").toDevice();
var d4 = new StandingDiodeComp("d4").toDevice();

stc.addDevice(ic1);
stc.addDevice(led1);
stc.addDevice(led_R);

stc.addDevice(pushb);
stc.addDevice(supply);

stc.addDevice(l7812);
stc.addDevice(l7805);

stc.addDevice(cap033uF);
stc.addDevice(cap100nFReg);

stc.addDevice(quartz);

stc.addDevice(motorOut);

stc.addDevice(xtalCap1);
stc.addDevice(xtalCap2);

stc.addDevice(resetRes);

stc.addDevice(mControlRes1);
stc.addDevice(mControlRes2);

stc.addDevice(arefCap);

stc.addDevice(bc337_1);
stc.addDevice(bc337_2);

stc.addDevice(tip122_1);
stc.addDevice(tip122_2);

stc.addDevice(tip127_1);
stc.addDevice(tip127_2);

stc.addDevice(d1);
stc.addDevice(d2);
stc.addDevice(d3);
stc.addDevice(d4);

/* connections */

var gndConn = new Connection([ supply.getGnd(), cap033uF.getCathode(),
	cap100nFReg.getCathode(), l7812.getGnd(), l7805.getGnd(),
	led1.getCathode(), pushb.comp.terminals[0] ]);

stc.addConnection(gndConn);

var vccConn = new Connection([ supply.getVcc(), cap033uF.getAnode(),
	l7812.getVin() ]);

stc.addConnection(vccConn);

var pcb1 = stc.createPCB();

universe.setScale([ 4.7, 4.7 ]);
pcb1.shape = new Rectangle(50, 70,'#000000');
//pcb1.shape.strokeColor=undefined;
console.log(pcb1.shape.strokeColor);
pcb1.setPosition(70, 60);
pcb1.selectable = false;

universe.addObject(pcb1);

// pcb1.setComponentsVisible(false);

ic1.comp.footprint.setRelativePos(0, 0);

//led1.comp.footprint.rotate(Math.PI);
led1.comp.footprint.setRelativePos(21, 10);

led_R.comp.footprint.setRelativePos(12, 10);

pushb.comp.footprint.setRelativePos(18, 2);

supply.comp.footprint.setRelativePos(20, -25);

motorOut.comp.footprint.setRelativePos(20, 20);

l7812.comp.footprint.rotate(-Math.PI / 2);
l7812.comp.footprint.setRelativePos(2, -29);

l7805.comp.footprint.rotate(Math.PI / 2);

l7805.comp.footprint.setRelativePos(-2, -29);

cap033uF.comp.footprint.setRelativePos(11, -25);

cap100nFReg.comp.footprint.rotate(Math.PI);
cap100nFReg.comp.footprint.setRelativePos(8, -31);

quartz.comp.footprint.rotate(Math.PI / 2);

quartz.comp.footprint.setRelativePos(-15, 2);

xtalCap1.comp.footprint.rotate(-Math.PI / 2);
xtalCap1.comp.footprint.setRelativePos(-10, 3);

xtalCap2.comp.footprint.rotate(Math.PI / 2);
xtalCap2.comp.footprint.setRelativePos(-7, 3);

arefCap.comp.footprint.rotate(Math.PI / 2);
arefCap.comp.footprint.setRelativePos(9, 0);

resetRes.comp.footprint.rotate(Math.PI / 2);
resetRes.comp.footprint.setRelativePos(-9, -21);

mControlRes1.comp.footprint.rotate(Math.PI / 2);
mControlRes1.comp.footprint.setRelativePos(12, 22);

mControlRes2.comp.footprint.setRelativePos(-12, 11);

// bc337_1.comp.footprint.rotate(-Math.PI/2);
bc337_1.comp.footprint.setRelativePos(20, 30);

bc337_2.comp.footprint.rotate(Math.PI);
bc337_2.comp.footprint.setRelativePos(-15, 15);

tip122_1.comp.footprint.rotate(Math.PI / 2);
tip122_1.comp.footprint.setRelativePos(-15, 25);

tip127_1.comp.footprint.rotate(-Math.PI / 2);
tip127_1.comp.footprint.setRelativePos(-11, 25);

tip122_2.comp.footprint.rotate(-Math.PI / 2);
tip122_2.comp.footprint.setRelativePos(4, 25);

tip127_2.comp.footprint.rotate(Math.PI / 2);
tip127_2.comp.footprint.setRelativePos(0, 25);

//d1.comp.footprint.rotate(Math.PI);
d1.comp.footprint.setRelativePos(-19, 28);

d2.comp.footprint.rotate(Math.PI);
d2.comp.footprint.setRelativePos(-5.5, 28);

d3.comp.footprint.rotate(Math.PI);
d3.comp.footprint.setRelativePos(9, 22);

d4.comp.footprint.setRelativePos(-5.5, 23);

for ( var i in pcb1.components) {
    var c = pcb1.components[i];
    var fp = c.footprint;
    if (fp == undefined) {
	continue;
    }
    var rp = fp.relPos;
    fp.setRelativePos(-rp.coords[0], rp.coords[1]);

    if (Math.abs(fp.rotation) == CONSTANTS.half_PI) {
	fp.rotate(Math.PI);
    }
}

supply.comp.footprint.rotate(-Math.PI);
motorOut.comp.footprint.rotate(Math.PI);


function TrackBuilder() {
    this.points = [];
    this.lastPoint;
}

TrackBuilder.prototype = new TrackBuilder();
TrackBuilder.prototype.constructor = TrackBuilder;

TrackBuilder.prototype.getTrack = function() {
    var shape = new CustomShape(this.points);
    var track = new Track();
    track.footprint.shape = shape;
    shape.strokeColor = '#ff0000';
    return track;
};

TrackBuilder.prototype.pushPoint = function(point) {
    this.points.push(point);
    this.lastPoint = point;

};

/**
 * Starts a track from point, from rotation, with radius
 * 
 * @param point
 * @param rot
 * @param radius
 */
TrackBuilder.prototype.startTrack = function(point, rot, radius) {

    this.pushPoint(this.getPointOnCircle(point, rot, radius));

};

/**
 * Returns a point that sits on a circle with the given center and radius, at
 * the given rotation
 * 
 * @param center
 * @param rot
 * @param radius
 */
TrackBuilder.prototype.getPointOnCircle = function(center, rot, radius) {
    var x = center.coords[0] + radius * Math.cos(rot);
    var y = center.coords[1] - radius * Math.sin(rot);

    return new Point([ x, y ]);
};

/**
 * Adds a trace from the last point in the given direction for a given distance
 * 
 * @param distFunc
 * @param direction
 */
TrackBuilder.prototype.addTrace = function(dist, direction) {

    var endx = this.lastPoint.coords[0] + dist * Math.cos(direction);
    var endy = this.lastPoint.coords[1] - dist * Math.sin(direction);

    this.pushPoint(new Point([ endx, endy ]));
};

/**
 * Adds a trace from point, from rotation, with radius, for a distance given by
 * distFunc with rotation given by direction
 * 
 * @param point
 * @param rot
 * @param radius
 * @param distFunc
 * @param direction
 */
TrackBuilder.prototype.traceToY = function(point, rot, radius, direction,
	skipEndpoint) {

    var endPoint = this.getPointOnCircle(point, rot, radius);

    var intery = endPoint.coords[1];

    var lpc = this.lastPoint.coords;
    var interx = lpc[0] - (intery - lpc[1]) * Math.tan(direction);

    this.pushPoint(new Point([ interx, intery ]));
    if (!skipEndpoint) {
	this.pushPoint(endPoint);
    }

};

TrackBuilder.prototype.traceToX = function(point, rot, radius, direction,
	skipEndpoint) {

    var endPoint = this.getPointOnCircle(point, rot, radius);

    var interx = endPoint.coords[0];

    var lpc = this.lastPoint.coords;
    var intery = lpc[1];
    if (direction != 0 && (direction % Math.PI) != 0) {
	intery -= (interx - lpc[0]) / Math.tan(direction);
    }

    this.pushPoint(new Point([ interx, intery ]));
    if (!skipEndpoint) {
	this.pushPoint(endPoint);
    }

};



var gndTb1 = new TrackBuilder();

gndTb1.startTrack(supply.getGnd().footprint.getRelativePos(1), -3 * Math.PI/ 4, 2);
gndTb1.addTrace(3, 0);
gndTb1.traceToY(cap033uF.getCathode().footprint.getRelativePos(1), CONSTANTS.SE,
	1, CONSTANTS.SE);


gndTb1.traceToY(l7812.getGnd().footprint.getRelativePos(1), CONSTANTS.SE, 1,
	CONSTANTS.NE);
gndTb1.addTrace(2, CONSTANTS.SE);
gndTb1.addTrace(4, CONSTANTS.SOUTH);
gndTb1.traceToX(ic1.comp.terminals[21].footprint.getRelativePos(1), CONSTANTS.NE,
	  2.5, CONSTANTS.SW); 
gndTb1.traceToY(ic1.comp.terminals[21].footprint.getRelativePos(1), CONSTANTS.NW,
	  1, CONSTANTS.SW); 


gndTb1.traceToY(arefCap.comp.terminals[1].footprint.getRelativePos(1), CONSTANTS.NW, 1, CONSTANTS.NW);
gndTb1.traceToY(pushb.comp.terminals[1].footprint.getRelativePos(1), CONSTANTS.NW, 1, CONSTANTS.SW);
gndTb1.traceToX(led1.getCathode().footprint.getRelativePos(1), CONSTANTS.NE, 2, CONSTANTS.SW);

gndTb1.traceToY(led1.getCathode().footprint.getRelativePos(1), CONSTANTS.NW, 1, CONSTANTS.SW);
gndTb1.addTrace(1.5, CONSTANTS.SOUTH);
gndTb1.addTrace(1.5, CONSTANTS.EAST);
gndTb1.traceToX(pushb.comp.footprint.getRelativePos(), CONSTANTS.SE, 2, CONSTANTS.NE);
gndTb1.traceToY(pushb.comp.terminals[1].footprint.getRelativePos(1), CONSTANTS.SE, 1, CONSTANTS.NE);
gndTb1.addTrace(3,CONSTANTS.EAST);
gndTb1.traceToY(arefCap.comp.terminals[1].footprint.getRelativePos(1), CONSTANTS.SE, 1, CONSTANTS.NE);
gndTb1.traceToY(ic1.comp.terminals[21].footprint.getRelativePos(1), CONSTANTS.SE,
	  1, CONSTANTS.SE); 
gndTb1.addTrace(3,CONSTANTS.NE);
gndTb1.addTrace(18,CONSTANTS.NORTH);
gndTb1.addTrace(2,CONSTANTS.NE);
gndTb1.addTrace(5,CONSTANTS.NORTH);



gndTb1.traceToY(l7805.getGnd().footprint.getRelativePos(1), CONSTANTS.SE, 1,
	CONSTANTS.NE);
gndTb1.addTrace(10, CONSTANTS.EAST);

var auxPoint1 = new Point([20,0]);

gndTb1.traceToX(auxPoint1,
	CONSTANTS.WEST, 1, CONSTANTS.SE,true);
gndTb1.addTrace(9, CONSTANTS.SOUTH);

  
  gndTb1.traceToY(ic1.comp.terminals[7].footprint.getRelativePos(1), CONSTANTS.NW,
  1, CONSTANTS.SW); 
  

  
  
  gndTb1.addTrace(2,CONSTANTS.WEST);
  gndTb1.addTrace(3,CONSTANTS.SW);
  gndTb1.addTrace(15,CONSTANTS.SOUTH);
  
  gndTb1.traceToY(d3.getAnode().footprint.getRelativePos(1), CONSTANTS.NW, 1, CONSTANTS.SW);
  gndTb1.addTrace(1,CONSTANTS.SOUTH);
  gndTb1.traceToY(tip122_2.getEmitor().footprint.getRelativePos(1), CONSTANTS.SE, 1, CONSTANTS.SE);
  gndTb1.addTrace(8,CONSTANTS.NE);
  gndTb1.addTrace(14,CONSTANTS.NORTH);
  gndTb1.traceToY(ic1.comp.terminals[7].footprint.getRelativePos(1), CONSTANTS.SE,
	  1, CONSTANTS.NE); 
  
  
  gndTb1.traceToY(xtalCap2.comp.terminals[1].footprint.getRelativePos(1),
	  CONSTANTS.SE, 1, CONSTANTS.SE); 

 // gndTb1.addTrace(1.5,CONSTANTS.SOUTH);
  //gndTb1.addTrace(10,CONSTANTS.EAST);
  gndTb1.traceToY(xtalCap1.comp.terminals[0].footprint.getRelativePos(1),
  CONSTANTS.SE, 1, CONSTANTS.NE); 
  gndTb1.addTrace(1,CONSTANTS.NORTH);
  gndTb1.traceToY(xtalCap2.comp.terminals[1].footprint.getRelativePos(1),
  CONSTANTS.NW, 1, CONSTANTS.NW);
  gndTb1.traceToY(ic1.comp.terminals[7].footprint.getRelativePos(1),
  CONSTANTS.EAST, 3, CONSTANTS.SW); 
  
  gndTb1.addTrace(10,CONSTANTS.NE);
  gndTb1.addTrace(7, CONSTANTS.EAST);
  gndTb1.addTrace(32, CONSTANTS.SOUTH);
  
  gndTb1.traceToX(d1.getAnode().footprint.getRelativePos(1),
	  CONSTANTS.NE, 1, CONSTANTS.SW); 
  gndTb1.traceToY(tip122_1.getEmitor().footprint.getRelativePos(1),
	  CONSTANTS.NW, 1, CONSTANTS.SW); 
  gndTb1.addTrace(1.5,CONSTANTS.SOUTH);
  gndTb1.traceToY(d1.getAnode().footprint.getRelativePos(1),
	  CONSTANTS.SE, 1, CONSTANTS.NW); 
  gndTb1.addTrace(5,CONSTANTS.NE);
  gndTb1.addTrace(36, CONSTANTS.NORTH);
  
  gndTb1.traceToX(auxPoint1,
		CONSTANTS.EAST, 1, CONSTANTS.NW,true);
  
  
 // gndTb1.traceToX(gndTb1.points[8],  CONSTANTS.SE, 2.5, CONSTANTS.NE,true); 
 // gndTb1.traceToX(gndTb1.points[7], CONSTANTS.NE,  2.5, CONSTANTS.NORTH);
  gndTb1.addTrace(10, CONSTANTS.NORTH);
  
  gndTb1.traceToY(l7812.getGnd().footprint.getRelativePos(1),CONSTANTS.NW,1.2,CONSTANTS.NW);
  gndTb1.traceToY(cap100nFReg.getCathode().footprint.getRelativePos(1),
  CONSTANTS.NW, 1, CONSTANTS.NW);
  gndTb1.traceToY(cap033uF.getCathode().footprint.getRelativePos(1),
  CONSTANTS.NORTH, 1, CONSTANTS.SW,true);
  
  gndTb1.traceToY(supply.getGnd().footprint.getRelativePos(1), CONSTANTS.NW, 2,CONSTANTS.NW);


var gndTrack1 = gndTb1.getTrack();

//pcb1.addTrack(gndTrack1);

//var vout12tb = new TrackBuilder();
//
//vout12tb.startTrack(l7812.getVout().footprint.getRelativePos(1), CONSTANTS.NE, 1);
//vout12tb.addTrace(21, CONSTANTS.WEST);
//vout12tb.addTrace(2, CONSTANTS.SW);
//vout12tb.addTrace(65, CONSTANTS.SOUTH);
//
//var vout12track = vout12tb.getTrack();
//
//pcb1.addTrack(vout12track);



