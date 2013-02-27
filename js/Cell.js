/*
**    Copyright (C) 2012 German Cancer Research Center
**                            S
**
**    This library is free software; you can redistribute it and/or
**    modify it under the terms of the GNU Lesser General Public
**    License as published by the Free Software Foundation; either
**    version 2.1 of the License, or (at your option) any later version.
**
**    This library is distributed in the hope that it will be useful,
**    but WITHOUT ANY WARRANTY; without even the implied warranty of
**    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
**    Lesser General Public License for more details.
**
**    You should have received a copy of the GNU Lesser General Public
**    License along with this library; if not, write to the Free Software
**    Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307  USA
*/

// setup namespace if not already defined
if(!de) {
	var de = {};
}
if(!de.dkfz)
    de.dkfz = {};
if(!de.dkfz.signaling)
    de.dkfz.signaling = {};
if(!de.dkfz.signaling.webcellhts)
    de.dkfz.signaling.webcellhts = {};    


// ---------------------------------------------------------------------------------------------------------------------
// - Cell
// -
// -   Description: This is a cell (well) of a wellplate
// -   Author: Oliver Pelz
// -   Version: 0.01
// -
// -   Parameter: container = id of canvas element (no query selector id)
//
// ---------------------------------------------------------------------------------------------------------------------

//this class is for configurating of any kind of high-throughput 
//rnai screening
de.dkfz.signaling.webcellhts.Cell = function(rowIndex, columnIndex, 
										dimensions, drawPosition, currentType, ctx) {	
	//init stuff
	this.rowIndex = rowIndex;
	this.colIndex = columnIndex;
	this.dimensions = dimensions;   //the width and height as an object
	//this array holds the state of the wells of the plate, this is a Config.WELLTYPE obj
	this.currentType = currentType;
	//the upper left position of it, this is an object of type: {x:..,y:..}; 
	this.drawPosition = drawPosition; 
	this.ctx = ctx;  
	this.cfg = de.dkfz.signaling.webcellhts.Config;
	this.helper = new de.dkfz.signaling.b110.JsHelper();	
}


//draw the shape and the text
de.dkfz.signaling.webcellhts.Cell.prototype.drawAll = function(){
	this._drawShape();
	this._drawCenteredText();
}
de.dkfz.signaling.webcellhts.Cell.prototype.getBorders = function() {	
	return {x_start:this.drawPosition.x , x_stop:this.drawPosition.x+this.dimensions.width,
			 y_start: this.drawPosition.y , y_stop:this.drawPosition.y+this.dimensions.height
		   };
}
//this is a helper function, draw a cell shaped object with any text 
// and a position parameter (this is not an object property in this case)
// e.g. for headings etc.
de.dkfz.signaling.webcellhts.Cell.prototype.drawCellShapeWithText = function(position, text) {
	this._drawShapeWithPosition(position);
	this._drawCenteredTextWithPosition(position, text);
}


//private functions

//draw a cell by its upper left position (coordinate obj: {x:,y:})
de.dkfz.signaling.webcellhts.Cell.prototype._drawShape = function() {	
	this._drawShapeWithPosition(this.drawPosition);	
}
//draw a cell with the upper left position
de.dkfz.signaling.webcellhts.Cell.prototype._drawShapeWithPosition = function(drawPosition) {	
	var color = getColorForWellType(this.currentType);
	var lineStrength = this.cfg.CELL_LINESTRENGTH;
	this.ctx.save();
	this.ctx.fillStyle = color;
    this.ctx.fillRect(drawPosition.x, drawPosition.y, 
					this.dimensions.width  , this.dimensions.height );
					
	var lineColor =  this.cfg.CELL_LINECOLOR;	
	
	this.ctx.lineWidth = lineStrength;   
	this.ctx.strokeStyle = lineColor;
	this.ctx.restore();
	//this.ctx.strokeRect(drawPosition.x, drawPosition.y, 
	//				this.dimensions.width, this.dimensions.height);	
		
}
de.dkfz.signaling.webcellhts.Cell.prototype._drawCenteredText	= function() {
		var text = this._numberToRowCode();
		this._drawCenteredTextWithPosition(this.drawPosition, text);
}
de.dkfz.signaling.webcellhts.Cell.prototype._drawCenteredTextWithPosition	= function(drawPosition, text) {
		this.ctx.save();
		this.ctx.textAlign = "center";	
		var fontPx = this.helper.getSmallerNum(this.dimensions.width, this.dimensions.height) * 0.5;	//the font size about 1/2 of the cell			  
		this.ctx.font = fontPx+"px "+this.cfg.CELL_FONT;
		this.ctx.fillStyle = this.cfg.CELL_FONT_COLOR;
		//center the text in the cell.. 
		var xDrawPos = drawPosition.x + this.dimensions.width * 0.5; //center in the middle of the cell
		//center the y axis, we take the font size into account
		var yDrawPos = drawPosition.y + this.dimensions.height * 0.7;
		this.ctx.fillText(text, xDrawPos, yDrawPos);		
		this.ctx.restore();
}
//this method returns ascii character value for integer based on 1=A etc.
de.dkfz.signaling.webcellhts.Cell.prototype._numberToRowCode = function() { 
	var displayRow = this.rowIndex+1;
    var displayCol = this.colIndex+1;
	var colCode = String.fromCharCode((displayCol+64));
	var label = colCode+""+displayRow;
   	return label; 
}
//this method returns ascii character value for integer based on 1=A etc.
de.dkfz.signaling.webcellhts.Cell.prototype.numberToRowCode = function(number) { 
	return String.fromCharCode((number+64));
}
//this method draws an anonymous cell without keeping track of a reference etc
de.dkfz.signaling.webcellhts.Cell.prototype.drawAnonymousCellWithText = function(startPos, text, cellDimension, ctx) { 
	var cell = new de.dkfz.signaling.webcellhts.Cell(null, null, 
										cellDimension, null, 
										de.dkfz.signaling.webcellhts.Config.CELL_TYPE.other, ctx);
	cell.drawCellShapeWithText(startPos, text);
}
	 


