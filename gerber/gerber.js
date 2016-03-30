var GERBER = GERBER || {};



GERBER.TEMPLATES = {
	/* circle */
	"C" : {
	    build : function(modifiers){
		return new GerberAperture("C", modifiers);
	    }
	},
	/* rectangle */
	"R" : {
	    build : function(modifiers){
		return new GerberAperture("R", modifiers);
	    }
	},
	/* polygon */
	"P" : {
	    build : function(modifiers){
		return new GerberAperture("P", modifiers);
	    }
	},
	/* obround */
	"O" :{
	    build : function(modifiers){
		return new GerberAperture("O", modifiers);
	    }
	}
	
};

/**
 * Represents a float as a string with the max length intp+decp
 * @param intp - integer places
 * @param decp - decimal places
 */

GERBER.valueAsString=function(value,intp,decp){
    /* multiply the value with 10^decp, to convert to string */
    var s = Math.round(value*Math.pow(10,decp)).toFixed(0);
    /* now get the last intp+decp characters */
    return s.substring(s.length-(intp+decp));
};

function GerberCommand(id,params){
    this.id=id;
    this.params = params;
}


GerberCommand.prototype.constructor=GerberCommand;

GerberCommand.prototype.toString=function(context){
    /* make sure we add the simple command treminator */
    return this.asString(context)+"*";
};

/**
 * Each command should override this to
 * convert to string
 */
GerberCommand.prototype.asString=function(context){
    return this.id+this.commandAsString(context);
};

/**
 * To be overridden
 * @param context
 * @returns {String}
 */
GerberCommand.prototype.commandAsString = function(context){
   /* by default just return the first parameter if present */
    if(this.params && this.params.length > 0){
	return this.params[0];
    }
    return "";
};

function GerberOperation(id,params){
    GerberCommand.call(this,id, params);
}

GerberOperation.prototype = Object.create(GerberCommand.prototype);
GerberOperation.prototype.constructor=GerberOperation;

GerberOperation.prototype.commandAsString=function(context){
    var format = context.format;
    var point = this.params[0];
    var out = "X"+GERBER.valueAsString(point.x(),format.intp,format.decp)+"Y"+GERBER.valueAsString(-point.y(),format.intp,format.decp);
    
    return out;
};

GerberOperation.prototype.asString=function(context){
   
    return this.commandAsString(context)+this.id;
};

function GerberExtendedCommand(id,params){
    GerberCommand.call(this,id,params);
}

GerberExtendedCommand.prototype = Object.create(GerberCommand.prototype);
GerberExtendedCommand.prototype.constructor=GerberExtendedCommand;


GerberExtendedCommand.prototype.toString = function(context){
      var out = GerberCommand.prototype.toString.apply(this,context);
      return "%"+out+"%";
};


GERBER.D01 = function(point,offset){
    GerberOperation.call(this,"D01",[point,offset]);
};

GERBER.D01.prototype = Object.create(GerberOperation.prototype);
GERBER.D01.prototype.constructor=GERBER.D01;

GERBER.D01.prototype.commandAsString = function(context){
    var out = GerberOperation.prototype.commandAsString.apply(this,arguments);
    
    /* for G02 and G03 interpolation modes consider the offset too */
    if(context.interpolationMode == "G02" || context.interpolationMode == "G03"){
	var format = context.format;
	var offset = this.params[1];
	if(offset){
	    out+="I"+GERBER.valueAsString(offset.x(), format.intp,format.decp)+"J"+GERBER.valueAsString(offset.Y(), format.intp,format.decp);
	}
    }
    
    return out;
};


GERBER.setFormat = function(intp,decp){
    var cmd = new GerberExtendedCommand("FSLA",[intp,decp]);
    /* local implementation of commandAsString */
    cmd.commandAsString=function(context){
	return "X"+intp+decp+"Y"+intp+decp;
    };
    return cmd;
};

