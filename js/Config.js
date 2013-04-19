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


de.dkfz.signaling.webcellhts.Config = {
//properties for cells
  	CELL_TYPE : {positive:0, negative:1, control:2, empty:3, other:4 },
	CELL_FILLCOLOR : {0:"green", 1:"red", 2:"yellow", 3:"pink", 4:"grey"}, //define the colors for the WELLTYPE
	CELL_LINECOLOR : "black",
	CELL_LINESTRENGTH : 2,  //the linestrength should be more than 1 otherwise the borders of fillrect and strokerect will be messed up
	CELL_PADDING: {x:3, y:3},  //this is not a real padding, its the space between two cells...should be more than 1 because otherwise the rectangles look weired
	CELL_FONT : "san-serif",
	CELL_FONT_COLOR : "black",
	CELL_DIMENSION : {width : 35, height : 35},
	HEAD_CELL_STATE : {none:0, delete:1, undo:2},  //the states a heading cell can be in (3 at all) when we click on
	CURRENT_SELECTED_CELL_TYPE : 0,  //the standard selection tool is positive well-> has got the id 0 (see CELL_TYPE.positive)
	PLATE_TYPES : {P96:96, P192:192, P384:384},
// position and size of the drawing wellplate
	WELLPLATE_POS : {x:50, y:50},   //the upper left start of our plate IN the canvas
	//WELLPLATE_WIDTH : 250,
	//WELLPLATE_HEIGHT : 500,
	WELLPLATE_LINESTRENGTH : 1,  //the surrounding box
	WELLPLATE_LINECOLOR : "black",
	PLATE_CONFIG_SETTINGS: {Pl_All: {"name":"Pl_All"}},  //this variable will hold all the plate, replicate combinations of this set
//other constants
	PLATEAREA : { X_HEAD:0, ROW_HEAD:1, COLUMN_HEAD:2, CELL:3, NONE:4 },  //defines area the mouse is currently at
	DRAW_TOOL : { POINT:0, LINE:1, RECTANGLE:2 },  //select the current drawing tool: draw points, draw rectangles etc
	DEBUG_COORDS: false,  //debugging flag for coordinates grid and mouse movement (open console to see a log)
	DEBUG_CLICK: false, //debugging flag to test the Model View Controller clicks
	DEBUG_LINEDRAW: false
}
setPlateConfigSettings = function(plateConfigSettings) {
	//extend the config
	for(var i = 1; i <= plateConfigSettings.plates; i++) {
		for(var j = 1; j <= plateConfigSettings.replicates; j++) {
			var myName = "Pl_"+i+"_Rep_"+j;
			de.dkfz.signaling.webcellhts.Config.PLATE_CONFIG_SETTINGS[myName] = {"name": myName};
		}
	}
}

getColorForWellType = function(wellType) {
	return de.dkfz.signaling.webcellhts.Config.CELL_FILLCOLOR[wellType];
}
getRowsColsFromPlateFormat = function(plateFormat) {
	var rows = 16;  //if we are 96er plate
   	var columns = 6; //if we are 96er plate
   	if(plateFormat == 192) {
   		rows *= 2;
   		 columns *= 2;
   	}
   	else if(plateFormat == 384) {
   		rows *= 4;
   		columns *= 4;
   	}
	return {rows:rows, columns:columns};   	
}