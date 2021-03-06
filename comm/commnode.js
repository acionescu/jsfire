/**
 * 
 */

/**
 * Definition of a communication node
 */
function CommNode(id, transceiver, protocol) {
    PhysicalObject.call(this);

    /** id of the node */
    this.id = id;

    /**
     * The data protocol manager
     */
    this.manager = new CommNodeManager(this);

    /**
     * The transceiver that intermediates the communication
     */
    this.transceiver = transceiver;

    /**
     * The protocol used to encode/decode messages
     */
    this.protocol = protocol;

    /* register itself as a listener to the transceiver */
    this.transceiver.registerListener(this);

    /* graphics stuff */

    /**
     * add the transceiver as a physical part of the comm node
     */
    this.addPart(this.transceiver);

    this.shape = new Circle(15,'#000000',"#ffffff");

};

CommNode.prototype = new PhysicalObject();
CommNode.prototype.constructor = CommNode;

/**
 * Main node loop
 */
CommNode.prototype.compute = function(universe) {
    this.manager.loop();
};

/** a function to handle a message received */
CommNode.prototype.onMessage = function(message) {
//    console.log(this.id + " <- " + JSON.stringify(message));
    this.manager.handleMessage(message);
};

/** a function to send a message to a peer */
CommNode.prototype.sendMessage = function(message) {
//    console.log(this.id + " -> " + JSON.stringify(message));
    this.transceiver.transmit(this.protocol.encodeMessage(message));
};

/**
 * a function to handle a received signal from the transceiver
 * 
 * @param signal
 */
CommNode.prototype.receive = function(signal) {
    this.onMessage(this.protocol.decodeSignal(signal));
};


CommNode.prototype.draw = function(canvas){
    PhysicalObject.prototype.draw.apply(this, arguments);
    var coords = this.position.coords;
    canvas.fillStyle='#000000';
    canvas.fillText(this.id,coords[0]-9,coords[1]+3);
};


/**
 * A data communication protocol implementation
 */
function CommNodeManager(node) {
    /**
     * reference to comm node
     */
    this.node = node;

    /** a map of peers indexed by their id */
    this.peers = {};
    
    /**
     * Messages queued to be processed
     */
    this.pendingMessages=[];

    /**
     * When the last hi was sent
     */
    this.lastHiSentTimestamp = 0;
    /**
     * The wait duration before sending a hi message
     */
    this.hiRepeatPeriod = 10000;
    
    /**
     * Max time to wait for a reply 
     */
    this.maxWaitForReply = 5000;
    
    /**
     * a map to hold sent messages
     */
    this.sentMsgHistory={};
}

CommNodeManager.prototype.constructor = CommNodeManager;

/**
 * Main control loop
 */
CommNodeManager.prototype.loop = function() {
    var curTimestamp = new Date().getTime();
    /* send discover */
    if ((curTimestamp - this.lastHiSentTimestamp) > this.hiRepeatPeriod) {
	this.lastHiSentTimestamp=curTimestamp;
	this.discover();
    }
    
    /* cleanup old messages */
    this.purgeOldSentMessages();
    
    /* purge old peers */
    this.purgeOldPeers();
    
    /* process pending messages */
    
    while(this.pendingMessages.length > 0){
	this.processMessage(this.pendingMessages.shift());
    }
    

};


CommNodeManager.prototype.purgeOldPeers = function(){
    /* define the oldest ntmy timestamp expected from the peer */
    var curTime = new Date().getTime();
    var oldestNtmyTimestamp = curTime - (this.hiRepeatPeriod+this.maxWaitForReply);
    for(var p in this.peers){
	var peer = this.peers[p];
	if(peer.lastHeardOf < oldestNtmyTimestamp){
	    delete this.peers[p];
	    console.log(this.node.id+" purged peer "+p);
	}
	
    }
};


CommNodeManager.prototype.sendMessage=function(message){
  message.header._time=new Date().getTime();  
  this.node.sendMessage(message);
  this.sentMsgHistory[message.header._id]=message;
};

