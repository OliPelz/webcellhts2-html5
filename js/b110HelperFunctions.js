//this file is a collection of all kinds of javascript helper functions, small functions
//to extend the language

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
if(!de.dkfz.signaling.b110)
    de.dkfz.signaling.b110 = {};    


// ---------------------------------------------------------------------------------------------------------------------
// - JsHelper
// -
// -   Description: This class provides common used methods we often need in javascript
// -   Author: Oliver Pelz
// -   Version: 0.01
// -
// -   Parameter: none
//
// ---------------------------------------------------------------------------------------------------------------------
//constructor
de.dkfz.signaling.b110.JsHelper = function() {
	
}

//this method checks if an html element with the id 'element' is available
//in the DOM
de.dkfz.signaling.b110.JsHelper.prototype.isElementInNode = function(element){
	if (typeof(element) != 'undefined' && element != null) {
  		return true;
	}
	return false;
}
de.dkfz.signaling.b110.JsHelper.prototype.isUndefined = function(element){
	return this.isElementInNode(element);//same applies here
}
//create empty 3d array
de.dkfz.signaling.b110.JsHelper.prototype.create3DArray = function(rows, columns){
	var array3D = new Array(rows);
	for(var i = 0; i < rows; i++) {
		array3D[i] = new Array(columns);
		for(j = 0; j < columns; j++) {
			array3D[i][j] = new Array();
		}
	}
	return array3D;
}

//get empty new 2d array
de.dkfz.signaling.b110.JsHelper.prototype.create2DArray = function(rows, columns){
	var array2D = new Array(rows);
	for(var i = 0; i < rows; i++) {
		array2D[i] = new Array(columns);
	}
	return array2D;
}
//set a complete function with type
de.dkfz.signaling.b110.JsHelper.prototype.addTo3DArrayType = function(arr, type) {
	for(var i = 0; i < arr.length; i++) {
		for(var j = 0; j < arr[i].length; j++) {
			arr[i][j].push(type);
		}
	}
	return arr;
}
//set a complete function with type
de.dkfz.signaling.b110.JsHelper.prototype.fill2DArrayWithType = function(arr, type) {
	for(var i = 0; i < arr.length; i++) {
		for(var j = 0; j < arr[i].length; j++) {
			arr[i][j] = type;
		}
	}
	return arr;
}

//set a complete function with type
de.dkfz.signaling.b110.JsHelper.prototype.fill1DArrayWithType = function(arr, type) {
	for(var i = 0; i < arr.length; i++) {
			arr[i] = type;
	}
	return arr;
}
//set a complete function with type
de.dkfz.signaling.b110.JsHelper.prototype.createAndInit1DArray = function(size, type) {
	var arr = new Array(size);
	for(var i = 0; i < arr.length; i++) {
			arr[i] = type;
	}
	return arr;
}


