var CONSTANTS={
	half_PI : Math.PI/2,
	EAST : 0 ,
	WEST : Math.PI,
	SOUTH : -Math.PI/2,
	NORTH : Math.PI/2,
	SE : -Math.PI/4,
	SW : -3*Math.PI/4,
	NE : Math.PI/4,
	NW : 3*Math.PI/4
}; 



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

Point.prototype.checkPointDimension = function(point) {
    if (this.coords.length != point.coords.length) {
	throw "Can't compute distance between points with different dimensions: "
		+ this.coords + " and " + point.coords;
    }
};

Point.prototype.add = function(point) {
    this.checkPointDimension(point);

    var nc = [];

    for (var i = 0; i < this.coords.length; i++) {
	nc[i] = this.coords[i] + point.coords[i];
    }

    return new Point(nc);
};

Point.prototype.subtract = function(point){
    this.checkPointDimension(point);
    
    var nc = [];

    for (var i = 0; i < this.coords.length; i++) {
	nc[i] = this.coords[i] - point.coords[i];
    }

    return new Point(nc);
};

/**
 * 
 * @param drot - delta rotation in radians
 */
Point.prototype.rotate2D = function(drot){
    var newCoord = [0,0];
    
    var rotcos = Math.cos(drot);
    var rotsin = Math.sin(drot);
    
    newCoord[0] = this.coords[0]*rotcos - this.coords[1]*rotsin;
    newCoord[1] = this.coords[0]*rotsin + this.coords[1]*rotcos;
    
    this.coords = newCoord;
};

function Shape(strokeColor, fillColor) {
    /**
     * allow drawing
     */
    this.visible = true;
    
    this.fillColor;
    if (fillColor) {
	this.fillColor = fillColor;
    }
    this.strokeColor = '#000000';
    if (strokeColor) {
	this.strokeColor = strokeColor;
    }
    /* store the last absolute position where it was drawn, including scaling */
    this.absolutePos;
}

Shape.prototype.constructor = Shape;
Shape.prototype.draw = function(canvas, position) {
};

Shape.prototype.hitTest = function(pos, mouseX, mouseY) {
    return false;
};


function Rectangle(w, h,strokeColor, fillColor) {
    Shape.call(this,strokeColor, fillColor);
    this.width = w;
    this.height = h;
}

Rectangle.prototype = new Shape();
Rectangle.prototype.constructor = Rectangle;
Rectangle.prototype.draw = function(canvas, position, scale, rotation) {
    var coords = position.coords;
    
    var w = this.width;
    var h = this.height;
    
    if( Math.abs(rotation) == CONSTANTS.half_PI ){
	
	w = this.height;
	h = this.width;
    }
    
    canvas.beginPath();
    
    canvas.rect(scale[0]*(coords[0] - w / 2), scale[1]*(coords[1] - h/ 2),
	    scale[0]*w, scale[1]*h);
    
    if (this.fillColor) {
	canvas.fillStyle = this.fillColor;
	canvas.fill();
    }
    if (this.strokeColor) {
	canvas.strokeStyle = this.strokeColor;
	canvas.stroke();
    }
};

Rectangle.prototype.hitTest = function(pos, mouseX, mouseY) {
    
};

function Ellipse(radX,radY, strokeColor, fillColor){
    Shape.call(this,strokeColor, fillColor);
    this.radX = radX;
    this.radY = radY;
    
    /* absolute radius after scaling */
    this.absoluteXRadius;
    this.absoluteYRadius;
}

Ellipse.prototype = new Shape();
Ellipse.prototype.constructor = Ellipse;


