var margin = {
    top: 10,
    right: 10,
    bottom: 10,
    left: 10
};

var cell_area = 5/6 * dx*dx;

var w = window.innerWidth > MapColumns*dx ? MapColumns*dx : (window.innerWidth || MapColumns*dx),
	h = window.innerHeight > MapRows*dx ? MapRows*dx : (window.innerHeight || MapRows*dx);
	

// initialize

var k_ = 0;
for (var i = 0; i < MapRows+1; i++) {
	for (var j = 0; j < MapColumns; j++) {	
	
    	var x_ = j * dx + dx/2*(i%2);
    	var y_ = i * dx;
    	var z_ = (w - x_) * S + (y_ - MapRows/2 * dx)*(y_ - MapRows/2 * dx) / 20000 - w*S;
    	
    	pts.push({k: k_,
    			  x: x_,
    			  y: y_,
    			  z: z_,
    			  depth: 0,
    			  volume: 0,
    			  time: 0,
    			  veg: 0,
    			  Qs: 0,
    			  C: 0});
    	k_++;	
    }
}

for (var i=0; i<pts.length; i++){
	colors[i] = browns(pts[i].z);
// 	sed[i] = sedColors(pts[i].C); 
}


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

path = path.data(d3_geom_voronoi(pts))
	.enter().append("path")
	.attr("d", function(d) { return "M" + d.join("L") + "Z"; })
	.style("fill", function(d, i) { return colors[i] })
	.attr("id", function(d,i) { return "path-"+i;});

circle = circles.data(pts)
circle.enter().append("circle")
	  .attr("r", 1.5)
	  .attr("cx", function(d) { return d.x; })
	  .attr("cy", function(d) { return d.y; })
	  .attr("class", "detectable")
	  .attr("id", function(d,i) { return i;})
	  .style('opacity',0);
circle.exit().remove();

// lower
// var svg_l = d3.select("#chart").append("svg")
//     .attr("width", w)
//     .attr("height", h)
//     .append("g")
//     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
// 
// var path_l = svg_l.selectAll("path");
// 
// path_l = path_l.data(d3_geom_voronoi(pts))
// 	.enter().append("path")
// 	.attr("d", function(d) { return "M" + d.join("L") + "Z"; })
// 	.style("fill", function(d, i) { return sedColors(0) })
// 	.attr("id", function(d,i) { return "path_l-"+i;});


var set_initial = function() {

	if (verbose) { console.log('set_initial'); }

	for (var i=0; i<pts.length; i++) {

		stage = pts[i].z;
		pts[i].depth = 0;

		if (pts[i].x < 125) {
			stage = d3.max([pts[i].z, maxH/4]);
	
		if (pts[i].x < 100) {
			stage = d3.max([pts[i].z, maxH/2]);
		
		if (pts[i].x < 75) {
			stage = d3.max([pts[i].z, 3*maxH/4]);
		
		if (pts[i].x < 50) {
			stage = d3.max([pts[i].z, maxH]);
		}}}
	
		pts[i].depth = stage - pts[i].z;
		pts[i].volume = pts[i].depth * cell_area;
		
// 		if (pts[i].depth > 0) {
// 		
// 			pts[i].C = 0.1;
// 			pts[i].Qs = pts[i].C * pts[i].volume;
// 		}
		}
	}
}

var geometry = function() {

	if (verbose) {
		console.log('geometry')
	}
	
	var mannings = function(depth,slope) {
		if (depth>0) {
			velocity = (1/n) * Math.pow(depth, 2/3) * Math.pow(Math.abs(slope),1/2);
		} else { velocity = 0; }
		return velocity	
	}
	
	var stage_src, stage_trg;
	var dist, slp, wslp, w_, md, v_, Q;
	var v_veg, v_source, v_target;
	var taub, taub_s, qs_s, qs, Qs, C;

	node_links = d3_geom_voronoi.links(pts);
	link_geometry = [];
// 	link_sed = [];

	for (var i=0; i<node_links.length; i++) {
	
		d = node_links[i];
	
		dist = Math.sqrt(Math.pow(d.source.x - d.target.x,2) + Math.pow(d.source.y - d.target.y,2));
		slp = (d.source.z - d.target.z) / dist;
	
		stage_src = d.source.z + d.source.depth;
		stage_trg = d.target.z + d.target.depth;
		wslp = (stage_src - stage_trg) / dist;
	
		if (d.source.y == d.target.y) { w_ = dx; } else { w_ = Math.sqrt(dx*dx / 2); }
	
		md = (d.source.depth + d.target.depth) / 2;
		if (md<0) { md = 0;};
		v_ = mannings(md, wslp);
	
		// vegetation
		// reduce the flow velocity using 1/2*dt for each cell
		v_source = 0.5 * Cd * alpha[d.source.veg] * v_*v_ * 0.5*dt;
		v_target = 0.5 * Cd * alpha[d.target.veg] * v_*v_ * 0.5*dt;
	
		v_veg = v_ - v_source - v_target;
	
		if (v_veg < 0) { v_veg = 0;}
		if (v_veg > v_) { console.log('alert!', v_veg, v_);}
	
		Q = md * w_ * v_veg * Math.sign(wslp);

		link_geometry.push({distance: dist,
	// 						bed_slope: slp,
							water_slope: wslp,
							width: w_,
							mid_depth: md,
							velocity: v_veg,
							discharge: Q,
							time: dist/v_veg});
							
							
// 		if ( md > 0 & Math.abs(Q) > 0) {
// 		
// // 			taub = rho * g * md * Math.abs(slp);
// 			taub = rho * 0.05/8 * v_veg*v_veg;
// 			taub_s = taub / ((rho_s - rho) * g * D);
// 			qs_s = 8 * Math.pow((taub_s - tau_c),1.5);
// 			qs = qs_s * (D * Math.sqrt(((rho_s - rho)/rho) * g * D));
// 			Qs = qs * w_;
// 			C = Math.abs(Qs / Q);
// 							
// 			link_sed.push({taub: taub,
// 						   Qs: Qs,
// 						   C: C});
// 		
// 		} else {
// 		
// 			link_sed.push({taub: 0,
// 						   Qs: 0,
// 						   C: 0});
// 		
// 		}
							
}};