//copy arrays of same size (copy source array content to destination array content)
de.dkfz.signaling.b110.JsHelper.prototype.copy2DArrayContent = function(srcArr, destArr){
	if(srcArr.length != destArr.length) {
		return;
	}
	for(var i = 0; i < srcArr.length; i++) {
		if(srcArr[i].length != destArr.length) {
			return;
		}
		for(var j = 0; j < srcArr[i]; j++) {
			destArr[i][j] = srcArr[i][j];
		}
	}			
}
de.dkfz.signaling.b110.JsHelper.prototype.getSmallerNum = function(a, b) {
	var smaller = a;
	if(b < smaller) {
		smaller = b;
	}
	return smaller;
}
//this method is a basic implementation of the Bresenham algorithm
//good explanation of the algorithm: www.codeproject.com/Articles/16564/Drawing-lines-in-Mozilla-based-browsers-and-the-In
//Parameter: start and endpoint of a line
//returns: returns all the f(x) for a given interval in an array
de.dkfz.signaling.b110.JsHelper.prototype.getCoordinatesOfInterestForLine
	= function(startPoint, endPoint, rangeCoords) {
	var returnList = new Array();
	x1 = startPoint.x;
	x2 = endPoint.x;
	y1 = startPoint.y;
	y2 = endPoint.y;
	//this would be a click without drawing an actual line
	if (x1 == x2 && y1 == y2) { 
		returnList.push(startPoint);
		return returnList;
	}
	var dx = x2 - x1; 
	var sx = (dx < 0) ? -1*dimension.width : dimension.width; 
	var dy = y2 - y1; 
	var sy = (dy < 0) ? -1*dimension.height : dimension.height; 
	var m = dy / dx;
	
	var b = y1 - m * x1;
	for(var i = 0; i < rangeCoords.length; i++){
		var currentPoint = rangeCoords[i];
		if(currentPoint.x_start < x1 ) {
			continue;
		}
		var y = parseInt(Math.round(m*x1 + b)); returnList.push({x:x1, y:y});
		x1 += sx;
	}
	return returnList;
}
//see http://stackoverflow.com/questions/55677/how-do-i-get-the-coordinates-of-a-mouse-click-on-a-canvas-element/5932203#5932203
de.dkfz.signaling.b110.JsHelper.prototype.getCursorPosition = function(canvas, event) {
var x, y;

canoffset = $(canvas).offset();
x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - Math.floor(canoffset.left);
y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop - Math.floor(canoffset.top); // TODO: why?

return {x:x, y:y};
}
de.dkfz.signaling.b110.JsHelper.prototype.drawLine = function(startPoint
   												, stopPoint
   												, lineThickness 
   												, lineColor
   												, ctx
   												) {
   			ctx.save()
   			ctx.fillStyle = lineColor;
    		ctx.lineWidth = lineThickness;										
    		ctx.beginPath();
    		ctx.moveTo(startPoint.x, startPoint.y);
    		ctx.lineTo(stopPoint.x, stopPoint.y);
    		//then actually draw this thing
    		ctx.stroke();
    		ctx.closePath();
    		ctx.restore();
}
//this neglects anti aliasing for 1px lines
de.dkfz.signaling.b110.JsHelper.prototype.drawThinHorizontalLine = function(c, x1, x2, y) {
		c.lineWidth = 1;
		var adaptedY = Math.floor(y)+0.5;
		c.beginPath();
		c.moveTo(x1, adaptedY);
		c.lineTo(x2, adaptedY);
		c.stroke();
}
//this neglects anti aliasing for 1px lines
de.dkfz.signaling.b110.JsHelper.prototype.drawThinVerticalLine = function(c, x, y1, y2) {
		c.lineWidth = 1;
		var adaptedX = Math.floor(x)+0.5;
		c.beginPath();
		c.moveTo(adaptedX, y1);
		c.lineTo(adaptedX, y2);
		c.stroke();
}
//this strokes a rectangle but keeps in mind anti aliasing for 1px lines
de.dkfz.signaling.b110.JsHelper.prototype.strokeRectangle = function(lineColor, lineStrength,  plateDimension, position, ctx) {
	var position_x = position.x;
	var position_y = position.y;
	if(lineStrength <= 1) {
		lineStrength = 1;
		position_x += 0.5;
		position_y += 0.5;
	}
	ctx.save();
	ctx.strokeStyle = lineColor;
	ctx.lineWidth = lineStrength;
	//draw the border around the plate (this must not be the canvas border)
	ctx.strokeRect(position_x, position_y, 
					plateDimension.width, plateDimension.height);
	ctx.restore();
}
de.dkfz.signaling.b110.JsHelper.prototype.clearCanvas = function(canvas) {
	var context = canvas.getContext("2d");
	context.clearRect(0, 0, canvas.width, canvas.height);
}
//this appends a brand new canvas to the nodeToAppend element
//the oldCanvas is the template to copy its size etc.
/*de.dkfz.signaling.b110.JsHelper.prototype.overlayNewCanvas = function(oldCanvas) {
	  // Add the temporary canvas.
    var newCanvas = document.createElement('canvas');
    if (!newCanvas) {
      alert('Error: I cannot create a new canvas element in DOM ');
      throw new Error("cannotCreateCanvasObj");
    }

    newCanvas.id     = 'overlayCanvas';
    newCanvas.width  = oldCanvas.width;
    newCanvas.height = oldCanvas.height;
    newCanvas.style.position = "absolute";
    //container.appendChild(newCanvas);
	this.overlay_update(oldCanvas, newCanvas);
 	return newCanvas;
}
// This function draws the #imageTemp canvas on top of #imageView (overlay), after which 
// #overlayCanvas is cleared. This function is called each time when the user 
// completes a drawing operation.
de.dkfz.signaling.b110.JsHelper.prototype.overlay_update = function(oldCanvas, newCanvas) {
  		var oldContext = oldCanvas.getContext("2d");
  		var newContext = newCanvas.getContext("2d");
		oldContext.drawImage(newCanvas, 0, 0);
		
		newContext.clearRect(0, 0, newCanvas.width, newCanvas.height);
		console.log("clear the complete thing");
  }*/
