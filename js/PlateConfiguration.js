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
	//this array holds the former well states (e.g. empty,positive)...this is important for undo functionality
	this.undoWellStateArr = de.dkfz.signaling.b110.JsHelper.prototype.create2DArray(this.rows, this.columns);
	//this holds the current heading row click state
	this.headRowClickedArr = {clickedId: -1, clickedType: -1};
	this.undoHeadRowArr = de.dkfz.signaling.b110.JsHelper.prototype.create2DArray(this.rows, this.columns);//contains undo information for all rows
	//this holds the current column state arr
	this.headColumnClickedArr = new Array(this.columns);
	this.undoHeadColumnArr = de.dkfz.signaling.b110.JsHelper.prototype.create2DArray(this.columns, this.rows);
	this.operationIdCounter = 0; //this is the id counter of user operations (clicks to wells or header inc. 'x')
	this.deletePlateId = 0;   //this saves the id of the last deletion operation (for the delete or clear button e.g. X)
	this.ctx = ctx;  
	this.cfg = de.dkfz.signaling.webcellhts.Config;
	//this array holds the html5 canvas rectangle objects of the wells of the plate
	this.html5Wells = de.dkfz.signaling.b110.JsHelper.prototype.create2DArray(this.rows, this.columns);
	this.posCalculator = new de.dkfz.signaling.webcellhts.PositionCalculator(this.rows, this.columns);
	this.cellDimension = this.posCalculator.getCellDimension();
	this.initCanvasCellObj();

	this.resetConfigAndRedraw();

	
	this.jsHelper = new de.dkfz.signaling.b110.JsHelper();
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
	this.operationIdCounter++;  //this is a user operation so increase id counter..we keep track of all user interaction
	var i = row;
	if( i < 0 ) {
		return;
	}	 
	//if we have clicked with the same type again on the head row AND our 'complete row click' was the one INMMEDIATELY before undo the state
	//so a simple undo feature is clicking two times on the head row
	if(type == this.headRowClickedArr.clickedType && this.operationIdCounter == this.headRowClickedArr.clickedId + 1){  
		 this.headRowClickedArr.clickedType =  this.cfg.CELL_TYPE.empty;//reset state
		 this.addWellTypeToHtml5Row(i, this.undoHeadRowArr[i]); //restore to html5 arr
		 //draw the row: fill the complete row (all columns) with type already stored in the arr
		for(var j = 0; j < this.columns; j++) {
			this.html5Wells[i][j].drawAll();
		}
	}
	else{  // if we clicked here...overlay the complete row with specific type
		this.headRowClickedArr[i] = type;   //store the clicked type for next round
		this.undoHeadRowArr[i] = this.extractWellTypeOfHtml5Row(i);  //save the last state of all cells in the row for later undo
		//draw the row: fill the complete row (all columns) with specific type
		for(var j = 0; j < this.columns; j++) {
			this.html5Wells[i][j].currentType = type;
			this.html5Wells[i][j].drawAll();
		}
		this.headRowClickedArr.clickedId = this.operationIdCounter; //store the last clicked id so if the next thing wil be the same type we will undo (but only if exact the next click)
	}
	this.headRowClickedArr.clickedType = type;
}
//this function clears the complet plate configuration and has a undo functionality
//if clicked again on the undo button (but works only if clicked immediately again)
de.dkfz.signaling.webcellhts.PlateConfiguration.prototype.resetPlateLayoutForUndo = function() {
	this.operationIdCounter++;  //this is a user operation so increase id counter..we keep track of all user interaction
	
	if(this.operationIdCounter != this.deletePlateId + 1) { //if we clear the plate..clear only if the previous step was also a clear step (works also if we clear for the first step)
		this.copyWellStatesFromHtml5Wells(this.undoWellStateArr);
		//clear the current
		this.emptyWellStates(); 
		//inc counter if we have deleted now to keep track of undo operations (only allowed immediately afterwards)
		this.deletePlateId = this.operationIdCounter;
	}	
	//if we have clicked the delete button before...this is our UNDO operation..but only if we have clicked it IMMEDIATELY BEFORE..not later
	else { //if we have clicked it before restore the old states
			this.deletePlateId = 0;
			this.copyWellStatesToHtml5Wells(this.undoWellStateArr);
			//clear undo arr
			this.emptyUndoWellStates();
	}
	//draw
	this.drawAllCells();

	
}


//this is the master drawing function...with storing undo info etc.
de.dkfz.signaling.webcellhts.PlateConfiguration.prototype.setCellToTypeAndDraw = function( row, col, type ) {
	this.operationIdCounter++; //this is a user operation
	var i = row;
	var j = col;
	if( i < 0 ) {
		return;
	}
	if( j < 0 ) {
		return;
	}
	var oldType = this.html5Wells[i][j].currentType; //temp save the old state..var will be overwritten later
	
	//if we have clicked with the same type again on the well, undo the state
	//so a simple undo feature is clicking two times on a cell
	if(type == oldType) {
		 type = this.undoWellStateArr[i][j]; //restore the old state
	}
	//set the new type for the current cell
	this.html5Wells[i][j].currentType = type;
	//save the old state for next round or later undo commands
	this.undoWellStateArr[i][j] = oldType;
	this.html5Wells[i][j].drawAll();
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

//inits all internal undo wellstate array with the type type
de.dkfz.signaling.webcellhts.PlateConfiguration.prototype.setAllUndoWellStates = function(type) {
	for(var i = 0; i < this.rows; i++) {
		for(var j = 0; j < this.columns; j++) {
			this.undoWellStateArr[i][j] = type;
		}
	}
}


//inits all internal wellStateArr array with the type type
de.dkfz.signaling.webcellhts.PlateConfiguration.prototype.setAllWellStates = function(type) {
	for(var i = 0; i < this.rows; i++) {
		for(var j = 0; j < this.columns; j++) {
			this.html5Wells[i][j].currentType = type;
		}
	}
}
//inits all internal heading arrays with type
de.dkfz.signaling.webcellhts.PlateConfiguration.prototype.setAllHeadingStates = function(type) {
	for(var i = 0; i < this.rows; i++) {
		this.headRowClickedArr[i] = type;
		for(var j = 0; j < this.columns; j++) {
			this.undoHeadRowArr[i][j] = type;
		}
	}
	for(var i = 0; i < this.columns; i++) {
		this.headColumnClickedArr[i] = type;
		for(var j = 0; j < this.rows; j++) {
			this.undoHeadColumnArr[i][j] = type;
		}
	}
}

//inits all internal undo well state array states with the type 'empty'
de.dkfz.signaling.webcellhts.PlateConfiguration.prototype.emptyUndoWellStates = function() {
	this.setAllUndoWellStates(this.cfg.CELL_TYPE.empty);
}

//inits all internal heading array states with the type 'empty'
de.dkfz.signaling.webcellhts.PlateConfiguration.prototype.emptyWellStates = function() {
	this.setAllWellStates(this.cfg.CELL_TYPE.empty);
}

//inits all internal wellStateArr array with the type 'empty'
de.dkfz.signaling.webcellhts.PlateConfiguration.prototype.emptyHeadingStates = function() {
	this.setAllHeadingStates(this.cfg.CELL_TYPE.empty);
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
										this.cellDimension, copiedCurrentCoordinate, 
										this.html5Wells[i][j], this.ctx);
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

//draw all the cells with the current type etc...
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


