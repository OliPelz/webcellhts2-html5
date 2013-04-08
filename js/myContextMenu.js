//this context menu uses the jquery plugin contextMenu
//my implementation is heavily based on this jfiddle: http://jsfiddle.net/rodneyrehm/JdwxT/
loadPlateEditorCtxMenu = function(plateEdit) {
	var plateEditor = plateEdit;
	var cfg = de.dkfz.signaling.webcellhts.Config;
    $.contextMenu({
        selector: "#"+plateEditor.overlayId, 
        callback: function(key, options) {
        	if(key == "plate_96") {
            	plateEditor.clearPlateEditor();
            	plateEditor = new de.dkfz.signaling.webcellhts.PlateEditor("plateEditor"
            		, cfg.PLATE_TYPES.P96
            		, "animationOverlay");
            }
            else if(key == "plate_384") {
            	plateEditor.clearPlateEditor();
            	plateEditor = new de.dkfz.signaling.webcellhts.PlateEditor("plateEditor"
            		, cfg.PLATE_TYPES.P384
            		, "animationOverlay");
            }
            else if(key == "plate_1536") {
            	plateEditor.clearPlateEditor();
            	plateEditor = new de.dkfz.signaling.webcellhts.PlateEditor("plateEditor"
            		, cfg.PLATE_TYPES.P1536
            		, "animationOverlay");
            }
        //----------
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
        		plateEditor._updateEventListeners(); //to get rid of visible lines or rectangles
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
            	//TODO: grey out header
            }
            else if(key == "rectangle_tool") {
            	plateEditor.currDrawTool = cfg.DRAW_TOOL.RECTANGLE;
            	plateEditor._updateEventListeners();
            	//TODO: grey out header
            }
        },
        items: {
        	"plate_96": {name: "New 96 Well Plate"},
        	"plate_384": {name: "New 384 Well Plate"},
        	"plate_1536": {name: "New 1536 Well Plate"},
        	"sep0": "---------",
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
        }
    });
};
