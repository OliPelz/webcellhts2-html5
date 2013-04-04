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
de.dkfz.signaling.webcellhts.PlateEditor = function(containerId, overlayContainerId) {
	    //init - construct important stuff
    	//constants
    	this.containerId = containerId;
    	this.overlayId = overlayContainerId;
    	this.plateFormatId = "plateFormatSelect";
    	this.currWellId = "currWell";
    	this.cfg = de.dkfz.signaling.webcellhts.Config;
    	//we use methods from this class
    	this.jsHelper = new de.dkfz.signaling.b110.JsHelper();
    	
    	//first check if our canvas element is available in the DOM
        if(! this.jsHelper.isElementInNode(this.containerId)) {
        	alert("canvas id undefined in DOM: "+containerId);
        	throw new Error("CanvasIdNotDefined");
        }
        if(! this.jsHelper.isElementInNode(this.plateFormatId)) {
        	alert("plateformat dropdown chooser id undefined in DOM: "+plateFormatId);
        	throw new Error("plateFormatChooserNotDefined");
        }
         if(! this.jsHelper.isElementInNode(this.overlayId)) {
        	alert("canvas overlay id undefined in DOM: "+this.overlayId);
        	throw new Error("OverlayCanvasIdNotDefined");
        }
        this.canvas = document.getElementById(containerId);
        this.ctx = this.canvas.getContext('2d'); 
        this.overlay_canvas = document.getElementById(overlayContainerId);
        this.overlay_ctx = this.overlay_canvas.getContext('2d'); 
        //draw a border
        	this.jsHelper.strokeRectangle("black", 1
									,  {width: this.canvas.width, height: this.canvas.height }
									, {x: 0 , y: 0}
									, this.ctx);
		this.plateConfig = new de.dkfz.signaling.webcellhts.PlateConfiguration(
								$("#"+this.plateFormatId).val(), this.ctx
							);
		this.currDrawTool = this.cfg.DRAW_TOOL.POINT;  // set the standard drawing tool to draw single points
        this._updateEventListeners();
        this._updateParameters();
    	//now draw everything
        this.plateConfig.drawAll();
	
		if( this.cfg.DEBUG_COORDS == true ) {
			draw_grid(this.canvas);
			draw_dots_with_labels(0, 0, this.ctx);
			draw_dots_with_labels(50, 50, this.ctx);
			for(var i = 0; i < this.plateConfig.html5Wells.length; i++) {
				for(var j = 0; j < this.plateConfig.html5Wells[i].length; j++) {
					var pos = this.plateConfig.html5Wells[i][j].drawPosition;
					draw_dots_with_labels_smaller(pos.x, pos.y, this.ctx);
			
				}
			}
		}
		       
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
//this method processes single clicks into the header (row or column)
//returns true if a click in the header occured, false otherwise
de.dkfz.signaling.webcellhts.PlateEditor.prototype.clickIntoHeader = function(cellIndex, cfg, plateConfig) {
//we have clicked a single point...AND we are using the POINT drawing tool...do single click things
  					//the rules for single click mode:
  					// 1. click in the X: delete the current plate
  					// 2. click on a header: mark/unmark the complete row/column
  					// 3. click on a cell: mark/unmark that cell
	//first check if we hit the X...delete the whole layout
  	if(cellIndex.x_cell == 0 && cellIndex.y_cell == 0) {
  		plateConfig.resetPlateLayoutForUndo();
  		return true;
  	}
  	//if we have clicked the heading row
  	else if(cellIndex.x_cell == 0 && cellIndex.y_cell > 0) {
  		plateConfig.setRowToTypeAndDraw(cellIndex.y_cell - 1, cfg.CURRENT_SELECTED_CELL_TYPE);
  		return true;
  	}
  	//if we have clicked the heading columns
  	else if(cellIndex.x_cell > 0 && cellIndex.y_cell == 0) {
  		plateConfig.setColumnToTypeAndDraw(cellIndex.x_cell - 1, cfg.CURRENT_SELECTED_CELL_TYPE);
  		return true;
  	}
  	return false;
}

de.dkfz.signaling.webcellhts.PlateEditor.prototype.deletePlateLayout = function() {
	this.plateConfig.resetPlateLayoutForUndo();
}
 
//this method manages all the event listeners for the complete object
de.dkfz.signaling.webcellhts.PlateEditor.prototype._updateEventListeners = function() {
		var plateConfig = this.plateConfig;
		var self = this;
	//define some enclosures to be accessed from within the method
		var startPoint;
		var endPoint;
		//var ctx = this.ctx;
		//var canvas = this.canvas;
		var jsHelper = this.jsHelper;
		
		var mouse_downed = false;
		var posCalculator = this.plateConfig.posCalculator;
		var startPoint = {};
		var cfg = this.cfg;
		var currDrawTool = this.currDrawTool;
		var rect = this.canvas.getBoundingClientRect();
		var canvas = this.overlay_canvas;
		var ctx = this.overlay_ctx;
		var my_start_coords;
		
		var i = 0;
		
		//this method is for debugging...disable it later
		if(cfg.DEBUG_COORDS == true) {
			$('#'+this.overlayId).mousemove(function(event) {
	 				var my_start_coordinates = jsHelper.getCursorPosition(canvas, event);
	 				var headingStart = posCalculator.getActualUpperLeftHeadingStart();
  					if(i++ % 100)  {
  						var n_coord = posCalculator.normalizeCoordinates(my_start_coordinates);
  						var cellIndex = posCalculator.getGridIndexForCoordinate({x:n_coord.x,y:n_coord.y});				    	
  				    	i = 0;
  					}
  			});
		}
		//register the event handler for single cell click tool
		if( currDrawTool == cfg.DRAW_TOOL.POINT ) {
		//remove some eventhandlers from the pool of event listeners since DRAW_TOOL.LINE could register them before which would interfere here
			jsHelper.unbindAllMouseEvents(this.overlayId);
			
			$('#'+this.overlayId).click(function(event) {
	 			var coord = jsHelper.getCursorPosition(canvas, event);	
	 			var n_coord = posCalculator.normalizeCoordinates(coord);
  				var cellIndex = posCalculator.getGridIndexForCoordinate({x:n_coord.x,y:n_coord.y});	
  				
  				//we have clicked a single point...AND we are using the POINT drawing tool...do single click things
  					//the rules for single click mode:
  					// 1. click in the X: delete the current plate
  					// 2. click on a header: mark/unmark the complete row/column
  					// 3. click on a cell: mark/unmark that cell
  								
  				if(self.clickIntoHeader(cellIndex, cfg, plateConfig)) {} //check and process clicks into the header
  				//if we have a 'normal' cell
  				else if(cellIndex.x_cell > 0 && cellIndex.y_cell > 0) {
  						plateConfig.setCellToTypeAndDraw(cellIndex.y_cell - 1, cellIndex.x_cell - 1, cfg.CURRENT_SELECTED_CELL_TYPE);  //this is for testing
  				}
  					
  				
  			});
		}
		else if( currDrawTool == cfg.DRAW_TOOL.LINE ) {
			//remove the click method from the pool of event listeners since DRAW_TOOL.SINGLE_CLICK could register the click method before which would interfere here
			jsHelper.unbindAllMouseEvents(this.overlayId);
			$('#'+this.overlayId).mousedown(function(event) {
		 			my_start_coords = jsHelper.getCursorPosition(canvas, event);
  					//this is doing the trick of drawing a line : add evetlistener of mouse
  					//movevent within our event listener so it will only be called while we already have clicked 'down'
  					mouse_downed = true;	
  						
  			});
  			$('#'+this.overlayId).mousemove(function(event) {
  					if(mouse_downed) {
		 				my_end_coords = jsHelper.getCursorPosition(canvas, event);
		 				//empty overlay every move
		 				ctx.clearRect(0, 0, canvas.width, canvas.height);
		 				jsHelper.drawLine(my_start_coords
		 											,my_end_coords
		 											,1
		 											,"black"
		 											,ctx);
		 				
  					}
  						
  			});
  			$('#'+this.overlayId).mouseup(function(event) {
  					if(!mouse_downed) {
  						return;
  					}
  					mouse_downed = false;
  					var current_endpoint_coords = jsHelper.getCursorPosition(canvas, event); 					
  					//empty overlay every move
  					ctx.clearRect(0, 0, canvas.width, canvas.height);
  				
  					//var coord_obj = posCalculator.getCoordinatesForLine(my_start_coords, current_endpoint_coords);
  					var coord_obj = posCalculator.line2Cells(my_start_coords, current_endpoint_coords);
  					var cells_idx = jsHelper.coord2Uniq(coord_obj.cell_idx_arr);
  					if(cells_idx != null && cells_idx.length > 0) {
  						plateConfig.setCellsToTypeAndDraw(cells_idx, cfg.CURRENT_SELECTED_CELL_TYPE);
  					
  						if(cfg.DEBUG_LINEDRAW) {
  							for(var i = 0; i < coord_obj.coord_arr.length	; i ++) {
  								var coord = coord_obj.coord_arr[i];
  								draw_dots_with_labels_smaller(coord.x, coord.y, ctx);
  							}
  						}
  					}
  					else { //we may not pass over the border of two cells..try to get a single cell..this is like single-cell clicking
  						var point = posCalculator.singleCellFromLine(my_start_coords);
  						if(point.x != -1 || point.y != -1) {
  							plateConfig.setCellToTypeAndDraw(point.y, point.x, cfg.CURRENT_SELECTED_CELL_TYPE);
  						}
  					}
  					
  					
  	    	});
  	    }
  	    else if( currDrawTool == cfg.DRAW_TOOL.RECTANGLE ) {
  	    	//undo all former registered mouse movement functions
  	    	jsHelper.unbindAllMouseEvents(this.overlayId);
  	    	
  	    	$('#'+this.overlayId).mousedown(function(event) {
		 			my_start_coords = jsHelper.getCursorPosition(canvas, event);
  					mouse_downed = true;	
  						
  			});
  			$('#'+this.overlayId).mousemove(function(event) {
  					if(mouse_downed) {
		 				my_end_coords = jsHelper.getCursorPosition(canvas, event);
		 				ctx.clearRect(0, 0, canvas.width, canvas.height);
		 				jsHelper.drawRect(my_start_coords
		 											,my_end_coords
		 											,1
		 											,"black"
		 											,ctx);
		 				
  					}
  						
  			});
  			$('#'+this.overlayId).mouseup(function(event) {
  					if(!mouse_downed) {
  						return;
  					}
  					mouse_downed = false;
  					var current_endpoint_coords = jsHelper.getCursorPosition(canvas, event); 					
  					//empty overlay every move
  					ctx.clearRect(0, 0, canvas.width, canvas.height);
  					var cells_idx = posCalculator.rect2Cells(my_start_coords, current_endpoint_coords);
  					if(cells_idx != null && cells_idx.length > 0) {
  						plateConfig.setCellsToTypeAndDraw(cells_idx, cfg.CURRENT_SELECTED_CELL_TYPE);
  					}
  						
  					
  	    	});
  	    	
  	    	
  	    }
  	    
	
	

}

