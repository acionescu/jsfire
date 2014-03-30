/**
 * 
 */

/**
 * Definition of a communication node
 */
function CommNode(id, transceiver, protocol) {
    /** id of the node */
    this.id = id;

    /** a map of peers indexed by their id */
    this.peers = {};

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

};

CommNode.prototype.constructor = CommNode;

/** a function to discover peers */
CommNode.prototype.discover = function() {

};

/** a function called when a peer replied to a discovery call */
CommNode.prototype.onDiscovery = function(peer) {

};

/** a function to handle a message received */
CommNode.prototype.onMessage = function(message) {
    console.log(this.id + " <- " + message.body);
};

/** a function to send a message to a peer */
CommNode.prototype.sendMessage = function(message) {
    console.log(this.id + " -> " + message.body);
    this.transceiver.transmit(this.protocol.encodeMessage(message));
};

/**
 * a function to handle a received signal from the transceiver
 * 
 * @param signal
 */
CommNode.prototype.onSignal = function(signal) {
    this.onMessage(this.protocol.decodeSignal(signal));
};

/**
 * Definition of a communication node as seen by another node
 */
function CommPeer() {
    /** id of the peer */
    this.id;

    /** time necessary to reach the peer node */
    this.delay;

    /**
     * an array of other peers through which a packet needs to pass to reach
     * this peer
     */
    this.hops = [];
}

CommPeer.prototype.constructor = CommPeer;

/**
 * Definition of a communication message
 * 
 * @returns
 */
function Message(header, body) {
    /**
     * The header of the message that contains meta data
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

};

CommSignal.prototype.constructor = CommSignal;

/**
 * A generic, high level, mesh communication protocol definition
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
 * Definition of a generic communication transceiver
 */
function Transceiver(medium) {
    /**
     * The medium that the transceiver interacts with
     */
    this.medium = medium;

    /**
     * The power used to transmit a signal
     */
    this.transmissionPower=10;

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
    signal.sourcePosition=this.position;
    this.medium.propagate(signal);
};

/**
 * Receives a signal from the medium
 * 
 * @param signal
 */
Transceiver.prototype.receive = function(signal) {
    for (var i = 0; i < this.listeners.length; i++) {
	this.listeners[i].onSignal(signal);
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
    /**
     * The rate with which the power of a signal decays with every distance unit
     * traveled
     */
    this.powerDecayRatePerUnit;

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
	var distance = sp.distance(value.position);
	/* don't propagate message to self */
	if(distance==0){
	    return;
	}
	/* compute the receiving power */
	var receivingPower = signal.power - distance * self.powerDecayRatePerUnit;

	if (receivingPower > 0) {
	    
	    /* deliver the signal to the object with receiving power */
	    value.onSignal(new CommSignal(signal.data, receivingPower, sp));
	}
    });
};

/**
 * Special method that adds a transceiver to the comm medium
 * @param transceiver
 */
CommMedium.prototype.addTransceiver = function(transceiver) {
    transceiver.medium = this;
    this.addObject(transceiver);
};
