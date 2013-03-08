//contains classes for debugging

/**
  Draws a typographical grid as a background image.
  
  Lines will be drawn every `major` pixels, and then lighter lines will be 
  drawn every `minor` pixels if a `minor` grid is set.
  
  this method is derived from: https://github.com/adamsanderson/Css-Grid-Debug/blob/master/grid_debug.js

	it draws over the complete html page
*/
function drawDebugGrid(major,minor){
  // add canvas
  var canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = major;

  var ctx = canvas.getContext('2d');
  ctx.save();
  // Translate by 1/2 pixel to draw crisp lines
  ctx.translate(0, -0.5);
  
  // Draw major lines
  ctx.lineWidth = 1;
  ctx.setStrokeColor('#ccc');
  ctx.moveTo(0,major); ctx.lineTo(32,major);
  ctx.stroke();
  
  // Draw minor lines
  if (minor){
    for (var i = minor; i < major; i += minor){
      ctx.setStrokeColor('#eee');
      ctx.moveTo(0,i); ctx.lineTo(32,i);
      ctx.stroke();
    }
  }

  // add background image
  var dataUrl = canvas.toDataURL("image/png");
  document.body.style.cssText += 'background: url('+dataUrl+') repeat';
  ctx.restore();
};

//draw grid over canvas
function draw_grid(canvas) {
var ctx = canvas.getContext("2d");
ctx.save();
var width = canvas.width;
var height = canvas.height;
try {
  /* vertical lines */
  ctx.lineWidth = 1;
  for (var x = 0.5; x < width; x += 10) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
  }

  /* horizontal lines */
  for (var y = 0.5; y < height; y += 10) {
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }

  /* draw it! */
  ctx.strokeStyle = "#eee";
  ctx.stroke();
} catch(err) {}
	ctx.restore();
}

function draw_dots_with_labels(x, y, ctx) {
	ctx.save();
	try {
		ctx.fillStyle = "green";
		ctx.fillRect(x , y , 3, 3);
	} catch(err) {}
	try {
		ctx.fillStyle = "black";
  		ctx.font = "bold 12px sans-serif";
	} catch(err) {}
	try {
  		ctx.textBaseline = "top";
  		ctx.fillText("( "+x+" , "+y+" )", x+8, y+5);
	} catch(err) {}
	ctx.restore();
	
}

function draw_labels(ctx) {
ctx.save();
try {
  ctx.font = "bold 12px sans-serif";
} catch(err) {}

try {
  ctx.textBaseline = "top";
  ctx.fillText("( 0 , 0 )", 8, 5);
} catch(err) {}

try {
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  ctx.fillText("( 500 , 375 )", 492, 370);
} catch(err) {}
	ctx.restore();
} 
function draw_dots(ctx) {
	ctx.save();
try {
  ctx.fillRect(0, 0, 3, 3);
  ctx.fillRect(497, 372, 3, 3);
} catch(err) {}
ctx.restore();
}

function print_1D_arr(arr) {
		var currOutput = null;
		for(var col = 0; col < arr.length; col++) {
			if(currOutput == null) {
				currOutput = arr[col];	
			}
			else {
				currOutput += "\t"+arr[col];	
			}
		}
		return currOutput;
}
function console_log_2D_arr(arr) {
	for(var row = 0; row < arr.length; row++) {
		console.log(print_1D_arr(arr[row]));
	}
}
function console_log_2D_arr(rowIdx, arr, desc) {
	console.log(desc+":\t"+print_1D_arr(arr[rowIdx]));
}
