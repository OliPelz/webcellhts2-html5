//this context menu uses the jquery plugin contextMenu
//my implementation is heavily based on this jfiddle: http://jsfiddle.net/rodneyrehm/JdwxT/
loadPlateEditorCtxMenu = function(plateEdit) {
	var plateEditor = plateEdit;
	var cfg = de.dkfz.signaling.webcellhts.Config;
	var plateConfigSettings = cfg.PLATE_CONFIG_SETTINGS;
	//the standard plate is the All plate	
    $.contextMenu({
        selector: "#"+plateEditor.overlayId, 
        callback: function(key, options) {
        	if(key == "plate_96") {
            	plateEditor.clearPlateEditor();
            	plateEditor = new de.dkfz.signaling.webcellhts.PlateEditor("plateEditor"
            		, cfg.PLATE_TYPES.P96
            		, "animationOverlay");
            }
            else if(key == "plate_192") {
            	plateEditor.clearPlateEditor();
            	plateEditor = new de.dkfz.signaling.webcellhts.PlateEditor("plateEditor"
            		, cfg.PLATE_TYPES.P192
            		, "animationOverlay");
            }
            else if(key == "plate_384") {
            	plateEditor.clearPlateEditor();
            	plateEditor = new de.dkfz.signaling.webcellhts.PlateEditor("plateEditor"
            		, cfg.PLATE_TYPES.P384
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
        	else if(key == "Pl_All") {
        		plateEditor.switchCurrentPlateSetting(plateConfigSettings.Pl_All);
        		plateEditor.redraw();
        	}
            else if(/^Pl_(\d+)_Rep_(\d+)$/.test(key)) {
            	plateEditor.switchCurrentPlateSetting(plateConfigSettings[key]);
            	plateEditor.redraw();
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
            	plateEditor.enableHeadings();
            }
            else if(key == "line_tool") {
            	plateEditor.currDrawTool = cfg.DRAW_TOOL.LINE;
            	plateEditor._updateEventListeners();
            	plateEditor.disableHeadings();
            	//TODO: grey out header
            }
            else if(key == "rectangle_tool") {
            	plateEditor.currDrawTool = cfg.DRAW_TOOL.RECTANGLE;
            	plateEditor._updateEventListeners();
            	plateEditor.disableHeadings();
            	//TODO: grey out header
            }
        },
        items: {
        	"plate_96": {name: "New 96 Well Plate"},
        	"plate_192": {name: "New 192 Well Plate"},
        	"plate_384": {name: "New 384 Well Plate"},
        	"sep0": "---------",
        	"positive_well": {name: "Positive Well"},
        	"negative_well": {name: "Negative Well"},
        	"control_well": {name: "Control Well"},
        	"empty_well": {name: "Empty Well"},
        	"sep1": "---------",
        	"plate": {
                "name": "Choose a Plate", 
                "items": plateConfigSettings
            },
        	"sep2": "---------",
        	"delete_plate": {name: "Delete Plate"},
        	"sep3": "---------",
        	"single_select": {name: "Single Select"},
        	"line_tool": {name: "Line Select"},
        	"rectangle_tool":{name: "Rectangle Select"},
            "save": {name: "Save", icon: "save"},
            "sep4": "---------",
            "refresh": {name: "Refresh", icon: "refresh"}
        }
    });
};
