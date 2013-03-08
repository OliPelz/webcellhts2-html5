//this context menu uses the jquery plugin contextMenu
//my implementation is heavily based on this jfiddle: http://jsfiddle.net/rodneyrehm/JdwxT/
loadPlateEditorCtxMenu = function(plateEdit) {
	var plateEditor = plateEdit;
	var cfg = de.dkfz.signaling.webcellhts.Config;
    $.contextMenu({
        selector: '#plateEditor', 
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
        
        //---------
            else if(key == "single_select") {
            	plateEditor.currDrawTool = cfg.DRAW_TOOL.POINT;
            }
            else if(key == "line_tool") {
            	plateEditor.currDrawTool = cfg.DRAW_TOOL.LINE;
            }
            else if(key == "rectangle_tool") {
            	plateEditor.currDrawTool = cfg.DRAW_TOOL.RECTANGLE;
            }
        },
        items: {
        	"positive_well": {name: "Positive Well"},
        	"negative_well": {name: "Negative Well"},
        	"control_well": {name: "Control Well"},
        	"empty_well": {name: "Empty Well"},
        	"sep1": "---------",
        	"single_select": {name: "Single Select"},
        	"line_tool": {name: "Line Select"},
        	"rectangle_tool":{name: "Rectangle Select"},
            "save": {name: "Save", icon: "save"},
            "sep2": "---------",
            "refresh": {name: "Refresh", icon: "refresh"}
            //"copy": {name: "Copy", icon: "copy"},
            //"paste": {name: "Paste", icon: "paste"},
            //"delete": {name: "Delete", icon: "delete"},
            //"quit": {name: "Quit", icon: "quit"}
        }
    });
};
