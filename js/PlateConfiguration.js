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
//rnai screening plates
// its logic of the plate states is based on two levels (classical MVC design - this class here is the Controller)
// 1. first the internal configuration represented by the clickregistry (Model)
// 2. second: its graphic representation by the html5wells datastructure (list of Cell objects) (this is our View)
de.dkfz.signaling.webcellhts.PlateConfiguration = function(plateFormat, ctx) {
	//init stuff
	this.plateFormat = plateFormat;
	var rowColObj = getRowsColsFromPlateFormat(plateFormat);
	//this array holds the state of the wells of the plate
	this.rows = rowColObj.rows;
	this.columns = rowColObj.columns;
	this.ctx = ctx;  
	this.cfg = de.dkfz.signaling.webcellhts.Config;
	//this array holds the html5 canvas rectangle objects of the wells of the plate
	this.html5Wells = de.dkfz.signaling.b110.JsHelper.prototype.create2DArray(this.rows, this.columns);
	this.posCalculator = new de.dkfz.signaling.webcellhts.PositionCalculator(this.rows, this.columns);
	this.cellDimension = this.posCalculator.getCellDimension();
	this.initCanvasCellObj();	
	this.jsHelper = new de.dkfz.signaling.b110.JsHelper();
	this.clickRegistry = new de.dkfz.signaling.webcellhts.ClickRegistry(this.rows, this.columns);
}
//draw all...this draws a complete empty and freshly initalized plate with the border, the headings and the cells
de.dkfz.signaling.webcellhts.PlateConfiguration.prototype.drawAll = function() {
	this.drawBorders();
	this.drawHeadings();
	this.drawAllCells();
}
//draw the row and column heading
de.dkfz.signaling.webcellhts.PlateConfiguration.prototype.drawHeadings = function() {
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
//this sets the type for a complete row, e.g. when clicking on the heading rows...it also has a undo functionality
//if clicked again on the same button (but works only if clicked immediately again)

de.dkfz.signaling.webcellhts.PlateConfiguration.prototype.setRowToTypeAndDraw = function( row, type ) {
	var i = row;
	if( i < 0 ) {
		return;
	}	
	if(this.cfg.DEBUG_CLICK) { //debug output to analyse click registry correctness
		console.log("before head row click");
		//console_log_2D_arr(this.clickRegistry.currentWellStateArr);
		console_log_2D_arr(0, this.clickRegistry.currentWellStateArr, "currentArr");
		console_log_2D_arr(0, this.clickRegistry.undoWellStateArr, "undoArr");
		console_log_2D_arr(0, this.clickRegistry.rowStates.rowTypeUndoArr, "headRowArr");
	}
	var newRowCellState = this.clickRegistry.clickRowHeadState(row);
	
	var changes = false;
	if(newRowCellState == this.cfg.HEAD_CELL_STATE.delete ) {
		this.clickRegistry.setRowCells(row, type);
		changes = true;
	}
	else if(newRowCellState == this.cfg.HEAD_CELL_STATE.undo ) {
		this.clickRegistry.undoRowCells(row);
		changes = true;
	}
	
	if(changes) { //draw the model for real only if something is different
		for(var column = 0; column < this.columns; column++) {
			this.html5Wells[row][column].currentType = this.clickRegistry.getCurrentCellType(row, column);
			this.html5Wells[row][column].drawAll();
		}
	}
	if(this.cfg.DEBUG_CLICK) { //debug output to analyse click registry correctness
		console.log("after head row click");
		//console_log_2D_arr(this.clickRegistry.currentWellStateArr);
		console_log_2D_arr(0, this.clickRegistry.currentWellStateArr, "currentArr");
		console_log_2D_arr(0, this.clickRegistry.undoWellStateArr, "undoArr");
		console_log_2D_arr(0, this.clickRegistry.rowStates.rowTypeUndoArr, "headRowArr");
	}
	
	
}
//this function clears the complet plate configuration and has a undo functionality
//if clicked again on the undo button (but works only if clicked immediately again)
de.dkfz.signaling.webcellhts.PlateConfiguration.prototype.resetPlateLayoutForUndo = function() {
	var newXCellState = this.clickRegistry.clickXHeadState();

	if(newXCellState == this.cfg.HEAD_CELL_STATE.delete ) {
		this.clickRegistry.setAllCells(this.cfg.CELL_TYPE.empty);
	}
	else if(newXCellState == this.cfg.HEAD_CELL_STATE.undo) {
		this.clickRegistry.undoAllCells();
	}
	
	//drawall cells (this is our View)
	for(var i = 0; i < this.rows; i++) {
		for(var j = 0; j < this.columns; j++) {
			this.html5Wells[i][j].currentType = this.clickRegistry.getCurrentCellType(i, j);
			this.html5Wells[i][j].drawAll();
			
		}
	}

}


//this is the master drawing function...with storing undo info etc.
de.dkfz.signaling.webcellhts.PlateConfiguration.prototype.setCellToTypeAndDraw = function( row, col, type ) {
	if(this.cfg.DEBUG_CLICK) { //debug output to analyse click registry correctness
		console.log("before single cell click");
		//console_log_2D_arr(this.clickRegistry.currentWellStateArr);
		console_log_2D_arr(0, this.clickRegistry.currentWellStateArr, "currentArr");
		console_log_2D_arr(0, this.clickRegistry.undoWellStateArr, "undoArr");
		console_log_2D_arr(0, this.clickRegistry.rowStates.rowTypeUndoArr, "headRowArr");
	}
	var currType = this.clickRegistry.getCurrentCellType(row, col);
	var newType = this.clickRegistry.clickSingleCell(row, col, type);
	//only draw the internal state (represented by the clickregistry) if something is different
	if(currType != newType) {
		//set the cell with the new type for real
		this.html5Wells[row][col].setCurrentType(newType);
		this.html5Wells[row][col].drawAll();
	}
	if(this.cfg.DEBUG_CLICK) { //debug output to analyse click registry correctness
		console.log("after single cell click");
		//console_log_2D_arr(this.clickRegistry.currentWellStateArr);
		console_log_2D_arr(0, this.clickRegistry.currentWellStateArr, "currentArr");
		console_log_2D_arr(0, this.clickRegistry.undoWellStateArr, "undoArr");
		console_log_2D_arr(0, this.clickRegistry.rowStates.rowTypeUndoArr, "headRowArr");
		console.log("---");
	}
}

//this resets the complete plate layout and redraws the cells
de.dkfz.signaling.webcellhts.PlateConfiguration.prototype.resetConfiguration = function() {
	this.emptyWellStates(); //empty the well states
	this.emptyHeadingStates();	//set ALL the states of the headings to type empty
	this.drawAllCells();	
}

//this resets the complete plate layout and redraws the cells
de.dkfz.signaling.webcellhts.PlateConfiguration.prototype.resetConfigAndRedraw = function() {
	this.resetConfiguration();
	this.drawAllCells();	
}

//create and init the cells for that plate (canvas cell objects)
//do not draw them, only initialize the shape and position
de.dkfz.signaling.webcellhts.PlateConfiguration.prototype.initCanvasCellObj = function(){
	//this is our coordinate pointer for the current well
	//start at the most left upper cell...set 
	var currentDrawCoordinate = this.posCalculator.getActualUpperLeftCellStart();
	var leftXCoordinate = currentDrawCoordinate.x;
	for(var i = 0; i < this.rows; i++) {
		for(var j = 0; j < this.columns; j++) {
		//we have to copy because otherwise we change the same reference all the time
			var copiedCurrentCoordinate = {x:currentDrawCoordinate.x,y:currentDrawCoordinate.y};
			this.html5Wells[i][j] = new de.dkfz.signaling.webcellhts.Cell(i, j, 
										this.cellDimension, copiedCurrentCoordinate, this.ctx);
			//move forward to next column...dont forget the padding for the cell
			currentDrawCoordinate.x += this.cellDimension.width + this.cfg.CELL_PADDING.x;
		}
		//move to next row
		currentDrawCoordinate.x = leftXCoordinate; //reset x axis
		currentDrawCoordinate.y += this.cellDimension.height + this.cfg.CELL_PADDING.y;  //next row
	}
}

//draw all cells with undo informateion
de.dkfz.signaling.webcellhts.PlateConfiguration.prototype.drawAllCells = function(){
	for(var i = 0; i < this.rows; i++) {
		for(var j = 0; j < this.columns; j++) {
			this.html5Wells[i][j].drawAll();
		}
	}
}

de.dkfz.signaling.webcellhts.PlateConfiguration.prototype.drawBorders = function() {
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

//this copies the well states from an html5 array to an empty standard 2D array 
de.dkfz.signaling.webcellhts.PlateConfiguration.prototype.copyWellStatesToHtml5Wells = function(srcArr) {
	if(srcArr.length != this.html5Wells.length) {
		return;
	}
	for(var i = 0; i < srcArr.length; i++) {
		if(srcArr[i].length != this.html5Wells[i].length) {
			return;
		}
		for(var j = 0; j < srcArr[i].length; j++) {
			this.html5Wells[i][j].currentType = srcArr[i][j];
		}
	}	
}
//this copies the well states from an an empty standard 2D array to an html5 array  
de.dkfz.signaling.webcellhts.PlateConfiguration.prototype.copyWellStatesFromHtml5Wells = function(destArr) {
	if(this.html5Wells.length != destArr.length) {
		return;
	}
	for(var i = 0; i < this.html5Wells.length; i++) {
		if(this.html5Wells[i].length != destArr[i].length) {
			return;
		}
		for(var j = 0; j < this.html5Wells[j].length; j++) {
			destArr[i][j] = this.html5Wells[i][j].currentType;
		}
	}	
} 
//this extracts a complete row of html5 array  Welltypes
de.dkfz.signaling.webcellhts.PlateConfiguration.prototype.extractWellTypeOfHtml5Row = function(rowIdx) {
	var rowOfInterest = this.html5Wells[rowIdx];
	var returnRowTypes = new Array(rowOfInterest.length);
	for(var i = 0; i < rowOfInterest.length; i++) {
		returnRowTypes[i] = rowOfInterest[i].currentType;
	}
	return returnRowTypes;
} 
//this sets a complete row of welltypes on ahtml5 array  
de.dkfz.signaling.webcellhts.PlateConfiguration.prototype.addWellTypeToHtml5Row = function(rowIdx, rowOfInterest) {
	this.html5Wells[rowIdx].currentType = rowOfInterest;
	for(var i = 0; i < rowOfInterest.length; i++) {
		 this.html5Wells[rowIdx][i].currentType = rowOfInterest[i];
	}
} 