Ellipse.prototype.draw = function(canvas, position, scale,rotation) {
    var coords = position.coords;
 
    canvas.beginPath();
    
    this.absolutePos = new Point([scale[0]*coords[0],scale[1]*coords[1]]);
    this.absoluteXRadius = this.radX*scale[0];
    this.absoluteYRadius = this.radY*scale[1];
    
    canvas.ellipse(this.absolutePos.coords[0], this.absolutePos.coords[1], this.absoluteXRadius, this.absoluteYRadius,rotation, 0, 2 * Math.PI, false);
    
    if (this.fillColor) {
	canvas.fillStyle = this.fillColor;
	canvas.fill();
    }
    
    if (this.strokeColor) {
	canvas.strokeStyle = this.strokeColor;
	canvas.stroke();
    }
   
    // console.log("draw circle "+this.radius);
};

Ellipse.prototype.hitTest = function(pos, mouseX, mouseY) {
//    if (pos.distance(new Point([ mouseX, mouseY ])) <= this.radius) {
//	return true;
//    }
    
    var pt = new Point([ mouseX, mouseY ]).subtract(this.absolutePos);
    
    return ( (Math.pow(pt.coords[0]/this.absoluteXRadius, 2) + Math.pow(pt.coords[1]/this.absoluteYRadius,2)) < 1);
    
  //  return false;
};

function Circle(radius, strokeColor, fillColor) {
    Ellipse.call(this,radius,radius,strokeColor, fillColor);
    this.radius = radius;
    
}

Circle.prototype = new Ellipse();
Circle.prototype.constructor = Circle;



function CustomShape(points) {
    Shape.call(this);
    this.closed = false;
    this.points = points;
}

CustomShape.prototype = new Shape();
CustomShape.prototype.constructor = CustomShape;


CustomShape.prototype.draw=function(canvas, position, scale,rotation){
   
    
    if(this.points == undefined || this.points.legth <= 1){
	return;
    }
    
    canvas.beginPath();
    
    var pc = position.coords;
    
    canvas.moveTo((pc[0]+this.points[0].coords[0])*scale[0],(pc[1]+this.points[0].coords[1])*scale[1]);
    
    for(var i=1;i<this.points.length;i++){
	canvas.lineTo((pc[0]+this.points[i].coords[0])*scale[0],(pc[1]+this.points[i].coords[1])*scale[1]);
    }
    
    if(this.closed){
	canvas.closePath();
    }
    
    if (this.fillColor) {
	canvas.fillStyle = this.fillColor;
	canvas.fill();
    }
    
    if (this.strokeColor) {
	canvas.strokeStyle = this.strokeColor;
	canvas.stroke();
    }
};


function PhysicalObject(position, shape, mass) {
    this.id;
    /** The universe where this object exists */
    this.universe;
    this.shape = shape;
    this.mass = mass;
    this.position = position;
    
    /* how much to scale this object on each axis */
    this.scale = [1,1];
    /**
     * Relative position to the parent
     */
    this.relPos=new Point([0,0]);
    
    /* rotation of the object in radians */
    this.rotation=0;
    
    /* an object to store view data */
    this.view = {};

    this.partsMap = {};

    this.parts = new Array();
    /* the parent object of the current one */
    this.parent;
    
    if(!this.position){
	this.position = new Point([0,0]);
    }

};

/**
 * Called when this object is added to the universe
 * 
 * @param universe
 */
PhysicalObject.prototype.onAttach = function(universe) {
    this.universe = universe;

    /* add all parts to the universe */
    this.parts.forEach(function(part) {
	this.determinePartPosition(part);
	universe.addObject(part);
    }, this);

    /* now we're sure that all parts have an id */
    this.indexParts();
    
    /* allow specific object to do theri initialization */
    this.onReady();
};

/* Called after the object has been attached to a universe. Override as needed */
PhysicalObject.prototype.onReady = function(){
    
    
};

PhysicalObject.prototype.setPosition=function(x,y){
    this.position=new Point([x,y]);
    this.updatePosition();
};

PhysicalObject.prototype.setRelativePos=function(x,y){
    this.relPos = new Point([x,y]);
    if(!!this.parent){
	this.parent.determinePartPosition(this);
    }
   
    
    this.updatePosition();
};

