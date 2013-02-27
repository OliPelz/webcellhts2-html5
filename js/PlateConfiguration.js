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
// - PlateConfiguration
// -
// -   Description: Draws a PlateEditor in pure JS
// -   Author: Oliver Pelz
// -   Version: 0.01
// -
// -   Parameter: container = id of canvas element (no query selector id)
//
// ---------------------------------------------------------------------------------------------------------------------

//this class is for configurating of any kind of high-throughput 
//rnai screening
de.dkfz.signaling.webcellhts.PlateConfiguration = function(plateFormat, ctx) {
	//init stuff
	this.plateFormat = plateFormat;
	var rowColObj = getRowsColsFromPlateFormat(plateFormat);
	//this array holds the state of the wells of the plate
	this.rows = rowColObj.rows;
	this.columns = rowColObj.columns;
	//this array holds the internal well states e.g. empty,positive...for every cell in the 2d array
	this.wellStateArr = de.dkfz.signaling.b110.JsHelper.prototype.create2DArray(this.rows, this.columns);
	//this array holds the former well states...this is important for undo functionality
	this.undoWellStateArr = de.dkfz.signaling.b110.JsHelper.prototype.create2DArray(this.rows, this.columns);
	this.ctx = ctx;  
	this.cfg = de.dkfz.signaling.webcellhts.Config;
	//this array holds the html5 canvas rectangle objects of the wells of the plate
	this.html5Wells = de.dkfz.signaling.b110.JsHelper.prototype.create2DArray(this.rows, this.columns);
	this.posCalculator = new de.dkfz.signaling.webcellhts.PositionCalculator(this.rows, this.columns);
	this.cellDimension = this.posCalculator.getCellDimension();
	this._emptyWellStates();

	this._initCanvasCellObj();
	this.jsHelper = new de.dkfz.signaling.b110.JsHelper();
}
//draw all...this draws a complete empty and freshly initalized plate with the border, the headings and the cells
de.dkfz.signaling.webcellhts.PlateConfiguration.prototype.drawAll = function() {
	this._drawBorders();
	this._drawHeadings();
	this._drawAllCells();
}
//draw the row and column heading
de.dkfz.signaling.webcellhts.PlateConfiguration.prototype._drawHeadings = function() {
	var startPos = this.posCalculator.getActualUpperLeftHeadingStart();
	//draw an X at that position
	de.dkfz.signaling.webcellhts.Cell.prototype.drawAnonymousCellWithText(startPos, "X", this.cellDimension, this.ctx);
	//move forward one position
	startPos.y += this.cellDimension.height + this.cfg.CELL_PADDING.y;
	
	//now fill all rows
	for(var i = 0; i < this.rows; i++) {
		//var text = de.dkfz.signaling.webcellhts.Cell.prototype.numberToRowCode(i+1);
		var text = i+1;
		//draw a generic dummy cell in order to draw a "heading" cell, dont keep track of it 
		de.dkfz.signaling.webcellhts.Cell.prototype.drawAnonymousCellWithText(startPos, text, this.cellDimension, this.ctx)
		//move to next position
		startPos.y += this.cellDimension.height + this.cfg.CELL_PADDING.y;
	}
	//now fill all the columns
	startPos = this.posCalculator.getActualUpperLeftHeadingStart(); //reset
	//move forward one position
	startPos.x += this.cellDimension.width + this.cfg.CELL_PADDING.x;
	for(var i = 0; i < this.columns; i++) {
		var text = de.dkfz.signaling.webcellhts.Cell.prototype.numberToRowCode(i+1);
		//draw a generic dummy cell in order to draw a "heading" cell, dont keep track of it 
		de.dkfz.signaling.webcellhts.Cell.prototype.drawAnonymousCellWithText(startPos, text, this.cellDimension, this.ctx)
		//move to next position
		startPos.x += this.cellDimension.width + this.cfg.CELL_PADDING.x;
	}
	
	
}
//this resets the complete plate layout and redraws the cells
de.dkfz.signaling.webcellhts.PlateConfiguration.prototype.setCellToTypeAndDraw = function( row, col, type ) {
	var i = row;
	var j = col;
	if( i < 0 ) {
		return;
	}
	if( j < 0 ) {
		return;
	}
	//if we have clicked with the same type again on the well, undo the state
	//so a simple undo feature is clicking two times on a cell
	if(type == this.wellStateArr[i][j]) {
		 type = this.undoWellStateArr[i][j];
	}
	var oldType = this.wellStateArr[i][j];
	this.wellStateArr[i][j] = type;
	//save the old state for next round or later undo commands
	this.undoWellStateArr[i][j] = oldType;
	this.html5Wells[i][j].currentType = this.wellStateArr[i][j];
	this.html5Wells[i][j].drawAll();
	 
}

