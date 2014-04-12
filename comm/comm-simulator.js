var medium = new CommMedium();
medium.powerDecayRatePerUnit = 0.07;
medium.propagationSpeed = 100; // pixels per second

var protocol = new CommProtocol();


//var transceiver1 = new Transceiver("tr1");
//
//
//var transceiver2 = new Transceiver("tr2");
//
//
//var transceiver3 = new Transceiver("tr3");
//
//
//var node1 = new CommNode("node 1", transceiver1, protocol);
//var node2 = new CommNode("node 2", transceiver2, protocol);
//var node3 = new CommNode("node 3", transceiver3, protocol);
//
//var node4 = new CommNode("node 4", new Transceiver("tr4"),protocol);
//
//node1.position = new Point([10,10]);
//node2.position= new Point([120,50]);
//node3.position = new Point([40,50]);
//
//node4.position = new Point([400,500]);
//
//
//medium.addObject(node1);
//medium.addObject(node2);
//medium.addObject(node3);
//medium.addObject(node4);



var nodes = 10;

for(var i=0;i<nodes;i++){
    var n = new CommNode("n "+(i+1),new Transceiver("tr "+i),protocol);
    n.position = new Point([Math.round(Math.random()*800),Math.round(Math.random()*600)]);
    medium.addObject(n);
}

