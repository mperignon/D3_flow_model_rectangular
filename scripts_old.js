// Color schemes
var greens = d3.scale.quantize().domain([0,5])
.range(["#edf8e9","#c7e9c0","#a1d99b","#74c476","#41ab5d","#238b45","#005a32"])

var browns = d3.scale.quantize().domain([0,2])
.range(["#fec44f","#fe9929","#ec7014","#cc4c02","#993404","#662506"]);

var blues = d3.scale.quantize().domain([0,1])
.range(["#f7fbff","#deebf7","#c6dbef","#9ecae1","#6baed6","#4292c6","#2171b5","#084594"]);

// Geometry
var margin = {
    top: 10,
    right: 10,
    bottom: 10,
    left: 10
};

var dx = 15;
var cell_area = 5/6 * dx*dx;

var MapColumns = 40,
	MapRows = 25;
var w = window.innerWidth > MapColumns*dx ? MapColumns*dx : (window.innerWidth || MapColumns*dx),
	h = window.innerHeight > MapRows*dx ? MapRows*dx : (window.innerHeight || MapRows*dx);

var x_, y_, z_, k_ = 0;	
var pts = [];

for (var i = 0; i < MapRows+1; i++) {
	for (var j = 0; j < MapColumns; j++) {	
	
    	x_ = j * dx + dx/2*(i%2);
    	y_ = i * dx;
    	z_ = (y_ - MapRows/2 * dx)*(y_ - MapRows/2 * dx) / 20000;
    	
    	pts.push({k: k_,
    			  x: x_,
    			  y: y_,
    			  z: z_,
    			  stage: z_,
    			  depth: 0,
    			  volume: 0});
    	
    	k_++;
    	
    }
}


// Initialize svg and objects
var d3_geom_voronoi = d3.geom.voronoi()
		.x(function(d) { return d.x; })
		.y(function(d) { return d.y; })
		.clipExtent([[0, 0], [w, h]]);

var svg = d3.select("#chart").append("svg")
    .attr("width", w)
    .attr("height", h)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var circle = svg.selectAll("circle");
var link = svg.selectAll("line");
var path = svg.selectAll("path");


// Drawing function
function draw() {

console.log('draw')

for (var i=0; i<pts.length; i++){
	if (pts[i].stage > pts[i].z) {
		colors.push(blues(pts[i].depth));
	} else {
		colors.push(browns(pts[i].z));
	}
}


path = path.data(d3_geom_voronoi(pts));
path.enter().append("path")
    .style("fill", function(d, i) { return "#000000" });
path.attr("d", function(d) { return "M" + d.join("L") + "Z"; })
    .style("fill", function(d, i) { return colors[i] })
path.exit().remove();

// link = link.data(d3_geom_voronoi.links(pts))
// link.enter().append("line")
// link.attr("x1", function(d) { return d.source.x; })
//     .attr("y1", function(d) { return d.source.y; })
//     .attr("x2", function(d) { return d.target.x; })
//     .attr("y2", function(d) { return d.target.y; })
// link.exit().remove()  

circle = circle.data(pts)
circle.enter().append("circle")
      .attr("r", 1.5);
circle.attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; });
circle.exit().remove();
}

// Set initial conditions
colors = [];
for (var i=0; i<pts.length; i++) {

	if (pts[i].x < 50) {
		pts[i].stage = d3.max([pts[i].z, 0.5]);
	}
	if (pts[i].x < 25) {
		pts[i].stage = d3.max([pts[i].z, 1]);
	}
	
	pts[i].depth = pts[i].stage - pts[i].z;
	pts[i].volume = pts[i].depth * cell_area;
}




var node_links;
var link_geometry;
var dist, slp, wslp, w_, md, v_, Q;



