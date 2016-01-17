var universe = new Universe();

/* solar tracker circuit */
var stc = new ElectronicCircuit();


var ic1 = new ElectronicDevice(DeviceTypes.ATMEGA_328.N, "MCU", new DIL(28));

var led1 = new LED("LED", new LED_5mm("LED"));

var pushb = new PushButton_B3F_1022("button").toDevice();

var led_R = new Resistance_Quorter_Watt("LED RES").toDevice();

var supply = new DCSupply("supply", new DG300_5_0_2P12("supply"));

var l7812 = new L78XXComp("L7812ABV").toDevice();

var l7805 = new L78XXComp("L7805ABV").toDevice();

var cap033uF = new ElectrolyticCapComp("C033uF",5,2).toDevice();
var cap100nFReg = new ElectrolyticCapComp("C100nFReg",5,2).toDevice();

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




var pcb1 = stc.createPCB();


pcb1.setScale([4.7,4.7]);
pcb1.shape=new Rectangle(50,70);
pcb1.setPosition(70,60);


universe.addObject(pcb1);


var gndConn = new Connection([supply.getGnd(),led1.getCathode(),pushb.comp.terminals[0],l7812.getGnd(),l7805.getGnd(),cap033uF.getCathode(),cap100nFReg.getCathode()]);

pcb1.addConnection(gndConn);

var vccConn = new Connection([supply.getVcc(),cap033uF.getAnode(),l7812.getVin()]);

pcb1.addConnection(vccConn);


ic1.comp.footprint.setRelativePos(0,0);
led1.comp.footprint.rotate(Math.PI);
led1.comp.footprint.setRelativePos(21,10);



led_R.comp.footprint.setRelativePos(12, 8.7);


pushb.comp.footprint.setRelativePos(18,2);

supply.comp.footprint.setRelativePos(20,-29);


motorOut.comp.footprint.setRelativePos(20, 20);


l7812.comp.footprint.rotate(-Math.PI/2);
l7812.comp.footprint.setRelativePos(2,-29);

l7805.comp.footprint.rotate(Math.PI/2);

l7805.comp.footprint.setRelativePos(-2,-29);

cap033uF.comp.footprint.setRelativePos(12,-26);

cap100nFReg.comp.footprint.rotate(Math.PI);
cap100nFReg.comp.footprint.setRelativePos(8, -31);

quartz.comp.footprint.rotate(Math.PI/2);

quartz.comp.footprint.setRelativePos(-20,0);

xtalCap1.comp.footprint.rotate(Math.PI/2);
xtalCap1.comp.footprint.setRelativePos(-15,-2);

xtalCap2.comp.footprint.rotate(Math.PI/2);
xtalCap2.comp.footprint.setRelativePos(-10,2);

arefCap.comp.footprint.rotate(Math.PI/2);
arefCap.comp.footprint.setRelativePos(9,0);

resetRes.comp.footprint.rotate(Math.PI/2);
resetRes.comp.footprint.setRelativePos(-9,-21);

mControlRes1.comp.footprint.rotate(Math.PI/2);
mControlRes1.comp.footprint.setRelativePos(12,22);

mControlRes2.comp.footprint.setRelativePos(-15,11);


bc337_1.comp.footprint.rotate(-Math.PI/2);
bc337_1.comp.footprint.setRelativePos(7,27);


bc337_2.comp.footprint.rotate(Math.PI);
bc337_2.comp.footprint.setRelativePos(-20,15);


