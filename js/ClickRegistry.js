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
		this.currentWellStateArr = de.dkfz.signaling.b110.JsHelper.prototype.create2DArray(this.rows + 1, this.columns + 1); //plus one because we also keep track of clicks into the heading row and column
		this.undoWellStateArr = de.dkfz.signaling.b110.JsHelper.prototype.create2DArray(this.rows + 1, this.columns + 1);
		//init with type empty everything
		this.setArrayWithType(this.currentWellStateArr, this.cfg.CELL_TYPE.empty);
		this.setArrayWithType(this.undoWellStateArr, this.cfg.CELL_TYPE.empty );
		
}
//this is the main function for clicking a cell...keeping track of undo etc
de.dkfz.signaling.webcellhts.PlateEditor.prototype.clickCurrentCell = function(row, column, type) {
	//don't do anything if we do not get any new information here
	if(type !=  this.currentWellStateArr[row][column] 
		&& this.undoWellStateArr[row][column] != this.currentWellStateArr[row][column]) {
		//change things around
		this.undoWellStateArr[row][column] = this.currentWellStateArr[row][column];
		this.currentWellStateArr[row][column] = type;
	}
}
//this is the main function for getting a cell
de.dkfz.signaling.webcellhts.PlateEditor.prototype.getCurrentCell = function(row, column) {
	return this.currentWellStateArr[row][column];
}


//set a complete function with type
de.dkfz.signaling.webcellhts.PlateConfiguration.prototype.setArrayWithType = function(arr, type) {
	for(var i = 0; i < this.rows; i++) {
		for(var j = 0; j < this.columns; j++) {
			arr[i][j] = type;
		}
	}
}