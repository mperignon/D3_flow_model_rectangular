$.getScript('grid.js', function(){});
$.getScript('veg.js', function(){});
$.getScript('video_controls.js', function(){});

var verbose = true;
var maxH, max_t;
var t = 0;

var w = 960,
    h = 500,
    sz = 20,
    dx = dy = sz,
    r = sz / 2,
    sr = r * r,
    ssz = sz * sz,
    S = 0.001;


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
var dt = 1;
var tv = 0;
var sl = 0;
var vid_dt = 0;
    
var g = 9.81;
var Co = 0.01; // concentration of incoming flow, in decimal

var Cd = 1.2;
var porosity = 0.3;

// Color schemes
var greens = d3.scale.quantize().domain([1,7])
.range(["#d9f0a3","#addd8e","#78c679","#41ab5d","#238443","#006837","#004529"]);
var alpha = [0, 0.04, 0.1, 0.22, 0.4, 1];

var browns = d3.scale.linear().domain([0,0.5])
.range(["#fee391","#fec44f","#fe9929","#ec7014","#cc4c02","#993404","#662506"]);

var sedColors = d3.scale.linear().domain([-0.005,0.005])
.range(["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"]);

var blues = d3.scale.linear().domain([0,0.1])
.range(["#c6dbef","#9ecae1","#6baed6","#4292c6","#2171b5","#08519c"]);



function retrieve() {

	if (verbose) { console.log('retrieve'); }

    var txtbox = document.getElementById("maxH");
    maxH = Number(txtbox.value);
    
    var txtbox = document.getElementById("maxT");
    max_t = txtbox.value;

    
    document.getElementById("maxH").disabled = true;
    document.getElementById("maxT").disabled = true;
    document.getElementById("submit").disabled = true;
    document.getElementById("startrun").disabled = false;
    
    document.getElementById("running").innerHTML = " <- Click to run the model";
    document.getElementById("values").innerHTML = "";
    
}

var shots = [];

var recolor = function() {

	if (verbose) { console.log('recolor'); }
	
	colors = [];

	svg.selectAll(".cell").each(function(d,i) {

    if (d.veg == 0 & d.depth > 0.01) {colors.push(blues(d.depth));}
    else if (d.veg == 0 & d.depth <= 0.01) {colors.push(browns(d.z));}
    else {colors.push(greens(d.veg))}})
	

}

var run_sim = function() {

	if (verbose) { console.log('run_sim'); }
	
	svg.selectAll(".cell").each( function(d) {
	if (d.veg>5) {d.veg = 5;}
	})

	shots.push(colors);
	
	document.getElementById("veg").innerHTML = "";
	document.getElementById("running").innerHTML = " Running...";
	
	while (t < max_t) {
		update();
// 		update_sed();		
        recolor();
		if (t%5 ==0) {
			shots.push(colors);
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