//this resets the complete plate layout and redraws the cells
de.dkfz.signaling.webcellhts.PlateConfiguration.prototype.resetPlateLayoutAndRedraw = function() {
	this._emptyWellStates(); //empty the well states
	this._emptyCellStates();	//set the states of the cell obj to empty as well
	this._drawAllCells();	
}
//inits all internal wellStateArr array with the type type
de.dkfz.signaling.webcellhts.PlateConfiguration.prototype.setAllWellStates = function(type) {
	for(var i = 0; i < this.rows; i++) {
		for(var j = 0; j < this.columns; j++) {
			this.wellStateArr[i][j] = type;
			this.undoWellStateArr[i][j] = type;
		}
	}
}


//inits all internal wellStateArr array with the type 'empty'
de.dkfz.signaling.webcellhts.PlateConfiguration.prototype._emptyWellStates = function() {
	this.setAllWellStates(this.cfg.CELL_TYPE.empty);
}
//crete and init the cells for that plate (canvas cell objects)
//do not draw them, only initialize the shape and position
de.dkfz.signaling.webcellhts.PlateConfiguration.prototype._initCanvasCellObj = function(){
	//this is our coordinate pointer for the current well
	//start at the most left upper cell...set 
	var currentDrawCoordinate = this.posCalculator.getActualUpperLeftCellStart();
	var leftXCoordinate = currentDrawCoordinate.x;
	for(var i = 0; i < this.rows; i++) {
		for(var j = 0; j < this.columns; j++) {
		//we have to copy because otherwise we change the same reference all the time
			var copiedCurrentCoordinate = {x:currentDrawCoordinate.x,y:currentDrawCoordinate.y};
			this.html5Wells[i][j] = new de.dkfz.signaling.webcellhts.Cell(i, j, 
										this.cellDimension, copiedCurrentCoordinate, 
										this.wellStateArr[i][j], this.ctx);
			//move forward to next column...dont forget the padding for the cell
			currentDrawCoordinate.x += this.cellDimension.width + this.cfg.CELL_PADDING.x;
		}
		//move to next row
		currentDrawCoordinate.x = leftXCoordinate; //reset x axis
		currentDrawCoordinate.y += this.cellDimension.height + this.cfg.CELL_PADDING.y;  //next row
	}
}

//this method is a convenient method to set all the canvas cell obj to empty (not the wellstates)
de.dkfz.signaling.webcellhts.PlateConfiguration.prototype._setAllCellStates = function(type) {
	for(var i = 0; i < this.rows; i++) {
		for(var j = 0; j < this.columns; j++) {
			this.html5Wells[i][j].currentType = type;
		}
	}
}

//this method is a convenient method to set all the canvas cell obj to empty
de.dkfz.signaling.webcellhts.PlateConfiguration.prototype._emptyCellStates = function(){
	this._setAllCellStates(this.cfg.CELL_TYPE.empty);
}

//draw all the cells with the current type etc...
de.dkfz.signaling.webcellhts.PlateConfiguration.prototype._drawAllCells = function(){
	for(var i = 0; i < this.rows; i++) {
		for(var j = 0; j < this.columns; j++) {
			this.html5Wells[i][j].drawAll();
		}
	}
}



de.dkfz.signaling.webcellhts.PlateConfiguration.prototype._drawBorders = function() {
	/*var lineColor = this.cfg.WELLPLATE_LINECOLOR;
	var lineStrength = this.cfg.WELLPLATE_LINESTRENGTH;
	this.ctx.strokeStyle = lineColor;
	this.ctx.lineWidth = lineStrength;
	var plateDimension = this.posCalculator.getPlateDimension();
	//draw the border around the plate (this must not be the canvas border)
	this.ctx.strokeRect(this.cfg.WELLPLATE_POS.x, this.cfg.WELLPLATE_POS.y, 
					plateDimension.width, plateDimension.height);*/
	this.jsHelper.strokeRectangle(this.cfg.WELLPLATE_LINECOLOR, this.cfg.WELLPLATE_LINESTRENGTH
								,  this.posCalculator.getPlateDimension()
								, this.cfg.WELLPLATE_POS
								, this.ctx);
}
//this clears the complete drawn plate
de.dkfz.signaling.webcellhts.PlateConfiguration.prototype.clearPlateDraw = function() {
	var plateDimension = this.posCalculator.getPlateDimension();
	this.ctx.clearRect(this.cfg.WELLPLATE_POS.x, this.cfg.WELLPLATE_POS.y, 
    						plateDimension.width, plateDimension.height);
}
de.dkfz.signaling.webcellhts.PlateConfiguration.prototype.getCellDimension = function() {
	return this.cellDimension;
}

//this gives the range of the cells e.g. x-axis could be:
// (x_start:150,x_stop:200),(x_start:210,x_stops:260)
de.dkfz.signaling.webcellhts.PlateConfiguration.prototype.getPlateRangeCoordinates = function(axis) {
	var returnArray = new Array();
	if(this.html5Wells.length  < 1) {
		return new Array();
	}
	var firstRow = this.html5Wells[0];
	
	if(axis == "x") {
		for(var i = 0; i < firstRow.length; i++) {
			returnArray.push(firstRow[i].getBorders());
		}
	}
	else if (axis == "y") {
		for(var i = 0; i < this.html5Wells.size();i++) {
			returnArray.push(this.html5Wells[i].getBorders());
		}
	}
	return returnArray;
}