// geometry at each link
function geometry() {

node_links = d3_geom_voronoi.links(pts);
link_geometry = [];

console.log('geometry')
for (var i=0; i<node_links.length; i++) {
	
	d = node_links[i];
	
	dist = Math.sqrt(Math.pow(d.source.x - d.target.x,2) + Math.pow(d.source.y - d.target.y,2));
	slp = (d.source.z - d.target.z) / dist;
	wslp = (d.source.stage - d.target.stage) / dist;
	
	if (d.source.y == d.target.y) { w_ = dx; } else { w_ = Math.sqrt(dx*dx / 2); }
	
	md = (d.source.depth + d.target.depth) / 2;
	if (md<0) { md = 0;};
	v_ = mannings(md, wslp);
	
	Q = md * w_ * v_ * Math.sign(wslp);
	
// 	console.log(md,v_, wslp)

	link_geometry.push({distance: dist,
						bed_slope: slp,
						water_slope: wslp,
						width: w_,
						mid_depth: md,
						velocity: v_,
						discharge: Q});
}

function mannings(depth,slope) {
	n = 0.03;
	if (depth>0) {
		velocity = (1/n) * Math.pow(depth, 2/3) * Math.pow(Math.abs(slope),1/2);
	} else {
	velocity = 0;
	}
	return velocity
}


}

// dQ at each pt
// (links are unique - one per pair of nodes!)

var dt = 10;
var src, trg, dir, Q, t = 0;

function update() {

console.log('update')

for (var i=0; i<node_links.length; i++) {

	// index of source
	src = node_links[i].source.k;
	// index of target
	trg = node_links[i].target.k;

	Q = link_geometry[i].discharge;
	
// 	console.log(Q)

	// if slope is positive, subtract Q from source and add to target
	if (Q  > 0) {
	pts[src].volume = pts[src].volume - Q*dt;
	pts[trg].volume = pts[trg].volume + Q*dt;
	}
	// if slope is negative, add Q to source and subtract from target
	if (Q < 0) {
	pts[src].volume = pts[src].volume + Q*dt;
	pts[trg].volume = pts[trg].volume - Q*dt;
	}

};

for (var i=0; i<pts.length; i++) {
	pts[i].depth = pts[i].volume / cell_area;
	
	if (pts[i].x < 25) {
		pts[i].depth = d3.max([pts[i].z, 1]) - pts[i].z;
	}
	
	pts[i].stage = pts[i].z + pts[i].depth;
}



for (var i=0; i<pts.length; i++) {

	if (pts[i].x < 50) {
		pts[i].stage = d3.max([pts[i].z, 0.5]);
	}
	if (pts[i].x < 25) {
		pts[i].stage = d3.max([pts[i].z, 1]);
	}
	
	pts[i].depth = pts[i].stage - pts[i].z;
	pts[i].volume = pts[i].depth * cell_area;
}


svg.call(geometry);
svg.call(redraw);
console.log('time = ', t)
t++;
// console.log(pts[200].depth)

}

function redraw() {

console.log('redraw')
colors = [];

for (var i=0; i<pts.length; i++){
	if (pts[i].stage > pts[i].z) {
		colors.push(blues(pts[i].depth));
	} else {
		colors.push(browns(pts[i].z));
	}
}

path = svg.selectAll("path");

path.style("fill", function(d, i) { return "#000000" });
path.attr("d", function(d) { return "M" + d.join("L") + "Z"; })
    .style("fill", function(d, i) { return colors[i] })

}

svg.call(geometry);
svg.call(draw);
svg.call(update);
svg.call(update);
svg.call(update);
svg.call(update);
svg.call(update);
svg.call(update);
svg.call(update);
svg.call(update);
svg.call(update);
svg.call(update);
svg.call(update);
svg.call(update);
svg.call(update);
svg.call(update);
svg.call(update);
svg.call(update);
svg.call(update);
svg.call(update);
svg.call(update);
svg.call(update);
svg.call(update);
svg.call(update);
svg.call(update);
svg.call(update);
svg.call(update);
svg.call(update);
svg.call(update);
svg.call(update);



