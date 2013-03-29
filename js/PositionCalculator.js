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
//this method normalizes canvas coordinates to cell coordinates (using the heading coordinates as border)
de.dkfz.signaling.webcellhts.PositionCalculator.prototype.normalizeCoordinates = function(coordinate) {
	//create normalized copys of points
	var headingStart = this.getActualUpperLeftHeadingStart();
	var coord_n  = {x:coordinate.x - headingStart.x, y: coordinate.y - headingStart.y };
	return coord_n;
}
//this method un-normalizes cell coordinates back to canvas coordinates (using the heading coordinates as border)
de.dkfz.signaling.webcellhts.PositionCalculator.prototype.unnormalizeCoordinates = function(coordinate) {
	//create normalized copys of points
	var headingStart = this.getActualUpperLeftHeadingStart();
	var coord_n  = {x:coordinate.x + headingStart.x, y: coordinate.y + headingStart.y };
	return coord_n;
}


//this method gets the x,y coordinates of marked cells when drawing a line
//points are unnormalized
de.dkfz.signaling.webcellhts.PositionCalculator.prototype.getCoordinatesForLine = function(startCoord, endCoord) {
	var coord_obj = this._getCellBordersForLine( startCoord, endCoord);
	this._getYCoordAndCellIdxForXCoordArr(startCoord, endCoord, coord_obj);//result is an array of obj: {x_idx, x_coords, y_idx, y_coords, y_coords_org} all coords are normalized
	return coord_obj;
}
//including the headign cells
de.dkfz.signaling.webcellhts.PositionCalculator.prototype.isCoordinateInPlate = function(coord) {
	var startCoord = this.normalizeCoordinates(coord);
	var dim = this.getPlateDimension();
	if(startCoord.x < (this.dimension.width + this.cfg.CELL_PADDING.x) || startCoord.x > dim.width) {//check for out-of--range
		return false;
	}
	if(startCoord.y < (this.dimension.height + this.cfg.CELL_PADDING.y ) || startCoord.y > dim.heigth) {
		return false;
	}
	return true;
}
de.dkfz.signaling.webcellhts.PositionCalculator.prototype.singleCellFromLine = function(startCoord) {

	if(! this.isCoordinateInPlate(startCoord) ) {
		return {row:-1,cell:-1};
	}
	var norm_coords = this.normalizeCoordinates(startCoord);
	var index_coords = this.getGridIndexForCoordinate(norm_coords);
	return { x:index_coords.x_cell - 1 , y:index_coords.y_cell - 1 };
}
de.dkfz.signaling.webcellhts.PositionCalculator.prototype.rect2Cells = function(startCoord, endCoord) {
	if(startCoord.x == endCoord.x && startCoord.y == endCoord.y) {
		return new Array();//dont draw anything
	}
	var cfg = this.cfg;
	var abs_cell_dim_x = (cfg.CELL_PADDING.x + this.dimension.width ); //absolute x-dimension of a cell
	var abs_cell_dim_y = (cfg.CELL_PADDING.x + this.dimension.height ); //absolute x-dimension of a cell
	
	var startCoord_n = this.normalizeCoordinates(startCoord);
	var endCoord_n = this.normalizeCoordinates(endCoord);
	
	var x1_idx = parseInt(startCoord_n.x / abs_cell_dim_x);
	var x2_idx = parseInt(endCoord_n.x / abs_cell_dim_x);
	var y1_idx = parseInt(startCoord_n.y / abs_cell_dim_y);
	var y2_idx = parseInt(endCoord_n.y / abs_cell_dim_y);
	
	var returnArr = new Array();
	for(var i = x1_idx; i <= x2_idx; i++ ) {
		 for(var j = y1_idx; j <= y2_idx; j++ ) {
		 	returnArr.push({column:i - 1, row:j - 1 });
		 }
	}
	return returnArr;
}

