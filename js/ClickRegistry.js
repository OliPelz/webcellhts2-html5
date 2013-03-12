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
// - ClickRegistry
// -
// -   Description: This class is for registering and managing clicks into a wellplate
// -   Author: Oliver Pelz
// -   Version: 0.01
// -
// -   Parameter: container = id of canvas element (no query selector id)
//
// ---------------------------------------------------------------------------------------------------------------------


de.dkfz.signaling.webcellhts.ClickRegistry = function(rows, columns) {	
		this.rows = rows;
		this.columns = columns;
		this.jsHelper = new de.dkfz.signaling.b110.JsHelper();
		this.cfg = de.dkfz.signaling.webcellhts.Config;
		//the data structures for keeping track of everthing
		this.currentWellStateArr = de.dkfz.signaling.b110.JsHelper.prototype.create3DArray(this.rows , this.columns ); 
		this.currentWellPointerArr = de.dkfz.signaling.b110.JsHelper.prototype.create2DArray(this.rows , this.columns );
		//init with type empty everything
		
		this.jsHelper.addTo3DArrayType(this.currentWellStateArr, this.cfg.CELL_TYPE.empty);
		this.jsHelper.fill2DArrayWithType(this.currentWellPointerArr, 0 );  //the array of array of array current pointer...for undo
		this.userInteractionCounter = 0;  // this counter stores information about the current number of user interactions (clicking of cell etc.)
		
		//set up some dictioniaries to store heading information and fill them with standard init stuff
		//we need those structs to store undo info: the state respresents the state the heading is in (activated=true, deactivated = false ), clickId(Arr): stores the userinteractioncounter for a specific cell
		this.xCellState = {state:this.cfg.HEAD_CELL_STATE.none, clickId: 0};
		this.rowStates = {stateArr: this.jsHelper.fill1DArrayWithType(new Array(this.rows),false), 
						  clickIdArr: this.jsHelper.fill1DArrayWithType(new Array(this.rows),0),
						  };	
		this.columnStates = {	stateArr: this.jsHelper.fill1DArrayWithType(new Array(this.columns),false), 
						  		clickIdArr: this.jsHelper.fill1DArrayWithType(new Array(this.columns),0),
						  	};	
}
//this is the main function if the use is clicking a Single cell...keeping track of undo etc
//does not draw or anything , just the logic behind keeping track and when to change a well type
de.dkfz.signaling.webcellhts.ClickRegistry.prototype.clickSingleCell = function(row, column, type) {
	//every user activity function must increase the userInteractionCounter
	this.userInteractionCounter++;
	var currentType= this.getCurrentCellType(row, column);
	if( type !=  currentType ) { //set a new cell
		this.addCurrentCellType(row, column, type);
	}else  {  //undo
		this.undoCurrentCellType(row, column, type);
	}
	return this.getCurrentCellType(row, column);
}
//set all cells (with undo information) ...ignores equal cells which means cells of same type
de.dkfz.signaling.webcellhts.ClickRegistry.prototype.setAllCells = function(type) {
	//setting all cells at once counts not as a user interaction
	for(var row = 0; row < this.rows; row++) {
		for(var column = 0; column < this.columns; column++) {
			//if(type !=  this.currentWellStateArr[row][column] ) {
			//change things around
				this.undoWellStateArr[row][column] = this.currentWellStateArr[row][column];
				this.currentWellStateArr[row][column] = type;
			//}
		}
	}	
}
//undos all cells ...keeps track of current information
de.dkfz.signaling.webcellhts.ClickRegistry.prototype.undoAllCells = function() {
	//setting all cells at once counts not as a user interaction
	for(var row = 0; row < this.rows; row++) {
		for(var column = 0; column < this.columns; column++) {
		//undo only if it is necessary
			//if(this.undoWellStateArr[row][column] != this.currentWellStateArr[row][column]) { //undo means changing current and undo state
				var tmpVal = this.undoWellStateArr[row][column];
				this.undoWellStateArr[row][column] = this.currentWellStateArr[row][column];
				this.currentWellStateArr[row][column] = tmpVal;
			//}
		}
	}	
}
//set all cells (with undo information) ...for a complete row
de.dkfz.signaling.webcellhts.ClickRegistry.prototype.setRowCells = function(rowIdx, type) {
	for(var column = 0; column < this.columns; column++) {
		this.addCurrentCellType(rowIdx, column, type);
	}
}
//undo all cells (with undo information) ...for a complete row
de.dkfz.signaling.webcellhts.ClickRegistry.prototype.undoRowCells = function(rowIdx, type) {
	for(var column = 0; column < this.columns; column++) {
		    this.undoCurrentCellType(rowIdx, column, type);
	}
}

//set all cells (with undo information) ...for a complete column
de.dkfz.signaling.webcellhts.ClickRegistry.prototype.setColumnCells = function(colIdx, type) {
	for(var row = 0; row < this.rows; row++) {
		this.addCurrentCellType(row, colIdx, type);
	}
}
de.dkfz.signaling.webcellhts.ClickRegistry.prototype.undoColumnCells = function(colIdx, type) {
	for(var row = 0; row < this.rows; row++) {
		this.undoCurrentCellType(row, colIdx, type);
	}
}


