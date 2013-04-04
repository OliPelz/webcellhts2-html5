//this context menu uses the jquery plugin contextMenu
//my implementation is heavily based on this jfiddle: http://jsfiddle.net/rodneyrehm/JdwxT/
loadPlateEditorCtxMenu = function(plateEdit) {
	var plateEditor = plateEdit;
	var cfg = de.dkfz.signaling.webcellhts.Config;
    $.contextMenu({
        selector: "#"+plateEditor.overlayId, 
        callback: function(key, options) {
        	if(key == "positive_well") {
            	cfg.CURRENT_SELECTED_CELL_TYPE = cfg.CELL_TYPE.positive;
            }
            else if(key == "negative_well") {
            	cfg.CURRENT_SELECTED_CELL_TYPE = cfg.CELL_TYPE.negative;
            }
            else if(key == "control_well") {
            	cfg.CURRENT_SELECTED_CELL_TYPE = cfg.CELL_TYPE.control;
            }
            else if(key == "empty_well") {
            	cfg.CURRENT_SELECTED_CELL_TYPE = cfg.CELL_TYPE.empty;
            }
        //----------
        	else if(key == "delete_plate") {
        		plateEditor.deletePlateLayout();
        		
        	}    
        //---------
            else if(key == "single_select") {
            	plateEditor.currDrawTool = cfg.DRAW_TOOL.POINT;
            	//when changing the drawing tool you have to update the event listeners
            	plateEditor._updateEventListeners();
            }
            else if(key == "line_tool") {
            	plateEditor.currDrawTool = cfg.DRAW_TOOL.LINE;
            	plateEditor._updateEventListeners();
            }
            else if(key == "rectangle_tool") {
            	plateEditor.currDrawTool = cfg.DRAW_TOOL.RECTANGLE;
            	plateEditor._updateEventListeners();
            }
        },
        items: {
        	"positive_well": {name: "Positive Well"},
        	"negative_well": {name: "Negative Well"},
        	"control_well": {name: "Control Well"},
        	"empty_well": {name: "Empty Well"},
        	"sep1": "---------",
        	"delete_plate": {name: "Delete Plate"},
        	"sep2": "---------",
        	"single_select": {name: "Single Select"},
        	"line_tool": {name: "Line Select"},
        	"rectangle_tool":{name: "Rectangle Select"},
            "save": {name: "Save", icon: "save"},
            "sep3": "---------",
            "refresh": {name: "Refresh", icon: "refresh"}
            //"copy": {name: "Copy", icon: "copy"},
            //"paste": {name: "Paste", icon: "paste"},
            //"delete": {name: "Delete", icon: "delete"},
            //"quit": {name: "Quit", icon: "quit"}
        }
    });
};