CommNodeManager.prototype.purgeOldSentMessages=function(){
  var curTime = new Date().getTime();  
  for(var i in this.sentMsgHistory){
      var m = this.sentMsgHistory[i];
      if( (curTime - m.header._time) > this.maxWaitForReply ){
//	  console.log(this.node.id+": purging  sent message "+i);
	  delete this.sentMsgHistory[i];
      }
  }  
};

/**
 * Message handler
 * 
 * @param message
 */
CommNodeManager.prototype.handleMessage = function(message) {
    /* basic message validation */
    if(!message || !message.header || !message.body){
	return;
    }
    this.pendingMessages.push(message);
    
};

CommNodeManager.prototype.processMessage=function(message){
    var type = message.header._t;

    switch (type) {
    case COMM.MESSAGE.HI:
	this.onHiReceived(message);
	break;
    case COMM.MESSAGE.NTMY:
	this.onNtmyReceived(message);
	break;

    default:
	break;
    }
};



CommNodeManager.prototype.createHiMessage = function(node) {
    return this.createEmptyMessage(COMM.MESSAGE.HI, node.id);
};

/**
 * 
 * @param type
 * @param from
 * @returns {___anonymous3022_3113}
 */
CommNodeManager.prototype.createEmptyMessage = function(type, from) {
    var message = {
	header : {
	    _id : createGuid(),
	    _t : type,
	    from : from
	},
	body : {}
    };

    return message;
};

/* Outgoing */

/** a function to discover peers */
CommNodeManager.prototype.discover = function() {
    var hiMessage = this.createHiMessage(this.node);
    this.sendMessage(hiMessage);
};

/* Incoming */

/** a function called when a peer replied to a discovery call */
CommNodeManager.prototype.onDiscovery = function(peer) {

};

CommNodeManager.prototype.onHiReceived = function(message) {
    var ntmyMsg = this.createEmptyMessage(COMM.MESSAGE.NTMY, this.node.id);
    /* reply to the sender */
    ntmyMsg.header.to = message.header.from;
    /* set the original message  id */
    ntmyMsg.header._origid=message.header._id;
    this.sendMessage(ntmyMsg);
};

CommNodeManager.prototype.onNtmyReceived = function(message) {
    /* check if we find the origin message sent by this node */
//    console.log("check orig message "+message.header._origid);
    var origMessage = this.sentMsgHistory[message.header._origid];
    if(!origMessage){
//	console.log(this.node.id+" discarding "+message);
	return;
    }
    
    /* if we found the origin message */
    
    if(message.header.to==this.node.id){
	this.addPeer(message.header.from,message,this.node.id);
	
	/* add peers of the peer */
	var remotePeers=message.body.peers;
	for(var p in remotePeers){
	    
	}
	
	
    }
};

CommNodeManager.prototype.addPeer=function(nodeId,message,gateway){
    var peer = this.peers[nodeId];
    if(!peer){
	peer = new CommPeer(nodeId);
	this.peers[nodeId]=peer;
	console.log(this.node.id +" added peer "+nodeId);
    }
    var curTime = new Date().getTime();
    peer.lastHeardOf=curTime;
    /* get the route and update/set the delay*/
    var route=peer.getRoute(gateway, true);
    route.delay = curTime - message.header._time;
    
};

/**
 * Global object that holds generic comm data
 */
COMM = {
    /**
     * types of messages
     */
    MESSAGE : {
	/*
	 * the introductory message a node sends to present itself to the
	 * network
	 */
	HI : "_hi"
	/*
	 * nice to meet you : a message sent by a node when it receives a HI
	 * message
	 */
	,
	NTMY : "_ntmy"

    }
};



/**
 * A generic communication protocol through a physical medium
 */

function CommProtocol() {

};

CommProtocol.prototype.constructor = CommProtocol;


/**
 * a function that encodes a message into a signal
 * 
 * @param message
 * @returns {Signal}
 */
CommProtocol.prototype.encodeMessage = function(message) {
    return new CommSignal(message);
};

