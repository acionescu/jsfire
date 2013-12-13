var side = 101;
var cellSize = 5;
var automata;
var middle = (Math.pow(side, 2) + 1) / cellSize;
var mask1 = [ 1, 1, 0, 1, 1, 1, 0, 1 ];
var mask2 = [ 1, 0, 1, 0, 0, 1, 1, 1 ];

function CellRule1(mask) {
    this.mask = mask;
}

var colors = {
    0 : "Black",
    1 : "Yellow",
    2 : "Yellow",
    3 : "Orange",
    4 : "Orange",
    5 : "Red",
    6 : "Red",
    7 : "White",
    8 : "White"
};

CellRule1.prototype = new CellRule();
CellRule1.prototype.constructor = CellRule1;
CellRule1.prototype.execute = function(cell) {
    var alive = 0;
    var n = cell.neighbors;
    var size = n.length;
    var m = this.mask;
    var c = cell.position.coords;

    function born() {
	for (var i = 0; i < m.length; i++) {
	    for (var k = 0; k < size; k++) {
		m[i] ^= n[k].mask[i];
	    }
	}
    }

    /* apply mask */
    for (var i = 0; i < size; i++) {
	if (n[i].oldState & m[i]) {
	    alive++;
	}
    }

    /* apply rule */

    if (alive < 1) {
	cell.state = 0;
    } else if (alive == 2) {
	cell.state = 1;
    } else if (alive == 4) {
	cell.state = (cell.state + 1) % 2;
    } else if (alive <= 5) {
	cell.state = 0;
    } else if (alive == 6) {

    } else {
	cell.state = 0;
    }

    /* apply spin */
    // m.push(m.shift());
    m.unshift(m.pop());

};

function CellRule2(dna){
    CellRule.call(this,dna);
}

CellRule2.prototype = new CellRule();
CellRule2.prototype.constructor = CellRule2;
CellRule2.prototype.execute = function(cell) {
    var alive = 0;
    var n = cell.neighbors;
    var size = n.length;
    var m = this.dna.mask;

    /* apply mask */
    for (var i = 0; i < size; i++) {
	if (n[i].oldState & m[i]) {
	    alive++;
	}
    }
    /* apply change rules */
    this.dna.change(cell, alive);

    /* apply spin */
    if (this.dna.maskSpin > 0) {
	m.unshift(m.pop());
    } else {
	m.push(m.shift());
    }
};

function populateAutomata(automata, w, h, cs) {
    var prev1 = new Array();
    var prev2 = new Array();
    var current = new Array();

    var row = 0;
    var col = 0;

    var rowMax = 0;
    var colMax = 0;
    var colOffset = 0;
    var count = 0;
    var total = w * h;
    var cell;
    var p;
    var k = 0;

    while (++count <= total) {
	p = new Point([ col, row ]);
	var m = mask1;
	// if(col * row < middle){
	// m=mask2;
	// }
	if (Math.sqrt(Math.pow(Math.abs(side / 2 - col), 2)
		+ Math.pow(Math.abs(side / 2 - row), 2)) > 30) {
	    m = mask2;
	}
	var cellDna = new CellRuleDNA(m);
	cell = new Cell(p, new Rectangle(cs, cs), new CellRule2(cellDna), 0);
	var addprev2 = true;

	if (col > 0) {
	    var ind = k - 1;
	    if (colOffset > 0) {
		ind = col - colOffset;
	    }
	    // if(typeof prev1[ind] == 'undefined'){
	    // alert("row: "+row+" col: "+col);
	    // }
	    cell.addNeighbor(prev1[ind]);
	    prev1[ind].addNeighbor(cell);
	    addprev2 = false;
	}

	if (col < colMax) {
	    var ind = k;
	    if (colOffset > 0) {
		ind += 1;
	    }
	    cell.addNeighbor(prev1[ind]);
	    prev1[ind].addNeighbor(cell);
	    addprev2 = !addprev2;
	}

	if (k > 0) {
	    cell.addNeighbor(current[k - 1]);
	    current[k - 1].addNeighbor(cell);
	}

	if (addprev2 && k > 0) {
	    var ind = k - 1;
	    if (colOffset > 0) {
		ind = col - colOffset;
	    }
	    if (colOffset > 1) {
		ind += 1;
	    }
	    cell.addNeighbor(prev2[ind]);
	    prev2[ind].addNeighbor(cell);
	}

	current.push(cell);

	automata.addObject(cell);
	row--;
	col++;

	if (row < 0 || col > colMax) {
	    rowMax++;
	    colMax++;
	    if (rowMax >= h) {
		rowMax = h - 1;
		colOffset++;
	    }

	    if (colMax >= w) {
		colMax = w - 1;
	    }

	    row = rowMax;
	    col = colOffset;
	    k = 0;

	    prev2 = prev1;
	    prev1 = current;
	    current = new Array();
	} else {
	    k++;
	}
    }
}

