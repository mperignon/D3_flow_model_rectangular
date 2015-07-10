$.getScript('grid.js', function(){});
$.getScript('update.js', function(){});
$.getScript('video_controls.js', function(){});
$.getScript('veg.js', function(){});

var verbose = false;
var dt = .2;
var vid_dt = 1; // video speed
var max_t;
var dx = 15;
var maxH;
var MapColumns = 40,
	MapRows = 25;
	
var D = 0.0005;
var tau_c = 0.047;
var S = 0.001;

var Cd = 1.2;
var n = 0.03;
var rho = 1000;
var rho_s = 2650;
var g = 9.81;


// Color schemes
var greens = d3.scale.quantize().domain([1,3])
.range(["#addd8e","#41ab5d","#006837"])
var alpha = [0, 0.04, 0.4, 1];

var browns = d3.scale.linear().domain([0,0.5])
.range(["#fee391","#fec44f","#fe9929","#ec7014","#cc4c02","#993404","#662506"]);

var sedColors = d3.scale.linear().domain([0,0.1])
.range(["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"]);

var blues = d3.scale.linear().domain([0,0.1])
.range(["#c6dbef","#9ecae1","#6baed6","#4292c6","#2171b5","#08519c"]);


var shots = [];
var topo = [];
var pts = [];
var colors = [];
var stage;
var time = [];
var node_links;
var link_geometry;
var link_sed;
var t = 0;
var tv = 0;
var sl = 0;
var sed = [];


		



function retrieve() {

	if (verbose) { console.log('retrieve'); }

    var txtbox = document.getElementById("maxH");
    maxH = txtbox.value;
    
    var txtbox = document.getElementById("maxT");
    max_t = txtbox.value;
    
    set_initial();
    geometry();
    draw_initial();
    
    document.getElementById("startrun").disabled = false;
    
}



var draw_initial = function() {

	if (verbose) { console.log('draw_initial'); }

	recolor();

	path.transition().style("fill", function(d, i) { return colors[i]; });   
// 	path_l.transition().style("fill", function(d, i) { return sedColors(sed[i]); });   

}


var recolor = function() {

	if (verbose) { console.log('recolor'); }

	colors = [];
	sed = [];

	for (var i=0; i<pts.length; i++){
	
		if (pts[i].depth > 0 & pts[i].veg == 0) {
			colors.push(blues(pts[i].depth));
			
		} else if (pts[i].depth == 0 & pts[i].veg == 0) {
			colors.push(browns(pts[i].z));
			
		} else {
			colors.push(greens(pts[i].veg));
			
		}
// 	sed.push(pts[i].C);
	}	

}




var run_sim = function() {

	if (verbose) { console.log('run_sim'); }

	shots.push(colors);
// 	topo.push(sed);
	// this is a shallow clone and won't work! need to either loop through the interior arrays or to create 1 level arrays (like colors) that can be copied every time
	
	while (t < max_t) {
		update();
		shots.push(colors);
// 		topo.push(sed);
	}
	
	console.log('Run finished')
	
	document.getElementById("playvideo").disabled = false;
	
}