/**
 * a function that decodes a signal into a message
 * 
 * @param signal
 * @returns
 */
CommProtocol.prototype.decodeSignal = function(signal) {
    return signal.data;
};

/**
 * Definition of a communication node as seen by another node
 */
function CommPeer(peerId) {
    /** id of the peer */
    this.id=peerId;
    
    /**
     * The timestamp of the last message received from this peer
     */
    this.lastHeardOf;

    
    /**
     * the possible routes to this peer
     */
    this.routes={};

}

CommPeer.prototype.constructor = CommPeer;


/**
 * Returns a route for a given gateway. Creates it if it doesn't exist and crete param is true 
 */
CommPeer.prototype.getRoute=function(gateway,create){
    var route = this.routes[gateway];
    if ( !route && create){
	route = new CommRoute();
	this.addRoute(gateway,route);
    }
    return route;
};

CommPeer.prototype.addRoute=function(gateway,route){
    this.routes[gateway] = route;
};


function CommRoute(){
    /**
     * an array of peers through which a packet needs to pass to reach
     * the target
     */
    this.hops = [];
    
    this.hopsCount;
    
    /** time necessary to reach the peer node */
    this.delay;
}

CommRoute.prototype.constructor=CommRoute;


/**
 * Definition of a communication message
 * 
 * @returns
 */
function Message(header, body) {
    /**
     * The header of the message that contains meta data
     * Fields: 
     * _t -> message type
     * _id -> unique message id
     * from -> the sender's id
     * to -> the receiver's id
     * _origid -> present in a reply message and represents the id of the message to which the current
     * message replies to
     * 
     */
    this.header = header;
    /**
     * The actual content of the message
     */
    this.body = body;

};

Message.prototype.constructor = Message;

/**
 * Definition of a communication signal
 */
function CommSignal(data, power, sourcePosition) {
    PhysicalObject.call(this);

    /**
     * Position of the source that emitted this signal
     */
    this.sourcePosition = sourcePosition;

    /**
     * Power level of the signal
     */
    this.power = power;

    /**
     * The data encoded in the signal
     */
    this.data = data;

    /**
     * Keep the original signal power
     */
    this.originalPower = power;

    /**
     * Total distance traveled since emitted
     */
    this.totalDistanceTraveled;

    /**
     * A long value that holds the timestamp when this signal was emitted
     */
    this.emissionTime;

    /**
     * Last computation time
     */

    this.lastComputationTime;

    this.shape = new Circle(0);

};

CommSignal.prototype = new PhysicalObject();
CommSignal.prototype.constructor = CommSignal;

CommSignal.prototype.onEmitted = function(emitter) {
    this.emissionTime = new Date().getTime();
    this.lastComputationTime = this.emissionTime;
    this.totalDistanceTraveled = 0;
    this.originalPower = this.power;
};

/**
 * Compute the propagation of the signal as time goes by
 */
CommSignal.prototype.compute = function(medium) {

    var curTime = new Date().getTime();

    /* delta time since last computation in seconds */
    var dt = (curTime - this.lastComputationTime) / 1000;
    /* compute delta traveled distance since last computation */
    var dd = medium.propagationSpeed * dt;

    /*
     * compute current signal power by subtracting the power decay due to
     * traveled distance
     */
    this.power -= (dd * medium.powerDecayRatePerUnit);

    /* if power drops under 0, the remove the signal from the medium */
    if (this.power < 0) {
	medium.removeObject(this);
	return;
    }

    /* if we still have power, propagate to objects in range */
    medium.objects.forEach(function(value) {
	if (!value.onSignal) {
	    return;
	}
	/* compute distance of object from emission source position */
	var distance = this.sourcePosition.distance(value.position);
	/* don't propagate message to self */
	if (distance == 0) {
	    return;
	}

	/*
	 * compute distance of object from signal wave front ( all positions the
	 * find themselves from the source point of the signal at a distance
	 * greater then the distance traveled by the signal up until now but not
	 * with more then the distance traveled in this iteration 0
	 */
	var odtwf = distance - this.totalDistanceTraveled;

	/*
	 * deliver the signal to the object only if that object finds itself in
	 * the current wave front of the signal
	 */
	if (odtwf >= 0 && odtwf < dd) {
	    /* deliver the signal to the object */
	    value.onSignal(this);
	}
    }, this);

    /* add the current delta distance to the total traveled distance */
    this.totalDistanceTraveled += dd;
    /* set last computation time to current time */
    this.lastComputationTime = curTime;

    /* update graphics */
    this.shape.radius = this.totalDistanceTraveled;

    // this.shape.strokeColor = '#'
    // + ('000000' + ((0xff0000 + 0x000101 * this.totalDistanceTraveled / dd ) |
    // 0).toString(16))
    // .substr(-6);

};

