var medium = new CommMedium();
medium.powerDecayRatePerUnit = 0.07;
medium.propagationSpeed = 700; // pixels per second

var protocol = new CommProtocol();

var transceiver1 = new Transceiver("tr1");


var transceiver2 = new Transceiver("tr2");


var transceiver3 = new Transceiver("tr3");


//medium.addTransceiver(transceiver1);
//medium.addTransceiver(transceiver2);
//medium.addTransceiver(transceiver3);

var node1 = new CommNode("node 1", transceiver1, protocol);
var node2 = new CommNode("node 2", transceiver2, protocol);
var node3 = new CommNode("node 3", transceiver3, protocol);

var node4 = new CommNode("node 4", new Transceiver("tr4"),protocol);
//node1.addPart(transceiver1);
//node2.addPart(transceiver2);
//node3.addPart(transceiver3);

node1.position = new Point([10,10]);
node2.position= new Point([120,50]);
node3.position = new Point([40,50]);

node4.position = new Point([400,500]);


medium.addObject(node1);
medium.addObject(node2);
medium.addObject(node3);
medium.addObject(node4);

node1.sendMessage({"body":"hello from node 1"});