GERBER.setUnit = function(unit){
    return new GerberExtendedCommand("MO",[unit]);
};

GERBER.defineMacro=function(mid,macro){
    return new GerberExtendedCommand("AM",[mid,macro]);
};

GERBER.defineAperture=function(dcode, ap){
    var cmd = new GerberExtendedCommand("ADD",[dcode,ap]);
    
    /* local implementation of commandAsString */
    cmd.commandAsString=function(context){
	return dcode + ap.toString(context);
    };
    return cmd;
};

GERBER.setAperture=function(dcode){
    return new GerberCommand("D",[dcode]);
};


GERBER.setLevelPolarity=function(isDark){
    return new GerberExtendedCommand("LP",[isDark?"D":"C"]);
};


GERBER.draw=function(point,offset){
    return new GERBER.D01(point, offset);
};

GERBER.move = function(point){
    return new GerberOperation("D02", [point]);
};

GERBER.flash = function(point){
    return new GerberOperation("D03", [point]);
};


GERBER.endFile = function(){
    return new GerberCommand("M02");
};

GERBER.setLinearInterpolation = function(){
    return new GerberCommand("G01");
};

GERBER.setClockwiseInterpolation = function(){
    return new GerberCommand("G02");
};

GERBER.setAntiClockWiseInterpolation = function(){
    return new GerberCommand("G03");
};


function GerberAperture(tid,modifiers){
    /* aperture template id */
    this.tid = tid;
    this.modifiers=modifiers;
    /* store signature */
    this.signature;

}

GerberAperture.prototype = new Object();
GerberAperture.prototype.constructor = GerberAperture;

GerberAperture.prototype.generateSignature=function(decp){
    var as = this.tid+","+this.modifiers[0].toFixed(decp);
    
    for(var i=1;i<this.modifiers.length;i++){
	var cm = this.modifiers[i];
	/* proceed until we find an undefined modifier */
	if(!cm){
	    break;
	}
	as+="X"+cm.toFixed(decp);
    }
    /* save signature */
    this.signature = as;
    return as;
};


GerberAperture.prototype.toString=function(context){
    if(!this.signature){
	this.generateSignature(context.format.decp);
    }
    return this.signature;
};


function GerberContext(){
    /* by default the format will have 3 integer digits and 6 decimal digits */
    this.format = {intp : 3, decp: 6};
    /* by default unit is millimeter */
    this.units = "MM";
    /* default level polarity is dark */ 
    this.levelPolarity=1; // 1 for dark 0  for clear
    
    /* apertures by their id */
    this.aperturesById = {};
    /* map aperture signature to internal id */
    this.aperturesBySignature = {};
    /* aperture macros by their id */
    this.macros={};
    this.currentPoint=new Point([0,0]);
    this.currentAperture;
    this.interpolationMode;
    this.quadrantMode;
    this.regionMode;
    
    /* the next available aperture id, start with 10 */
    this.nextApertureId=10;
}

GerberContext.prototype = new Object();
GerberContext.prototype.constructor= GerberContext;

/**
 * Checks if the provided template id  is valid
 * @param tid - template id
 * @returns
 */
GerberContext.prototype.isTemplateIdValid=function(tid){
    return (GERBER.TEMPLATES[tid] || this.macros[tid]);
};





GerberContext.prototype.setAperture=function(apId){
    if(apId >= this.nextApertureId){
	throw "Aperture with id "+apId+" was not yet defined.";
    }
   
    this.curentAperture = apId;
};


GerberContext.prototype.setCurrentPoint=function(point){
    this.currentPoint=point;
};


GerberContext.prototype.getAperture=function(tid,modifiers,create){
    /* check if the template id is valid */
    if(!this.isTemplateIdValid(tid)){
	throw "Invalid template id: "+tid;
    }
    
    /* build the aperture signature from template id and modifiers, and return whatever we find for that */
    
   
    var apId = this.aperturesBySignature[new GerberAperture(tid, modifiers).generateSignature(this.format.decp)];
    
    if(!apId && create){
	apId = this.defineAperture(tid,modifiers);
    }
    
    return apId;
};