/**
 * Definition of a generic communication transceiver
 */
function Transceiver(id) {
    // /**
    // * The medium that the transceiver interacts with
    // */
    // this.medium = medium;

    PhysicalObject.call(this);

    this.id = id;

    /**
     * The power used to transmit a signal
     */
    this.transmissionPower = 10;

    /**
     * Signal listeners
     */
    this.listeners = [];

};

/*
 * make the transceiver inherit from a physical object, because we need it to
 * have position
 */
Transceiver.prototype = new PhysicalObject();

Transceiver.prototype.constructor = Transceiver;

/**
 * Transmits a signal through a medium
 * 
 * @param signal
 */
Transceiver.prototype.transmit = function(signal) {
    /* set the power to default if no power specified */
    if (!signal.power) {
	signal.power = this.transmissionPower;
    }
    signal.sourcePosition = this.position;
    signal.position = this.position;
    /* propagate the signal through the comm medium ( universe ) */
    // this.universe.propagate(signal);
    /* add the signal to the medium */
    signal.onEmitted(this);
    this.universe.addObject(signal);
};

/**
 * Receives a signal from the medium
 * 
 * @param signal
 */
Transceiver.prototype.receive = function(signal) {
    for (var i = 0; i < this.listeners.length; i++) {
	this.listeners[i].receive(signal);
    }
};

/**
 * Method that makes an object in a CommMedium receive a signal
 * 
 * @param signal
 */
Transceiver.prototype.onSignal = function(signal) {
    this.receive(signal);
};

/**
 * Registers a listeners to be called when a message is received
 * 
 * @param listener
 */
Transceiver.prototype.registerListener = function(listener) {
    this.listeners.push(listener);
};

/**
 * A generic communication medium definition
 */
function CommMedium() {
    Universe.call(this);
    /**
     * The rate with which the power of a signal decays with every distance unit
     * traveled
     */
    this.powerDecayRatePerUnit;
    /**
     * The speed ( in units / second ) that a signal propagates with
     */
    this.propagationSpeed;

};

/*
 * CommMedium inherits from Universe because we need it to manipulate objects
 * with position
 */
CommMedium.prototype = new Universe();
CommMedium.prototype.constructor = CommMedium;

/**
 * A function to simulate the propagation of a signal through a communication
 * medium
 */
CommMedium.prototype.propagate = function(signal) {
    var self = this;
    var sp = signal.sourcePosition;

    /* make all the objects present in the medium receive the signal */
    this.objects.forEach(function(value) {
	if (!value.onSignal) {
	    return;
	}
	var distance = sp.distance(value.position);
	/* don't propagate message to self */
	if (distance == 0) {
	    return;
	}
	/* compute the receiving power */
	var receivingPower = signal.power - distance
		* self.powerDecayRatePerUnit;

	if (receivingPower > 0) {

	    /* deliver the signal to the object with receiving power */
	    value.onSignal(new CommSignal(signal.data, receivingPower, sp));
	}
    });
};

// /**
// * Special method that adds a transceiver to the comm medium
// * @param transceiver
// */
// CommMedium.prototype.addTransceiver = function(transceiver) {
// transceiver.medium = this;
// this.addObject(transceiver);
// };
