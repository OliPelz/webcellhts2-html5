/*
**    Copyright (C) 2012 German Cancer Research Center
**                            
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
// - PositionCalculator
// -
// -   Description: This conventient class can calculate all necessary position related information in e.g.
// -   cells , headings, ids of cells for coordinates etc
// -   and other positions in a Wellplate
// -   Author: Oliver Pelz
// -   Version: 0.01
// -
// -   Parameter: the rows and columns number of your current well plate
//
// ---------------------------------------------------------------------------------------------------------------------
de.dkfz.signaling.webcellhts.PositionCalculator = function(rows, columns) {
	this.cfg = de.dkfz.signaling.webcellhts.Config;
	this.rows = rows;
	this.columns = columns;
	this.dimension = this.getCellDimension();
	
}
//this method calculates the canvas dimension by cell height and width
de.dkfz.signaling.webcellhts.PositionCalculator.prototype.getPlateDimension = function() {
	var cfg = this.cfg;
	var cellDimension = this.getCellDimension();
	var columns = this.columns;
	var rows = this.rows;
	var cellPadding = cfg.CELL_PADDING;
	//plus 1 because we have one extra row and column for the header
	var drawWidth = (columns + 1) * cellDimension.width + cellPadding.x * (columns + 1) + cellPadding.x; // every cell has one paddings, the most right one has "two"
	var drawHeight = (rows + 1) * cellDimension.height + cellPadding.y * (rows + 1) + cellPadding.y;
	return {width:drawWidth, height: drawHeight};
}
//this calculates the dimension (width and height) of a cell in the well
de.dkfz.signaling.webcellhts.PositionCalculator.prototype.getCellDimension = function() {
	var cfg = this.cfg;
	return cfg.CELL_DIMENSION;
}
//get the actual 'upper left coordinate' of the most upper left heading 'cell' {x,y}
de.dkfz.signaling.webcellhts.PositionCalculator.prototype.getActualUpperLeftHeadingStart = function() {
	var cfg = this.cfg;
	return {x:cfg.WELLPLATE_POS.x+cfg.CELL_PADDING.x ,
			y: cfg.WELLPLATE_POS.y+cfg.CELL_PADDING.y};
}
//get the actual 'upper left' corner coordinate of the most left upper cell of a wellplate {x,y}
//this does not include the heading, here we only consider 'active' cells such as A1,B1,C1 etc
de.dkfz.signaling.webcellhts.PositionCalculator.prototype.getActualUpperLeftCellStart = function() {
//!don't forget to add the padding
//and dont forget to add the space for the heading
	var cfg = this.cfg;
	var headingPos = this.getActualUpperLeftHeadingStart();
	//our heading cell has exactly the same dimension as a "normal" cell
	headingPos.x += this.dimension.width;  //calculate where the heading ends 
	headingPos.y += this.dimension.height;
	return {x: headingPos.x + cfg.CELL_PADDING.x ,
			y: headingPos.y + cfg.CELL_PADDING.y};
}
// this method is a very useful method for generating grid positions for coordinates {x,y} in a well
// it returns the 'array' typed indices as {x,y} tupels and those index-zero based
//e.g. the cell A1 would be returned as {1,1} (dont forget to count the cell "X")
de.dkfz.signaling.webcellhts.PositionCalculator.prototype.getGridIndexForCoordinate = function(curr_pos) {
	var cfg = this.cfg;
	var enum_type;
	var headingStart = this.getActualUpperLeftHeadingStart();
	var x_norm = curr_pos.x - headingStart.x;  //normalize the current position to the coordinates of the heading to zero
	var y_norm = curr_pos.y - headingStart.y;

	var x_number = -1;
	var x_rest = -1;
	if(x_norm >= 0 ) {  //we start our coordinate system system with zero based numbers
	//calculate the index coordinates in a zero based 'array'
		x_number = x_norm / (cfg.CELL_PADDING.x + this.dimension.width ); //get the index of the cell+padding
		x_rest = x_norm % (cfg.CELL_PADDING.x + this.dimension.width ); //get the rest
	}
	var y_number = -1;
	var y_rest = -1;
	if(y_norm >= 0 ) {
		y_number = y_norm / (cfg.CELL_PADDING.y + this.dimension.height ); //get the index
		y_rest = y_norm % (cfg.CELL_PADDING.y + this.dimension.height ); //get the rest
	};
	
	if( x_rest > this.dimension.width   ) {  //if our current mouse position is smaller or equals the cell dimension we are in a cell and not in the padding
		x_number = -1;
	}
	if( y_rest > this.dimension.height   ) {
		y_number = -1;
	}
	
	var x_num_return = parseInt(x_number);	//cut off the precision ...we only need the index
	var y_num_return = parseInt(y_number);
	
	//we cannot 'be' more than columns amount
	if(x_num_return > this.columns + 1 ) {
		x_num_return = -1;
	}
	if(y_num_return > this.rows + 1) {
		y_num_return = -1;
	}
	if(cfg.DEBUG_COORDS == true) { //debugging output ...only enabled if we have set the flag
		console.log("x_cell_norm: "+x_norm+" (head.x:"+headingStart.x
		+") y_cell_norm: "+y_norm+" (head.y:"+headingStart.y+")");
  		console.log("x_cell_raw : "+x_number+" y_cell_raw: "+y_number);
  		console.log("x_rest: "+x_rest+" y_rest: "+y_rest);
  		console.log("x_num_return: "+x_num_return+" y_num_return: "+y_num_return);
  	}
	return {x_cell : x_num_return, y_cell : y_num_return};
}
