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


var margin = {
    top: 10,
    right: 10,
    bottom: 10,
    left: 10
};

var cell_area = 5/6 * dx*dx;

var w = window.innerWidth > MapColumns*dx ? MapColumns*dx : (window.innerWidth || MapColumns*dx),
	h = window.innerHeight > MapRows*dx ? MapRows*dx : (window.innerHeight || MapRows*dx);

var d3_geom_voronoi = d3.geom.voronoi()
		.x(function(d) { return d.x; })
		.y(function(d) { return d.y; })
		.clipExtent([[0, 0], [w, h]]);

// upper
var svg = d3.select("#chart").append("svg")
    .attr("width", w)
    .attr("height", h)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
var circles = svg.selectAll("circle");
var path = svg.selectAll("path");

// initialize
// 
// var k_ = 0;
// for (var i = 0; i < MapRows+1; i++) {
// 	for (var j = 0; j < MapColumns; j++) {	
// 	
//     	var x_ = j * dx + dx/2*(i%2);
//     	var y_ = i * dx;
//     	var z_ = (w - x_) * S + (y_ - MapRows/2 * dx)*(y_ - MapRows/2 * dx) / 20000 - w*S;
//     	
//     	pts.push({k: k_,
//     			  x: x_,
//     			  y: y_,
//     			  z: z_,
//     			  depth: 0,
//     			  volume: 0,
//     			  time: 0,
//     			  veg: 0,
//     			  Qs: 0,
//     			  C: 0});
//     	k_++;	
//     }
// }
