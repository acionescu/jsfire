var medium = new CommMedium();
medium.powerDecayRatePerUnit = 1;

var protocol = new CommProtocol();

var transceiver1 = new Transceiver();
transceiver1.position = new Point([0,0]);

var transceiver2 = new Transceiver();
transceiver2.position= new Point([12,5]);

var transceiver3 = new Transceiver();
transceiver3.position = new Point([4,5]);

medium.addTransceiver(transceiver1);
medium.addTransceiver(transceiver2);
medium.addTransceiver(transceiver3);

var node1 = new CommNode("node 1", transceiver1, protocol);
var node2 = new CommNode("node 2", transceiver2, protocol);
var node3 = new CommNode("node 3", transceiver3, protocol);


node1.sendMessage({"body":"hello from node 1"});