function createAutomata(width, height) {

    var ca = new CellularAutomata(2);

    populateAutomata(ca, width, height, cellSize);
    return ca;

}

function startSimulation(canvas) {

    var ctx = canvas.getContext("2d");
    // ctx.width=side;
    // ctx.height=side;
    canvas.addEventListener('mousedown', mouseDownHandler, false);
    canvas.addEventListener('mouseup', mouseUpHandler, false);

    automata = createAutomata(side, side);
    // automata.objects[(side * side + 1) / 2].state = 1;
    // automata.objects[((side * side + 1) / 2) + 1].state = 1;

    var output = new Array();
    var input = new Array();
    var mid = (side * side + 1) / 2 + side;
    for (var i = mid - 3; i < mid + 4; i++) {
	output.push(automata.objects[i]);
	input.push(automata.objects[i + 4000]);
    }

    var simulator = new Simulator(automata, ctx);
    var c = 0;

    setInterval(function() {
	// automata.compute();
	// if(c > 3.14){
	// c=0;
	// }

	// console.log(Math.floor((Math.sin(c)*128)));
	// setInput(input,Math.floor((Math.sin(c)*128)).toString(2));
	// c+=0.08;
	simulator.run();
	// automata.draw(ctx);
	// console.log(readOutput(output));
    }, 20);

    // setInterval(function() {
    // automata.draw(ctx);
    // }, 200);

}

function readOutput(out) {
    var s = "";
    for (var i = 0; i < out.length; i++) {
	s += out[i].state;
    }
    return parseInt(s, 2);
}

function setInput(input, val) {
    for (var i = 0; i < val.length; i++) {
	input[i].state = parseInt(val[i]);
    }
}

function printNeighbors(cell) {
    var n = cell.neighbors;
    var nstate = new Array();
    for (var i = 0; i < n.length; i++) {
	// if (n[i].oldState & this.mask[i]) {
	// alive++;
	// }
	nstate.push(n[i].oldState);
	alert(n[i].oldState);
    }
    alert(nstate.join(","));
}

function mouseDownHandler(event) {
    flipCell(event);
    event.target.addEventListener('mousemove', mouseMoveHandler, false);
}

function mouseUpHandler(event) {
    event.target.removeEventListener('mousemove', mouseMoveHandler, false);
}

function mouseMoveHandler(event) {
    flipCell(event);
    // console.log(event);
}

function flipCell(event) {
    var coords = relMouseCoords(event);
    var cell = automata.getObjectByCoords([ Math.ceil(coords.x / cellSize) - 1,
	    Math.ceil(coords.y / cellSize) - 1 ]);
    cell.state ^= 1;
}

function relMouseCoords(event) {
    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var canvasX = 0;
    var canvasY = 0;
    var currentElement = event.target;

    do {
	totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
	totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
    } while (currentElement = currentElement.offsetParent)

    canvasX = event.pageX - totalOffsetX;
    canvasY = event.pageY - totalOffsetY;

    return {
	x : canvasX,
	y : canvasY
    };
}