PhysicalObject.prototype.moveRelPos=function(x,y){
    var newRelPos = this.relPos.add(new Point([x,y]));
    this.setRelativePos(newRelPos.coords[0],newRelPos.coords[1]);
    console.log(newRelPos.coords);
};

PhysicalObject.prototype.move=function(x,y){
    var newPos = this.position.add(new Point([x,y]));
    this.setPosition(newPos.coords[0],newPos.coords[1]);
    
};


/**
 * Returns the relative pos of this object relative to its ancestor with the specified depth 
 * ( if depth 0 or unspecified the relative pos to parent will be returned )
 * @param depth
 */
PhysicalObject.prototype.getRelativePos=function(depth){
    if(depth == undefined || depth <=0){
	return this.relPos;
    }
    
    return this.parent.getRelativePos(depth-1).add(this.relPos);
};


PhysicalObject.prototype.setScale = function(scale){
    this.scale = scale;
    this.updateScale();
};

PhysicalObject.prototype.setRotation=function(rot){
    this.rotation = rot % (2*Math.PI);
    if(Math.abs(this.rotation) > Math.PI){
	this.rotation = this.rotation - Math.sign(this.rotation)*Math.PI;
    }
};

/**
 * drot - rotation delta in radians
 */
PhysicalObject.prototype.rotate=function(drot){
    this.setRotation(this.rotation+drot);
    
    /* update parts scale */
    this.parts.forEach(function(part) {
	
	/* update part relative postion */
	part.relPos.rotate2D(drot);
	/* update part absolute position */
	this.determinePartPosition(part);
	/* let the part rotate its inner parts */
	part.rotate(-drot);
	
    }, this);
};

PhysicalObject.prototype.updatePosition = function(){
    
    /* update parts positions */
    this.parts.forEach(function(part) {
	this.determinePartPosition(part);
    }, this);
};

PhysicalObject.prototype.updateScale= function(){
    /* update parts scale */
    this.parts.forEach(function(part) {
	part.setScale ([this.scale[0],this.scale[1]]);
    }, this);
};

/**
 * Determine part absolute position from the parent's position
 * 
 * @param part
 */
PhysicalObject.prototype.determinePartPosition = function(part) {
    if(this.position == undefined){
	throw "positiond undefined for part "+part.id;
    }
    var pPos = new Point(this.position.coords.slice(0));
    if (part.relPos) {
	pPos = pPos.add(part.relPos);
    }

    //part.position = pPos;
    part.setPosition(pPos.coords[0], pPos.coords[1]);
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
    if (this.shape && this.shape.visible) {
	this.shape.draw(canvas, this.position, this.scale,this.rotation);
    }
};

/**
 * Adds a part to this object
 * 
 * @param part
 * @param relPos
 *                relative position of the part to the parent
 */
PhysicalObject.prototype.addPart = function(part, relPos) {
    /* add the part to the universe if not added yet */
    if (!part.id && !!this.universe) {
	this.universe.addObject(part);
	this.partsMap[part.id] = part;
    }
    
    /* if the part doesn't have a position, copy the position of the parent */
    if (!!relPos) {
	part.relpos = relPos;
    }
    
    /* adjust part scale */
    if(!part.scale){
	throw "scale undefined";
    }
    
    part.setScale([part.scale[0]*this.scale[0],part.scale[1]*this.scale[1]]);
    
    this.determinePartPosition(part);
    
    this.parts.push(part);
    part.parent = this;

};

PhysicalObject.prototype.removePart = function(part) {
    delete this.parts[part.id];
};

PhysicalObject.prototype.hitTest = function(mouseX, mouseY) {
    if (!this.shape) {
	return false;
    }
    return this.shape.hitTest(this.position, mouseX, mouseY);
};

/**
 * 
 * @param mousePos - a {@link Point} 
 */
PhysicalObject.prototype.onDrag = function(mousePos){
    
};

/**
 * 
 * @param mousePos - a {@link Point} 
 */