GerberContext.prototype.defineAperture=function(tid,modifiers){
    /* see if this is a default template */
    var template = GERBER.TEMPLATES[tid];
    if(!template){
	template = this.macros[tid];
    }
    
    if(!template){
	throw "No aperture template found: "+tid;
    }
    
    /* build the aperture */
    var ap = template.build(modifiers);
    
    /* store it */
    var apId = this.nextApertureId++;
    this.aperturesById[apId]=ap;
    this.aperturesBySignature[ap.generateSignature(this.format.decp)]=apId;
    
    return apId;
};


function GerberWriter(){
    
    this.context=new GerberContext();
    
    /* the commands sequence */
    this.commandStream=[];
    
}

GerberWriter.prototype = new Object();
GerberWriter.prototype.constructor= GerberWriter;

/*initialize writer */
GerberWriter.prototype.init=function(){
    
};

GerberWriter.prototype.pushCommand=function(command){
    this.commandStream.push(command);
};

GerberWriter.prototype.setLevelPolarity=function(isDark){
    if(this.context.levelPolarity != isDark ){
	this.context.levelPolarity=isDark;
	this.pushCommand(GERBER.setLevelPolarity(isDark));
    }
};

GerberWriter.prototype.setAperture = function(dcode){
    if(dcode != this.context.curentAperture){
	this.context.setAperture(dcode);
	this.pushCommand(GERBER.setAperture(dcode));
    }
};

GerberWriter.prototype.setCircleAperture=function(diameter, holeDiameter){
    return this.setAperture(this.context.getAperture("C",[diameter,holeDiameter],true));
};

GerberWriter.prototype.setLinearInterpolation=function(){
    this.updateInterpolation(GERBER.setLinearInterpolation());
    
};

GerberWriter.prototype.setClockwiseInterpolation=function(){
    this.updateInterpolation(GERBER.setClockwiseInterpolation());
    
};

GerberWriter.prototype.setAntiClockwiseInterpolation=function(){
    this.updateInterpolation(GERBER.setAntiClockwiseInterpolation());
    
};

GerberWriter.prototype.updateInterpolation=function(command){
    if(this.context.interpolationMode != command.id){
	this.context.interpolationMode = command.id;
	this.pushCommand(command);
    }
};

GerberWriter.prototype.move=function(point){
    if(!this.context.currentPoint.equals(point)){
	this.context.setCurrentPoint(point);
	this.pushCommand(GERBER.move(point));
    }
    
};

GerberWriter.prototype.draw=function(point,offset){
    this.pushCommand(GERBER.draw(point, offset));
    this.context.setCurrentPoint(point);
};

GerberWriter.prototype.flash=function(point){
    this.pushCommand(GERBER.flash(point));
    this.context.setCurrentPoint(point);
    
};

/**
 * This will end the command stream for this writer
 */
GerberWriter.prototype.close=function(){
   /* build the header */
    
    var header=[];
    
    /* set format */
    header.push(GERBER.setFormat(this.context.format.intp, this.context.format.decp));
    
    /* set unit */
    header.push(GERBER.setUnit(this.context.units));
    
    /* set polarity */
    header.push(GERBER.setLevelPolarity(this.context.levelPolarity));
    
    /* add macros */
    for(var mid in this.context.macros){
	header.push(GERBER.defineMacro(mid, this.context.macros[mid]));
    }
    
    /* add aperture definitions */
    for(var dcode in this.context.aperturesById){
	header.push(GERBER.defineAperture(dcode, this.context.aperturesById[dcode]));
    }
    
    
    /* now that we're done, inject the header at the beginning of the stream */
    
    for(var i=header.length-1;i>=0;i--){
	this.commandStream.unshift(header[i]);
    }
    
    /* add the end file command */
    
    this.pushCommand(GERBER.endFile());
};