//this keeps track if we click the 'X' symbol
de.dkfz.signaling.webcellhts.ClickRegistry.prototype.clickXHeadState = function() {
//every user activity function must increase the userInteractionCounter
	this.userInteractionCounter++;
	//reset the button state anyways if the former click wasn't the delete button at all!
	if(this.userInteractionCounter != this.xCellState.clickId + 1) {
		this.xCellState.state = this.cfg.HEAD_CELL_STATE.none;
	}
	//now the rules:
	//1. change to delete state only change to true if we are in the deactivated state  (none)
	if(this.xCellState.state == this.cfg.HEAD_CELL_STATE.none ) {
		this.xCellState.state = this.cfg.HEAD_CELL_STATE.delete;
		this.xCellState.clickId = this.userInteractionCounter;  //set the click id to the current counter
	}//2. change to undo mode : this state only if we were activated before and the last immediate last click 
	//was the activation click (the undo functionality should only work if the last step RIGHT before was the activation step)
	else if(this.xCellState.state == this.cfg.HEAD_CELL_STATE.delete 
		&& this.userInteractionCounter == this.xCellState.clickId + 1) {
		this.xCellState.state = this.cfg.HEAD_CELL_STATE.undo; 
	}
	
	return this.xCellState.state;
}

//this keeps track if we click in the header row...for explanation of the algo see the method: clickXHeadState
de.dkfz.signaling.webcellhts.ClickRegistry.prototype.clickRowHeadState = function(rowIdx) {
//every user activity function must increase the userInteractionCounter
	this.userInteractionCounter++;
	if(this.userInteractionCounter != this.rowStates.clickIdArr[rowIdx] + 1) {
		this.rowStates.stateArr[rowIdx]  = this.cfg.HEAD_CELL_STATE.none;
	}
	if(this.rowStates.stateArr[rowIdx] == this.cfg.HEAD_CELL_STATE.none ) {
		this.rowStates.stateArr[rowIdx] = this.cfg.HEAD_CELL_STATE.delete;
		this.rowStates.clickIdArr[rowIdx] = this.userInteractionCounter;  //set the click id to the current counter
	}
	else if(this.rowStates.stateArr[rowIdx] == this.cfg.HEAD_CELL_STATE.delete 
		&& this.userInteractionCounter == this.rowStates.clickIdArr[rowIdx] + 1) {
		this.rowStates.stateArr[rowIdx] = this.cfg.HEAD_CELL_STATE.undo; 
	}
	return this.rowStates.stateArr[rowIdx];
}
de.dkfz.signaling.webcellhts.ClickRegistry.prototype.clickColHeadState = function(colIdx) {
//every user activity function must increase the userInteractionCounter
	this.userInteractionCounter++;
	if(this.userInteractionCounter != this.columnStates.clickIdArr[colIdx] + 1) {
		this.columnStates.stateArr[colIdx]  = this.cfg.HEAD_CELL_STATE.none;
	}
	if(this.columnStates.stateArr[colIdx] == this.cfg.HEAD_CELL_STATE.none ) {
		this.columnStates.stateArr[colIdx] = this.cfg.HEAD_CELL_STATE.delete;
		this.columnStates.clickIdArr[colIdx] = this.userInteractionCounter; 
	}
	else if(this.columnStates.stateArr[colIdx] == this.cfg.HEAD_CELL_STATE.delete 
		&& this.userInteractionCounter == this.columnStates.clickIdArr[colIdx] + 1) {
		this.columnStates.stateArr[colIdx] = this.cfg.HEAD_CELL_STATE.undo; 
	}
	return this.columnStates.stateArr[colIdx];
}


//this is the main function for getting a cell
de.dkfz.signaling.webcellhts.ClickRegistry.prototype.getCurrentCellType = function(row, column) {
	var currentPointer = this.currentWellPointerArr[row][column];
	var currentWell = this.currentWellStateArr[row][column][currentPointer];
	return currentWell;
}
//adding a cell to the history
de.dkfz.signaling.webcellhts.ClickRegistry.prototype.addCurrentCellType = function(row, column, type) {
	if(this.currentWellPointerArr[row][column] > this.currentWellStateArr[row][column].length - 1) {//avoid array out of bound
		this.currentWellStateArr[row][column].push(type);
		this.currentWellPointerArr[row][column] = this.currentWellPointerArr[row][column].length - 1; //update pointer to current
	}
	else {  //if we have undo something...overwrite new state
		this.currentWellStateArr[row][column][++this.currentWellPointerArr[row][column]] = type; //this is equal to push array
	}
}
//undoing the current celltype
de.dkfz.signaling.webcellhts.ClickRegistry.prototype.undoCurrentCellType = function(row, column, type) {
	do {	 //if we have found the same type try to go back in history until we have found anything different
		this.decCurrentCellTypePointer(row, column); 
		currType = this.getCurrentCellType(row, column);
		if(this.currentWellPointerArr[row][column] == 0) {
			break;
		}	
	}while( currType == type);
}

//undoing current pointed cell in history
de.dkfz.signaling.webcellhts.ClickRegistry.prototype.decCurrentCellTypePointer = function(row, column) {
	if(--this.currentWellPointerArr[row][column] < 0) {
		this.currentWellPointerArr[row][column] = 0;
	}
	return this.currentWellPointerArr[row][column];
}
//this is the main function for getting a cell
de.dkfz.signaling.webcellhts.ClickRegistry.prototype.getXCellState = function() {
	return this.xCellState.state;
}