de.dkfz.signaling.webcellhts.PositionCalculator.prototype.line2Cells = function(startCoord, endCoord) {
	var coord_obj = this.line2HorizCells(startCoord, endCoord);
	var temp_objs = this.line2VerticalCells(startCoord, endCoord);
	for(var i = 0; i < temp_objs.cell_idx_arr.length; i++) {
		coord_obj.cell_idx_arr.push(temp_objs.cell_idx_arr[i]);  //append all , merge our two objs
	}
	for(var i = 0; i < temp_objs.coord_arr.length; i++) {
		coord_obj.coord_arr.push(temp_objs.coord_arr[i]);  //append all , merge our two objs
	}
	return coord_obj;
}


de.dkfz.signaling.webcellhts.PositionCalculator.prototype.line2HorizCells = function(startCoord, endCoord) {
	if(startCoord.x == endCoord.x && startCoord.y == endCoord.y) {
		return {coord_arr:new Array(), cell_idx_arr:new Array()};//dont draw anything
	}
	if(! this.isCoordinateInPlate(startCoord) || !this.isCoordinateInPlate(endCoord)) {
		return {coord_arr:new Array(), cell_idx_arr:new Array()};
	}
	
	var cfg = this.cfg;
	var abs_cell_dim_x = (cfg.CELL_PADDING.x + this.dimension.width ); //absolute x-dimension of a cell
	var abs_cell_dim_y = (cfg.CELL_PADDING.x + this.dimension.height ); //absolute x-dimension of a cell
		
	var startCoord_n = this.normalizeCoordinates(startCoord);
	var endCoord_n = this.normalizeCoordinates(endCoord);
	//always go from left to right on x-axis, makes the algo much easier to implement
	if(startCoord_n.x > endCoord_n.x) {
		var tmp = startCoord_n; startCoord_n = endCoord_n; endCoord_n = tmp;
	}
	var x1 = startCoord_n.x;
	var x2 = endCoord_n.x;
	var y1 = startCoord_n.y;
	var y2 = endCoord_n.y;
	
	var dx = x2 - x1; 
	var sx = (dx < 0) ? -abs_cell_dim_x : abs_cell_dim_x;  //the 'stepwise' in x direction is the cell length
	var dy = y2 - y1; 
	var sy = (dy < 0) ? -abs_cell_dim_y : abs_cell_dim_y;
	//for all crossed horizontal points
	var m = dy / dx; 
	var b = y1 - m * x1;
	var coord_arr = {};
	var cell_idx_arr = {};
	do {
		var x1_cell_idx = parseInt(x1 / abs_cell_dim_x);
		var x1_rest = x1 % abs_cell_dim_x;
		if(x1_rest <= this.dimension.width) { //if we are not in between two cells
			x1 = abs_cell_dim_x + (x1_cell_idx - 1) * abs_cell_dim_x ; //x-startcoord (left border) of current cell
			var cell_x_end = x1 + this.dimension.width; //x-end coordinate (right border)of current cell
			y1 = Math.round(m*x1 + b);
			y2 = Math.round(m*cell_x_end + b);
			
			var y1_idx = parseInt(y1 / abs_cell_dim_y);
			var y1_rest = y1 % abs_cell_dim_y;
			
			var y2_idx = parseInt(y2 / abs_cell_dim_y);
			var y2_rest = y2 % abs_cell_dim_y;
			
			if(x1 >= startCoord_n.x && x1 <= endCoord_n.x) {  //take this point only if within the borders of the drawn line
				coord_arr[""+x1+"_"+y1] = 1;  //make uniq: coordinates are mainly for debugging
				if(y1_rest <= this.dimension.height //if we are in between cells border
					&& x1_cell_idx <= this.columns  // and if our index is in between possible cell index
					&& y1_idx <= this.rows) {  
						cell_idx_arr[""+x1_cell_idx+"_"+y1_idx] = 1;
				}
			}
			if(cell_x_end >= startCoord_n.x && cell_x_end <= endCoord_n.x) {
				coord_arr[""+cell_x_end+"_"+y2] = 1;
				if(y2_rest <= this.dimension.height
					&& x1_cell_idx <= this.columns  
					&& y2_idx <= this.rows) {  
					cell_idx_arr[""+x1_cell_idx+"_"+y2_idx] = 1; //make uniq
				}
			}
			
		}
		x1 += sx;
	}while(x1 <= x2)
	
	//make real return values out of uniq arr
	var retr_coords = new Array();
	var idx_arr     = new Array();
	
	for(var coord in coord_arr) {
		var tmp_arr = coord.split("_");
		retr_coords.push(this.unnormalizeCoordinates({x:parseInt(tmp_arr[0]), y:parseInt(tmp_arr[1])}));
	}
	for(var idx in cell_idx_arr) {
		var tmp_arr = idx.split("_");
		idx_arr.push({column:parseInt(tmp_arr[0]) - 1, row:parseInt(tmp_arr[1]) - 1 }); //minus one is important because we have 0 based values here
	}
	
	return {coord_arr:retr_coords, cell_idx_arr:idx_arr};
}
de.dkfz.signaling.webcellhts.PositionCalculator.prototype.line2VerticalCells = function(startCoord, endCoord) {
	if(startCoord.x == endCoord.x && startCoord.y == endCoord.y) {
		return {coord_arr:new Array(), cell_idx_arr:new Array()};//dont draw anything
	}
	if(! this.isCoordinateInPlate(startCoord) || !this.isCoordinateInPlate(endCoord)) {
		return {coord_arr:new Array(), cell_idx_arr:new Array()};
	}
	
	var cfg = this.cfg;
	var abs_cell_dim_x = (cfg.CELL_PADDING.x + this.dimension.width ); //absolute x-dimension of a cell
	var abs_cell_dim_y = (cfg.CELL_PADDING.x + this.dimension.height ); //absolute x-dimension of a cell
		
	var startCoord_n = this.normalizeCoordinates(startCoord);
	var endCoord_n = this.normalizeCoordinates(endCoord);
	//always go from left to right on x-axis, makes the algo much easier to implement
	if(startCoord_n.y > endCoord_n.y) {
		var tmp = startCoord_n; startCoord_n = endCoord_n; endCoord_n = tmp;
	}
	var x1 = startCoord_n.x;
	var x2 = endCoord_n.x;
	var y1 = startCoord_n.y;
	var y2 = endCoord_n.y;
	
	var dx = x2 - x1; 
	var sx = (dx < 0) ? -abs_cell_dim_x : abs_cell_dim_x;  //the 'stepwise' in x direction is the cell length
	var dy = y2 - y1; 
	var sy = (dy < 0) ? -abs_cell_dim_y : abs_cell_dim_y;
	//for all crossed horizontal points
	var m = dx / dy; 
	var b = x1 - m * y1;
	var coord_arr = {};
	var cell_idx_arr = {};
	do {
		var y_cell_idx = parseInt(y1 / abs_cell_dim_y);
		var y1_rest = y1 % abs_cell_dim_y;
		if(y1_rest <= this.dimension.height) { //if we are not in between two cells
			y1 = abs_cell_dim_y + (y_cell_idx - 1) * abs_cell_dim_y ; //x-startcoord (left border) of current cell
			var cell_y_end = y1 + this.dimension.height; //y-end coordinate (right border)of current cell
			x1 = Math.round(m*y1 + b);
			x2 = Math.round(m*cell_y_end + b);
			
			var x1_idx = parseInt(x1 / abs_cell_dim_x);
			var x1_rest = x1 % abs_cell_dim_x;
			
			var x2_idx = parseInt(x2 / abs_cell_dim_x);
			var x2_rest = x2 % abs_cell_dim_x;
			
			if(y1 >= startCoord_n.y && y1 <= endCoord_n.y) {  //take this point only if within the borders of the drawn line
				coord_arr[""+x1+"_"+y1] = 1;  //make uniq: coordinates are mainly for debugging
				if(x1_rest <= this.dimension.width //if we are in between cells border
					&& y_cell_idx <= this.rows  // and if our index is in between possible cell index
					&& x1_idx <= this.columns) {  
						cell_idx_arr[""+x1_idx+"_"+y_cell_idx] = 1;
				}
			}
			if(cell_y_end >= startCoord_n.y && cell_y_end <= endCoord_n.y) {
				coord_arr[""+x2+"_"+cell_y_end] = 1;
				if(x2_rest <= this.dimension.width
					&& y_cell_idx <= this.rows  
					&& x2_idx <= this.columns) {  
					cell_idx_arr[""+x2_idx+"_"+y_cell_idx] = 1; //make uniq
				}
			}
			
		}
		y1 += sy;
	}while(y1 <= y2)
	
	//make real return values out of uniq arr
	var retr_coords = new Array();
	var idx_arr     = new Array();
	
	for(var coord in coord_arr) {
		var tmp_arr = coord.split("_");
		retr_coords.push(this.unnormalizeCoordinates({x:parseInt(tmp_arr[0]), y:parseInt(tmp_arr[1])}));
	}
	for(var idx in cell_idx_arr) {
		var tmp_arr = idx.split("_");
		idx_arr.push({column:parseInt(tmp_arr[0]) - 1, row:parseInt(tmp_arr[1]) - 1 });
	}
	
	return {coord_arr:retr_coords, cell_idx_arr:idx_arr};
}

