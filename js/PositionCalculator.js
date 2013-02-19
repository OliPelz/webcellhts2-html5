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
	//we only want to calculate the following thing one time because it is calculation 
	//overhead to do this for every funtion call later :
	//the percentage of a cells length (plus the linestrenght) and width in relationship to the length+width plus the cells padding
	var tmpX = (this.dimension.width + this.cfg.CELL_LINESTRENGTH) / (this.dimension.width +  this.cfg.CELL_PADDING.x + this.cfg.CELL_LINESTRENGTH);
	var tmpY = (this.dimension.height + this.cfg.CELL_LINESTRENGTH)/ (this.dimension.height +  this.cfg.CELL_PADDING.y + this.cfg.CELL_LINESTRENGTH);
	this.cellPercPadding = { width: tmpX, height: tmpY };
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
	/*var rows = this.rows;
	var columns = this.columns;
	rows++;     	//plus one because one extra column for the header
	columns++;		 //plus one because one extra row for the header
	var totalHeight = cfg.WELLPLATE_HEIGHT;
	var totalWidth = cfg.WELLPLATE_WIDTH;
	var plateLineStrength = cfg.WELLPLATE_LINESTRENGTH;
	var cellLineStrength = cfg.CELL_LINESTRENGTH;
	var cellPadding = cfg.CELL_PADDING;
	//get the actual possible drawing length (do not draw within cell borders, lines etc.)
//	var drawWidth = totalWidth - plateLineStrength * 2 - (cellLineStrength * 2) * columns;
//	var drawHeight = totalHeight - plateLineStrength * 2 - (cellLineStrength * 2) * rows;
	//we forgot to remove the padding between cells
	var drawWidth = totalWidth;
	var drawHeight = totalHeight;
	drawWidth -= cellPadding.x * columns + cellPadding.x ; // every cell has one paddings, the most right one has "two"
	drawHeight -= cellPadding.y * rows + cellPadding.y;

	var x = drawWidth / columns; 
	var y = drawHeight / rows; 
	return {width:Math.floor(x), height:Math.floor(y)};*/
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
	var x_norm = curr_pos.x - headingStart.x;  //normalize the current position to the coordinates of the heading
	var y_norm = curr_pos.y - headingStart.y;
	console.log("head: "+headingStart.x+" "+headingStart.y);
	console.log("dimens: "+this.dimension.width+" "+this.dimension.height);
	console.log("----");
	console.log("real: "+curr_pos.x+" "+curr_pos.y);
	console.log("norm: "+x_norm+" "+y_norm);
	console.log("----");
	console.log("----");

	var x_number = -1;
	if(x_norm > 0 ) { 
	//calculate the index coordinates in a zero based 'array'
		x_number = x_norm / (cfg.CELL_PADDING.x + this.dimension.width );
	}
	var y_number = -1;
	if(y_norm > 0 ) {
		y_number = y_norm / (cfg.CELL_PADDING.y + this.dimension.height );
	};
	
	if( (x_number % 1) > this.cellPercPadding.width ) { //modulo one gives only the decimal places of a number so we can compare them
		x_number = -1;
	}
	if( (y_number % 1) > this.cellPercPadding.height ) {
		y_number = -1;
	}
	var x_num_return = parseInt(x_number);
	var y_num_return = parseInt(y_number);
	//we cannot 'be' more than columns amount
	if(x_num_return > this.columns) {
		x_num_return = -1;
	}
	if(y_num_return > this.rows) {
		y_num_return = -1;
	}
	
	
	return {x_cell : x_num_return, y_cell : y_num_return};
}
