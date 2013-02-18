//this context menu uses the jquery plugin contextMenu
//my implementation is heavily based on this jfiddle: http://jsfiddle.net/rodneyrehm/JdwxT/
loadPlateEditorCtxMenu = function(plateEdit) {
	var plateEditor = plateEdit;
	var cfg = de.dkfz.signaling.webcellhts.Config;
    $.contextMenu({
        selector: '#plateEditor', 
        callback: function(key, options) {
            if(key == "single_select") {
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
        	"single_select": {name: "Single Select"},
        	"line_tool": {name: "Line Select"},
        	"rectangle_tool":{name: "Rectangle Select"},
            "save": {name: "Save", icon: "save"},
            "sep1": "---------",
            "refresh": {name: "Refresh", icon: "refresh"}
            //"copy": {name: "Copy", icon: "copy"},
            //"paste": {name: "Paste", icon: "paste"},
            //"delete": {name: "Delete", icon: "delete"},
            //"quit": {name: "Quit", icon: "quit"}
        }
    });
};
