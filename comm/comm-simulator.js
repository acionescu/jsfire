var medium = new CommMedium();
medium.powerDecayRatePerUnit = 1;

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

//node1.addPart(transceiver1);
//node2.addPart(transceiver2);
//node3.addPart(transceiver3);

node1.position = new Point([0,0]);
node2.position= new Point([12,5]);
node3.position = new Point([4,5]);


medium.addObject(node1);
medium.addObject(node2);
medium.addObject(node3);

node1.sendMessage({"body":"hello from node 1"});