function Point(coords) {
    this.coords = coords;
}

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
    this.shape = shape;
    this.mass = mass;
    this.position = position;

}

/* override this for specific behavior */
PhysicalObject.prototype.compute = function(universe) {
};

PhysicalObject.prototype.draw = function(canvas) {
    this.shape.draw(canvas, this.position);
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

function CellularAutomata(dimensions) {

    Universe.call(this, dimensions);
}

CellularAutomata.prototype = new Universe();
CellularAutomata.prototype.constructor = CellularAutomata;

function Cell(position, shape, rule, state) {
    this.rule = rule;
    this.state = state;
    this.oldState = state;
    this.color = "Yellow";
    this.age = 0;
    this.neighbors = new Array();
    PhysicalObject.call(this, position, shape);

}

Cell.prototype = new PhysicalObject();
Cell.prototype.constructor = Cell;

Cell.prototype.compute = function(automata) {
    this.oldState = this.state;
    this.rule.execute(this);
};

Cell.prototype.addNeighbor = function(cell) {
    this.neighbors.push(cell);
};

Cell.prototype.draw = function(canvas) {
    if (this.oldState == this.state) {
	return;
    }
    if (this.state) {
	canvas.fillStyle = this.color;
    } else {
	canvas.fillStyle = "Black";
    }

    PhysicalObject.prototype.draw.apply(this, arguments);
};

function CellRule(dna) {
    this.dna = dna;
}

CellRule.prototype.constructor = CellRule;
CellRule.prototype.execute = function(cell) {
    cell.state = false;
};

function CellRuleDNA(mask, maskSpin, changeRules) {
    /* the mask used to count alive neighboring cells */
    if (mask) {
	this.mask = mask;
    } else {
	this.mask = [ 1, 1, 0, 1, 1, 1, 0, 1 ];
    }
    /* -1 to spin mask to the left, 1 to spin mask to the right */
    if (maskSpin) {
	this.maskSpin = maskSpin;
    } else {
	this.maskSpin = 1;
    }
    /*
     * for the number of alive neighboring cells (0-8) set a state changing
     * function
     */
    if (changeRules) {
	this.changeRules = changeRules;
    } else {
	this.changeRules = {
	    0 : "0",
	    1 : "0",
	    2 : "1",
	    3 : "0",
	    4 : "i",
	    5 : "0",
	    7 : "0",
	    8 : "0"
	};
    }
    this.operations = {
	"0" : this.setStateOff,
	"1" : this.setStateOn,
	"i" : this.setInverseState
    };
}

CellRuleDNA.prototype.constructor = CellRuleDNA;
CellRuleDNA.prototype.change = function(cell, aliveNeighbors) {
    var op = this.changeRules[aliveNeighbors];
    if (op) {
	this.operations[op](cell);
    }
};
CellRuleDNA.prototype.setStateOn = function(cell) {
    cell.state = 1;
};
CellRuleDNA.prototype.setStateOff = function(cell) {
    cell.state = 0;
};
CellRuleDNA.prototype.setInverseState = function(cell) {
    cell.state = (cell.state + 1) % 2;
};
