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
    
//this class is the menuebar or toolbar for all the different options to choose from 
   
de.dkfz.signaling.webcellhts.MenueTools = function(ctx) {
	this.ctx = ctx;
	this.cfg = de.dkfz.signaling.webcellhts.Config;
	this.helper = new de.dkfz.signaling.b110.JsHelper();
//standard data when construction
	this.chosenWellType = this.cfg.CELL_TYPE.positive;
}