//get all the grid x-coordinate borders for a line defined by start and endcoordinate
de.dkfz.signaling.webcellhts.PositionCalculator.prototype._getCellBordersForLine = function(startCoord, endCoord) {
	if(startCoord.x == endCoord.x) {
		return;
	}
	var cfg = this.cfg;
	
	//always go from left to right on x-axis, makes the algo much easier to implement
	if(startCoord.x > endCoord.x) {
		var tmp = startCoord; startCoord = endCoord; endCoord = tmp;
	}
		
	var abs_cell_dim = (cfg.CELL_PADDING.x + this.dimension.width ); //absolute x-dimension of a cell
	var n_startCoord = this.normalizeCoordinates(startCoord);
	var n_endCoord = this.normalizeCoordinates(endCoord);
	
	var x_start_idx = this.getGridIndexForCoordinate(n_startCoord); //get the index of cell this line-start is in
	var x_end_idx = this.getGridIndexForCoordinate(n_endCoord);
	
	var x_clk_start = n_startCoord.x; 
	var x_clk_end = n_endCoord.x;
	
	var return_arr = new Array();
	for(var i = x_start_idx.x_cell; i <= x_end_idx.x_cell; i++) {
		if(i > this.columns  || i < 0) {  //if we are out of bounds
			continue;
		}
		var cell_x_start = abs_cell_dim + (i - 1) * abs_cell_dim ; //x-startcoord of current cell
		var cell_x_end = cell_x_start + this.dimension.width; //x-end coordinate of current cell
		var tmp_arr = new Array();
		if(cell_x_start >= x_clk_start && cell_x_start <= x_clk_end ) { //if the cell border is in the range of the drawn line
			tmp_arr.push(cell_x_start);
		}
		if(cell_x_end >= x_clk_start && cell_x_end <= x_clk_end ) {
			tmp_arr.push(cell_x_end);
		}
		return_arr.push({x_idx:i, x_coords: tmp_arr});
		
	}
	return return_arr;
}
//this uses bresenheim...gets y-coords for array of x coordinates by key "arr_idx".  appends y_coords
//this algo also calculates the y-index of cells
de.dkfz.signaling.webcellhts.PositionCalculator.prototype._getYCoordAndCellIdxForXCoordArr = function(startP_org, endP_org, return_arr) {
	var startP = this.normalizeCoordinates(startP_org);
	var endP = this.normalizeCoordinates(endP_org);
	
	//always go from left to right on x-axis, makes the algo much easier to implement
	if(startP.x > endP.x) {
		var tmp = startP; startP = endP; endP = tmp;
	}
	var dx = endP.x - startP.x; 
	var dy = endP.y - startP.y;  //coordinate system is upway down
	var m = dy / dx;
	
	var b = startP.y - m * startP.x;
	
	if(this.cfg.DEBUG_LINEDRAW) {
		console.log("dx : "+dx+" dy: "+dy+" m: "+m+" b:"+b);
	}
	
	for(var i = 0; i < return_arr.length; i++) {
		var el = return_arr[i];
		var y_coords_arr = new Array();
		var y_idx_arr = new Array();
		var y_coords_org_arr = new Array(); //the unnormalized "original" canvas coordinates
		var x_coords_org_arr = new Array();
		for(j = 0; j < el.x_coords.length; j++) {
			var coord = el.x_coords[j];
			var y = parseInt(Math.round(m * coord + b));
			var pos = {x:el.x_coords[j], y: y};
			var c_org = this.unnormalizeCoordinates(pos);
			y_coords_arr.push(y);
			y_coords_org_arr.push(c_org.y);
			x_coords_org_arr.push(c_org.x);
			//now calc the y idx
			//make a fake pos to calculate only the y part of the idx
			
			var idx = this.getGridIndexForCoordinate(pos);
			if(idx.y_cell < 0 || idx.y_cell > this.rows ) { //if we are out of bounds
				continue;
			}
			
			y_idx_arr.push(idx.y_cell);
		}
		//add all the useful information
		el.y_coords = y_coords_arr; 
		el.y_coords_org = y_coords_org_arr;
		el.x_coords_org = x_coords_org_arr;
		el.y_idx = y_idx_arr;
		
	}
}
//make a convenient array of coordinates for drawing
de.dkfz.signaling.webcellhts.PositionCalculator.prototype.coordObjToCoordinates = function(coord_obj) {
	var return_coords_n = new Array(); //contains normalized y coodrinates, is unique, contains normalized coordinates
	var unique_dict = new Array(); //will force uniquness
	for(var i = 0; i < coord_obj.length; i++) {
		var el = coord_obj[i];
		for(j = 0; j < el.y_idx.length; j++) {
			if(el.x_idx < 1 || el.y_idx[j] < 0 ) {
				continue;
			}
			var hsh_key = el.x_idx+"_"+el.y_idx[j];
			if(unique_dict[hsh_key] != 1 ) {
				unique_dict[hsh_key] = 1;
				return_coords_n.push({column:el.x_idx - 1, row:el.y_idx[j] - 1 });
				
			}
		}
	}
	return return_coords_n;
}

// this method is a very useful method for generating grid positions for coordinates {x,y} in a well
// it returns the 'array' typed indices as {x,y} tupels and those index-zero based
//e.g. the cell A1 would be returned as {1,1} (dont forget to count the cell "X")
//this is for normalized coordinates (starting at 0)
de.dkfz.signaling.webcellhts.PositionCalculator.prototype.getGridIndexForCoordinate = function(curr_pos) {
	var cfg = this.cfg;
	var enum_type;

	var x_number = -1;
	var x_rest = -1;
	
	var x_norm = curr_pos.x;  //the normalization part one has to take care of before starting this sub
	var y_norm = curr_pos.y;
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
		var headingStart = this.getActualUpperLeftHeadingStart();
		console.log("x_cell_norm: "+x_norm+" (head.x:"+headingStart.x
		+") y_cell_norm: "+y_norm+" (head.y:"+headingStart.y+")");
  		console.log("x_cell_raw : "+x_number+" y_cell_raw: "+y_number);
  		console.log("x_rest: "+x_rest+" y_rest: "+y_rest);
  		console.log("x_num_return: "+x_num_return+" y_num_return: "+y_num_return);
  	}
	return {x_cell : x_num_return, y_cell : y_num_return};
}
