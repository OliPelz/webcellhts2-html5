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
// - PlateEditor
// -
// -   Description: Draws a PlateEditor in pure JS
// -   Author: Oliver Pelz
// -   Version: 0.01
// -
// -   Parameter: container = id of canvas element (no query selector id)
//
// ---------------------------------------------------------------------------------------------------------------------

//Constructor
de.dkfz.signaling.webcellhts.PlateEditor = function(containerId) {
	    //init - construct important stuff
    	//constants
    	this.containerId = containerId;
    	this.plateFormatId = "plateFormatSelect";
    	this.currWellId = "currWell";
    	this.cfg = de.dkfz.signaling.webcellhts.Config;
    	//we use methods from this class
    	this.jsHelper = new de.dkfz.signaling.b110.JsHelper();
    	
    	//first check if our canvas element is available in the DOM
        if(! this.jsHelper.isElementInNode(this.containerId)) {
        	alert("div id undefined in DOM: "+containerId);
        	throw new Error("DivIdNotDefined");
        }
        if(! this.jsHelper.isElementInNode(this.plateFormatId)) {
        	alert("plateformat dropdown chooser id undefined in DOM: "+plateFormatId);
        	throw new Error("DivIdNotDefined");
        }
        this.canvas = document.getElementById(containerId);
        this.ctx = this.canvas.getContext('2d');
      	this.menueTools = new de.dkfz.signaling.webcellhts.MenueTools(this.ctx);
		this.plateConfig = new de.dkfz.signaling.webcellhts.PlateConfiguration(
								$("#"+this.plateFormatId).val(), this.ctx
							);
		this.currDrawTool = this.cfg.DRAW_TOOL.POINT;  // set the standard drawing tool to draw single points
        this._updateEventListeners();
        this._updateParameters();
    	//now draw everything
        this.plateConfig.drawAll();
        
		//var cell = new de.dkfz.signaling.webcellhts.Cell(1, 0, 0, 30, 50, this.cfg.CELL_TYPE.positive, this.ctx);
}


//this method should be run every time you update the parameters
//e.g. plateformat etc.
de.dkfz.signaling.webcellhts.PlateEditor.prototype._updateParameters = function() {
//every time we change a parameter we have to redraw the complete plate
	
}
// this method draws the complete PlateEditor with everything
de.dkfz.signaling.webcellhts.PlateEditor.prototype._redraw = function() {
    	//drawing a plate consists of several steps
    	// 
    	// 0. clear the current drawing plate area (this is not clearing the complete canvas)
    	// 1. draw the borders and the grid
    	// 2. draw the headings
    	// 3. draw the wells (cells)
    	 
    	// clear the plate
    	this.plateConfig.clearPlateDraw();
    	this.plateConfig.draw();
    	
    	
    	
    	//this.drawPlateShape();  //draws the grid and the headings
		
		//this.drawHeadings();
		//this.drawWellCells();
   	
}
//this method manages all the event listeners for the complete object
de.dkfz.signaling.webcellhts.PlateEditor.prototype._updateEventListeners = function() {
	var chosenWellType = this.menueTools.chosenWellType;
	var plateConfig = this.plateConfig;
	
	//define some enclosures to be accessed from within the method
		var startPoint;
		var endPoint;
		var ctx = this.ctx;
		var jsHelper = this.jsHelper;
		
		var cellRangeCoordsX = this.plateConfig.getPlateRangeCoordinates("x");
		var mouse_downed = false;
		var posCalculator = this.plateConfig.posCalculator;
		var startPoint = {};
		var cfg = this.cfg;
		var currDrawTool = this.currDrawTool;
		//this is for debugging
		$('#plateEditor').mousemove(function(event) {
	 			var my_start_x = event.clientX - event.target.offsetLeft;  //gets the point
  				var my_start_y = event.clientY - event.target.offsetTop;   //relative to the canvas
  				var cellIndex = posCalculator.getGridIndexForCoordinate({x:my_start_x,y:my_start_y});
  				console.log("x_cell: "+cellIndex.x_cell+" y_cell: "+cellIndex.y_cell);
  		});
		$('#plateEditor').mousedown(function(event) {
	 			var my_start_x = event.clientX - event.target.offsetLeft;  //gets the point
  				var my_start_y = event.clientY - event.target.offsetTop;   //relative to the canvas
  				startPoint = {x:my_start_x,y:my_start_y};
  				//this is doing the trick of drawing a line : add evetlistener of mouse
  				//movevent within our event listener so it will only be called while we already have clicked 'down'
  				mouse_downed = true;
  		});
  		$('#plateEditor').mouseup(function(event) {
  					if(!mouse_downed) {
  						return;
  					}
  					mouse_downed = false;
  					var my_end_x = event.clientX - event.target.offsetLeft;  //gets the point
  					var my_end_y = event.clientY - event.target.offsetTop;   //relative to the canvas
  					var current_endpoint = {x:my_end_x,y:my_end_y};
  					console.log("stop click: "+current_endpoint.x+" / "+current_endpoint.y);
  					jsHelper.drawLine(startPoint, current_endpoint, 1, "green", ctx);
  					var coordinates = jsHelper.getCoordinatesOfInterestForLine(startPoint, current_endpoint, cellRangeCoordsX);
  					//we have clicked a single point...AND we are using the POINT drawing tool...do single click things
  					//the rules for single click mode:
  					// 1. click in the X: delete the current plate
  					// 2. click on a header: mark the complete row/column
  					// 3. click on a cell: mark that cell
  					if(coordinates.length == 1 && currDrawTool == cfg.DRAW_TOOL.POINT) {
  						var coord = coordinates[0];
  						var cellIndex = posCalculator.getGridIndexForCoordinate({x:coord.x,y:coord.y});  						
  						//first check if we hit the X...delete the whole layout
  						if(cellIndex.x_cell == 0 && cellIndex.y_cell == 0) {
  							plateConfig.resetPlateLayoutAndRedraw();
  						}
  						//if we have a 'normal' cell
  						if(cellIndex.x_cell > 0 && cellIndex.y_cell > 0) {
  							plateConfig.setCellToTypeAndDraw(cellIndex.x_cell - 1 , cellIndex.y_cell - 1, chosenWellType);  //this is for testing
  						}
  					}
  					
  				//	var cellsOfInterest = jsHelper.getCellsForCoordinates(coordinates);
  				//console.log(point);
  				//var yPointCoordArr = this.jsHelper.getCellIndexOfInterestForLine(pointStart, pointStop);
  				//iterate through yPointCoordArr
  				//	 cellIndexId = getCellIDForCoordinate(x, yPointCoord)
  				//     PlateConfiguration.changeCell(cellIndexId, chosenColor);
  	    });
  	    
	
	

}

