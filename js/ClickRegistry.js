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
		this.currentWellStateArr = de.dkfz.signaling.b110.JsHelper.prototype.create2DArray(this.rows , this.columns ); //plus one because we also keep track of clicks into the heading row and column
		this.undoWellStateArr = de.dkfz.signaling.b110.JsHelper.prototype.create2DArray(this.rows , this.columns );
		//init with type empty everything
		this.jsHelper.fill2DArrayWithType(this.currentWellStateArr, this.cfg.CELL_TYPE.empty);
		this.jsHelper.fill2DArrayWithType(this.undoWellStateArr, this.cfg.CELL_TYPE.empty );  //we have to set this differently, because undo arr must be different to currentarr in order that our algo works in the beginning
		this.userInteractionCounter = 0;  // this counter stores information about the current number of user interactions (clicking of cell etc.)
		//set up some dictioniaries to store heading information and fill them with standard init stuff
		//we need those structs to store undo info: the state respresents the state the heading is in (activated=true, deactivated = false ), clickId(Arr): stores the userinteractioncounter for a specific cell
		var rowTypeUndoArr = de.dkfz.signaling.b110.JsHelper.prototype.create2DArray(this.rows , this.columns );
		this.xCellState = {state:this.cfg.HEAD_CELL_STATE.none, clickId: 0};
		this.rowStates = {stateArr: this.jsHelper.fill1DArrayWithType(new Array(this.rows),false), 
						  clickIdArr: this.jsHelper.fill1DArrayWithType(new Array(this.rows),0),
						  rowTypeUndoArr: this.jsHelper.fill2DArrayWithType(rowTypeUndoArr, this.cfg.CELL_TYPE.empty )
						  };
		this.columnStates = {stateArr: this.jsHelper.fill1DArrayWithType(new Array(this.columns),false), 
						  clickIdArr: this.jsHelper.fill1DArrayWithType(new Array(this.columns),0)};
		//fill content of arrays
		
}
//this is the main function if the use is clicking a Single cell...keeping track of undo etc
//does not draw or anything , just the logic behind keeping track and when to change a well type
de.dkfz.signaling.webcellhts.ClickRegistry.prototype.clickSingleCell = function(row, column, type) {
	//every user activity function must increase the userInteractionCounter
	this.userInteractionCounter++;
	//don't do anything if we do not get any new information here
	if(type !=  this.currentWellStateArr[row][column] ) {
		//&& this.undoWellStateArr[row][column] != this.currentWellStateArr[row][column]) {//if we have clicked
		//change things around 
		this.undoWellStateArr[row][column] = this.currentWellStateArr[row][column];
		this.currentWellStateArr[row][column] = type;
		//undo only if the type has changed but only if we have clicked the same well again
	}else if(this.undoWellStateArr[row][column] != this.currentWellStateArr[row][column]) {
		var tmpVal = this.undoWellStateArr[row][column];  //undo means change current and undo information
		this.undoWellStateArr[row][column] = this.currentWellStateArr[row][column];
		this.currentWellStateArr[row][column] = tmpVal;
	}
	return this.currentWellStateArr[row][column];
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
			this.rowStates.rowTypeUndoArr[rowIdx][column] = this.currentWellStateArr[rowIdx][column];
			this.currentWellStateArr[rowIdx][column] = type;
	}
}
//undo all cells (with undo information) ...for a complete row
de.dkfz.signaling.webcellhts.ClickRegistry.prototype.undoRowCells = function(rowIdx) {
	for(var column = 0; column < this.columns; column++) {
		//change things around
		var tmpVal = this.rowStates.rowTypeUndoArr[rowIdx][column];
		this.currentWellStateArr[rowIdx][column] = tmpVal;
	}
	//undo array must be reset: this is a trick
	this.jsHelper.fill1DArrayWithType(this.rowStates.rowTypeUndoArr[rowIdx], this.cfg.CELL_TYPE.empty );
}

//set all cells (with undo information) ...for a complete row
de.dkfz.signaling.webcellhts.ClickRegistry.prototype.setColumnCells = function(colIdx, type) {
	for(var row = 0; row < this.rows; row++) {
		//change things around
		this.undoWellStateArr[row][colIdx] = this.currentWellStateArr[row][colIdx];
		this.currentWellStateArr[row][colIdx] = type;
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

//this keeps track if we click in the header row...for explanation og the algo see the method: clickXHeadState
de.dkfz.signaling.webcellhts.ClickRegistry.prototype.clickRowHeadState = function(rowIdx) {
//every user activity function must increase the userInteractionCounter
	this.userInteractionCounter++;
	//this.rowStates.stateArr[rowIdx]  this.rowStates.clickIdArr[rowIdx]
	//reset the button state anyways if the former click wasn't the same button at all!
	if(this.userInteractionCounter != this.rowStates.clickIdArr[rowIdx] + 1) {
		this.rowStates.stateArr[rowIdx]  = this.cfg.HEAD_CELL_STATE.none;
	}
	if(this.rowStates.stateArr[rowIdx] == this.cfg.HEAD_CELL_STATE.none ) {
		this.rowStates.stateArr[rowIdx] = this.cfg.HEAD_CELL_STATE.delete;
		this.rowStates.clickIdArr[rowIdx] = this.userInteractionCounter;  //set the click id to the current counter
	}//2. change to undo mode : this state only if we were activated before and the last immediate last click 
	//was the activation click (the undo functionality should only work if the last step RIGHT before was the activation step)
	else if(this.rowStates.stateArr[rowIdx] == this.cfg.HEAD_CELL_STATE.delete 
		&& this.userInteractionCounter == this.rowStates.clickIdArr[rowIdx] + 1) {
		this.rowStates.stateArr[rowIdx] = this.cfg.HEAD_CELL_STATE.undo; 
	}
	return this.rowStates.stateArr[rowIdx];
}


//this is the main function for getting a cell
de.dkfz.signaling.webcellhts.ClickRegistry.prototype.getCurrentCellType = function(row, column) {
	return this.currentWellStateArr[row][column];
}
//this is the main function for getting a cell
de.dkfz.signaling.webcellhts.ClickRegistry.prototype.getUndoCellType = function(row, column) {
	return this.undoWellStateArr[row][column];
}
//this is the main function for getting a cell
de.dkfz.signaling.webcellhts.ClickRegistry.prototype.getXCellState = function() {
	return this.xCellState.state;
}

