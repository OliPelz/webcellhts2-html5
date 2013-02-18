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
//get empty new 2d array
de.dkfz.signaling.b110.JsHelper.prototype.create2DArray = function(rows, columns){
	var array2D = new Array(rows);
	for(var i = 0; i < rows; i++) {
		array2D[i] = new Array(columns);
	}
	return array2D;
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
	var dimension = 1;
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
y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop - Math.floor(canoffset.top) + 1;

return {x:x, y:y};
}
de.dkfz.signaling.b110.JsHelper.prototype.drawLine = function(startPoint
   												, stopPoint
   												, lineThickness 
   												, lineColor
   												, ctx
   												) {
   			ctx.fillStyle = lineColor;
    		ctx.lineWidth = lineThickness;										
    		ctx.beginPath();
    		ctx.moveTo(startPoint.x, startPoint.y);
    		ctx.lineTo(stopPoint.x, stopPoint.y);
    		//then actually draw this thing
    		ctx.stroke();
    		ctx.closePath();
   	}
