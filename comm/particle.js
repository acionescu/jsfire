function Point(coords) {
    this.coords = coords;
}

Point.prototype.distance = function(point) {
   this.checkPointDimension(point);

    var sum = 0;

    for (var i = 0; i < this.coords.length; i++) {
	sum += Math.pow(point.coords[i] - this.coords[i], 2);
    }

    return Math.sqrt(sum);

};

Point.prototype.checkPointDimension=function(point){
    if (this.coords.length != point.coords.length) {
	throw "Can't compute distance between points with different dimensions: "
		+ this.coords + " and " + point.coords;
    }
};

Point.prototype.add=function(point){
    this.checkPointDimension(point);
    
    var nc=[];
    
    for (var i = 0; i < this.coords.length; i++) {
	nc[i]=this.coords[i]+point.coords[i];
    }
    
    return new Point(nc);
};

function Shape() {

}

Shape.prototype.draw = function(canvas, position) {
};

function Rectangle(w, h) {
    this.width = w;
    this.height = h;
}

Rectangle.prototype = new Shape();
Rectangle.prototype.constructor = Rectangle;
Rectangle.prototype.draw = function(canvas, position) {
    var coords = position.coords;

    canvas.fillRect(coords[0] * this.width, coords[1] * this.height,
	    this.width, this.height);
};

function CustomShape(points) {
    this.points = points;
    Shape.call(this);
}

CustomShape.prototype = new Shape();
CustomShape.prototype.constructor = CustomShape;

function PhysicalObject(position, shape, mass) {
    this.id;
    /** The universe where this object exists */
    this.universe;
    this.shape = shape;
    this.mass = mass;
    this.position = position;
    /**
     * Relative position to the parent
     */
    this.relPos;

    this.partsMap = {};

    this.parts = [];

};

/**
 * Called when this object is added to the universe
 * 
 * @param universe
 */
PhysicalObject.prototype.onAttach = function(universe) {
    this.Universe = universe;

    /* add all parts to the universe */
    this.parts.forEach(function(part) {
	universe.addObject(part);
    });

    /* now we're sure that all parts have an id */
    this.indexParts();
};

/**
 * Determine part absolute position from the parent's position
 * @param part
 */
PhysicalObject.prototype.determinePartPosition=function(part){
    var pPos = new Point(this.position.coords.slice());
    if(part.relPos){
	pPos=pPos.add(part.relPos);
    }
    part.position=pPos;
};

/**
 * Maps the parts on their ids
 */
PhysicalObject.prototype.indexParts = function() {
    this.parts.forEach(function(part) {
	this.partsMap[part.id] = part;
    }, this);
};

/**
 * Called when this object is removed from an universe
 */
PhysicalObject.prototype.onDettach = function() {

};

/* override this for specific behavior */
PhysicalObject.prototype.compute = function(universe) {
};

PhysicalObject.prototype.draw = function(canvas) {
    this.shape.draw(canvas, this.position);
};

/**
 * Adds a part to this object
 * 
 * @param part
 * @param relPos
 *                relative position of the part to the parent
 */
PhysicalObject.prototype.addPart = function(part, relPos) {
    if (!part.id) {
	this.partsMap[part.id] = part;
    }
    /* if the part doesn't have a position, copy the position of the parent */
    if (!relPos) {
	part.relpos = relPos;
    }

    this.parts.push(part);

};

PhysicalObject.prototype.removePart = function(part) {
    delete this.parts[part.id];
};

function Universe(dimensions) {
    this.dimensions = dimensions;
    this.objects = new Array();
    this.pointsObjects = new Object();
}

Universe.prototype.compute = function() {

    for (var i = 0; i < this.objects.length; i++) {
	this.objects[i].compute(this);
    }
};

Universe.prototype.draw = function(canvas) {

    for (var i = 0; i < this.objects.length; i++) {
	this.objects[i].draw(canvas);
    }
};

Universe.prototype.addObject = function(object) {
    if (!object.id) {
	object.id = "PhysObj-" + (this.objects.length + 1);
    }
    if (!object.position) {
	object.position = new Point([ 0, 0 ]);
    }

    this.objects.push(object);
    this.pointsObjects[object.position.coords] = object;
};

Universe.prototype.getObjectByCoords = function(coords) {
    return this.pointsObjects[coords];
};

function Simulator(universe, canvas) {
    this.universe = universe;
    this.canvas = canvas;

}

Simulator.prototype.run = function() {
    // this.canvas.clearRect(0,0,this.canvas.width,this.canvas.height);
    this.universe.draw(this.canvas);
    this.universe.compute();
};

PhysicalObject.prototype.constructor = PhysicalObject;
Point.prototype.constructor = Point;
Shape.prototype.constructor = Shape;
Universe.prototype.constructor = Universe;
Simulator.prototype.constructor = Simulator;

/* cellular automata */

function CellularAutomata(dimensions, config) {

    Universe.call(this, dimensions);
    this.config = config;
}

CellularAutomata.prototype = new Universe();
CellularAutomata.prototype.constructor = CellularAutomata;

function Cell(position, shape, rule, state) {
    this.rule = rule;
    this.state = state;
    this.oldState = state;
    this.color = 'Yellow';
    this.age = 0;
    ;
    this.gravity = 0;
    this.oldg = this.gravity;
    this.drawn = false;
    this.neighbors = new Array();
    PhysicalObject.call(this, position, shape);

}

Cell.prototype = new PhysicalObject();
Cell.prototype.constructor = Cell;

Cell.prototype.compute = function(automata) {
    this.oldState = this.state;
    this.oldg = this.gravity;
    this.rule.execute(this);
};

Cell.prototype.addNeighbor = function(cell) {
    this.neighbors.push(cell);
};

Cell.prototype.draw = function(canvas) {
    if (this.drawn && this.oldState == this.state && this.oldg == this.gravity) {
	return;
    }
    if (this.state) {
	canvas.fillStyle = this.color;
    } else {
	canvas.fillStyle = '#'
		+ ('000000' + (((this.gravity) * 0xffffff) | 0).toString(16))
			.substr(-6);
	// canvas.fillStyle='Black';
    }
    this.drawn = true;
    PhysicalObject.prototype.draw.apply(this, arguments);
};
