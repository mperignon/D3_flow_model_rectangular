$.getScript('grid.js', function(){});
$.getScript('update.js', function(){});
$.getScript('video_controls.js', function(){});
$.getScript('veg.js', function(){});
//$.getScript('rocks.js', function(){});

var verbose = false;
var dt = 1;
var vid_dt = 0; // video speed (inverse)
var max_t;
var dx = 15;
var dy = dx;
var maxH = 1;
var MapColumns = 40,
	MapRows = 30;

var S = 0.001;
var g = 9.81;
var Co = 0.01; // concentration of incoming flow, in decimal

var Cd = 1.2;
var porosity = 0.3;

var rho = 1000;
var rho_s = 2650;
var D = 0.0005;
var tau_c = 0.047;
var u_s = Math.sqrt(0.05/8);
var R = (rho_s - rho) / rho;
var Ke = 12 * D * Math.sqrt(R * g * D);
var nu = 0.000001;
var vs = (R * g * D*D) / (18*nu - Math.pow((0.75*0.4 * g * R * D*D*D),2));
var minh = tau_c * R * D / S;

// Color schemes
var greens = d3.scale.quantize().domain([1,3])
.range(["#addd8e","#41ab5d","#006837"])
var alpha = [0, 0.04, 0.4, 1];

var browns = d3.scale.linear().domain([0,0.5])
.range(["#fee391","#fec44f","#fe9929","#ec7014","#cc4c02","#993404","#662506"]);

var sedColors = d3.scale.linear().domain([-0.005,0.005])
.range(["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"]);

var blues = d3.scale.linear().domain([0,0.1])
.range(["#c6dbef","#9ecae1","#6baed6","#4292c6","#2171b5","#08519c"]);


var shots = [];
var topo = [];
var pts = [];
var colors = [];
var time = [];
var node_links;
var sed_links;
var link_geometry;
var link_sed;
var t = 0;
var tv = 0;
var sl = 0;


function retrieve() {

	if (verbose) { console.log('retrieve'); }

    var txtbox = document.getElementById("maxH");
    maxH = Number(txtbox.value);
    
    var txtbox = document.getElementById("maxT");
    max_t = txtbox.value;
    
    
    set_initial();
//     geometry_fvm();
    draw_initial();
    
    document.getElementById("maxH").disabled = true;
    document.getElementById("maxT").disabled = true;
    document.getElementById("submit").disabled = true;
    document.getElementById("startrun").disabled = false;
    
    document.getElementById("running").innerHTML = " <- Click to run the model";
    document.getElementById("values").innerHTML = "";
    
}



var draw_initial = function() {

	if (verbose) { console.log('draw_initial'); }

	recolor();

	path.transition().style("fill", function(d, i) { return colors[i]; });   
    path2.transition().style("fill", function(d, i) { return elev[i]; });    

}


var recolor = function() {

elev = [];

	if (verbose) { console.log('recolor'); }

	colors = [];

	for (var i=0; i<pts.length; i++){
	
		if (pts[i].depth > 0.01 & pts[i].veg == 0) {
			colors.push(blues(pts[i].depth));
			
		} else if (pts[i].depth <= 0.01 & pts[i].veg == 0) {
			colors.push(browns(pts[i].z));
			

		} else {
			colors.push(greens(pts[i].veg));
			
		}
		elev.push(sedColors(pts[i].z - initial_z[i]));
	}	
	
// 	topo.push(elev);

}




var run_sim = function() {

	if (verbose) { console.log('run_sim'); }
	
	for (var i=0; i<pts.length; i++){
	if (pts[i].veg>3) {pts[i].veg = 3;}
	}

	shots.push(colors);
	topo.push(elev);
	// this is a shallow clone and won't work! need to either loop through the interior arrays or to create 1 level arrays (like colors) that can be copied every time
	
	document.getElementById("veg").innerHTML = "";
	document.getElementById("running").innerHTML = " Running...";
	
	while (t < max_t) {
		update_fvm();
		update_sed();		
        recolor();
		if (t%5 ==0) {
			shots.push(colors);
			topo.push(elev);
			}


	}
	
	document.getElementById("running").innerHTML = " Done!";
	console.log('Run finished')
	document.getElementById("counter").innerHTML = ' <- Click to play the video';
	
	document.getElementById("startrun").disabled = true;
	document.getElementById("playvideo").disabled = false;
	document.getElementById("noplant").disabled = true;
	
	svg.selectAll("path").on("mousedown", function(d,i) {});
	svg.selectAll("path").on("mouseover", function(d,i) {});
	svg.selectAll("path").on("mouseout", function(d,i) {});
	
}