PhysicalObject.prototype.onClick = function(mousePos){
    
};

function Universe(dimensions, canvasElem) {
    this.canvasElem;
    this.canvas;
    this.dimensions = dimensions;
    this.objects = new Array();
    this.pointsObjects = new Object();
    this.objectsIndex = 0;
    this.intervalId;

    this.init(canvasElem);
}

Universe.prototype.init = function(canvasElem) {
    if (canvasElem) {
	this.canvasElem = canvasElem;
	this.canvas = canvasElem.getContext("2d");
	
	this.setupListeners();
    }
};

Universe.prototype.setupListeners=function(){
    var c=this.canvasElem;
    if(!c){
	return;
    }
    var self=this;
    c.addEventListener('mousedown',function(e){
	
	    var relMousePos = self.getRelMousePos(e.clientX, e.clientY);
	    var relX = relMousePos.mouseX;
	    var relY = relMousePos.mouseY;
	    
	    var hitObj = self.getHitObject(relX,relY);
	    
	    if(hitObj){
	    	console.log("hit("+relX+","+relY+")->"+hitObj.id);
	    	hitObj.onDrag(relX,relY);
	    	var onMouseMove = function(e){
	    	    var newMousePos = self.getRelMousePos(e.clientX, e.clientY);
	    	    hitObj.onDrag(newMousePos.mouseX,newMousePos.mouseY);
	    	};
	    	
	    	var onMouseUp=function(e){
	    	    c.removeEventListener('mousemove',onMouseMove);
	    	    c.removeEventListener('mouseup',onMouseUp);
	    	};
	    	
	    	c.addEventListener('mousemove',onMouseMove);
	    	c.addEventListener('mouseup',onMouseUp);
	    	
	    }
	    
	});
};

Universe.prototype.getRelMousePos = function(mouseX, mouseY) {
    var rect = this.canvasElem.getBoundingClientRect();
    var relPos = {
	mouseX : mouseX - rect.left,
	mouseY : mouseY - rect.top
    };
    return relPos;
};

Universe.prototype.start = function(frequency) {
    var self = this;
    this.intervalId = setInterval(function() {
	self.compute();
	self.draw(self.canvas);
    }, frequency);
};




Universe.prototype.stop = function() {
    if (this.intervalId) {
	clearInterval(this.intervalId);
	delete this.intervalId;
    }
};



Universe.prototype.update = function(){
    this.compute();
    this.draw(this.canvas);
};

Universe.prototype.compute = function() {

    for (var i = 0; i < this.objects.length; i++) {
	this.objects[i].compute(this);
    }
    ;
};

Universe.prototype.draw = function(canvas) {
    canvas.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < this.objects.length; i++) {
	this.objects[i].draw(canvas);
    }
    ;
};

Universe.prototype.addObject = function(object) {
    this.objectsIndex += 1;
    if (!object.id) {
	object.id = "PhysObj-" + (this.objectsIndex);
    }
    if (!object.position) {
	object.position = new Point([ 0, 0 ]);
    }

    this.objects.push(object);
    this.pointsObjects[object.position.coords] = object;
//    console.log("Added object " + object.id + " at pos "
//	    + object.position.coords);
    /* make the object aware that it has been added to the universe */
    object.onAttach(this);
};

Universe.prototype.removeObject = function(object) {
    var objIndex = this.objects.indexOf(object);
    this.objects.splice(objIndex, 1);
    delete this.pointsObjects[object.position.coords];
    object.onDettach(this);
//    console.log("Removed object " + object.id + " at post "
//	    + object.position.coords);
};

Universe.prototype.getObjectByCoords = function(coords) {
    return this.pointsObjects[coords];
};

Universe.prototype.getHitObject = function(mouseX, mouseY) {
    for (var i = 0; i < this.objects.length; i++) {
	var hit = this.objects[i].hitTest(mouseX, mouseY);
	if (hit) {
	    return this.objects[i];
	}
    }
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
