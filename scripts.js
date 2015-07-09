
var verbose = false;
var dt = .2;
var vid_dt = 100; // video speed
var max_t;
var dx = 15;
var maxH;
var MapColumns = 40,
	MapRows = 25;
	
var D = 0.0005;
var tau_c = 0.047;

var Cd = 1.2;
var n = 0.03;
var rho = 1000;
var rho_s = 2650;
var g = 9.81;


// Color schemes
var greens = d3.scale.quantize().domain([1,3])
.range(["#addd8e","#41ab5d","#006837"])
var alpha = [0, 0.04, 0.4, 1];

var browns = d3.scale.quantize().domain([0,2])
.range(["#fee391","#fec44f","#fe9929","#ec7014","#cc4c02","#993404","#662506"]);

var sedColors = d3.scale.quantize().domain([0,0.1])
.range(["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"]);

var blues = d3.scale.quantize().domain([0.2,1])
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

// initialize

var k_ = 0;
for (var i = 0; i < MapRows+1; i++) {
	for (var j = 0; j < MapColumns; j++) {	
	
    	var x_ = j * dx + dx/2*(i%2);
    	var y_ = i * dx;
    	var z_ = (w - x_) * 0.001 + (y_ - MapRows/2 * dx)*(y_ - MapRows/2 * dx) / 20000 - w*0.001;
    	
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
	sed[i] = sedColors(pts[i].C); 
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
var svg_l = d3.select("#chart").append("svg")
    .attr("width", w)
    .attr("height", h)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var path_l = svg_l.selectAll("path");

path_l = path_l.data(d3_geom_voronoi(pts))
	.enter().append("path")
	.attr("d", function(d) { return "M" + d.join("L") + "Z"; })
	.style("fill", function(d, i) { return sedColors(0) })
	.attr("id", function(d,i) { return "path_l-"+i;});
		



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
		
		if (pts[i].depth > 0) {
		
			pts[i].C = 0.1;
			pts[i].Qs = pts[i].C * pts[i].volume;
		}
		}
	}
}



var draw_initial = function() {

	if (verbose) { console.log('draw_initial'); }

	recolor();

	path.transition().style("fill", function(d, i) { return colors[i]; });   
	path_l.transition().style("fill", function(d, i) { return sedColors(sed[i]); });   

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
	link_sed = [];

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
							discharge: Q});
							
		if ( md > 0 & Math.abs(Q) > 0) {
		
// 			taub = rho * g * md * Math.abs(slp);
			taub = rho * 0.05/8 * v_veg*v_veg;
			taub_s = taub / ((rho_s - rho) * g * D);
			qs_s = 8 * Math.pow((taub_s - tau_c),1.5);
			qs = qs_s * (D * Math.sqrt(((rho_s - rho)/rho) * g * D));
			Qs = qs * w_;
			C = Math.abs(Qs / Q);
							
			link_sed.push({taub: taub,
						   Qs: Qs,
						   C: C});
		
		} else {
		
			link_sed.push({taub: 0,
						   Qs: 0,
						   C: 0});
		
		}
							
}};




var update = function() {

	if (verbose) {
		console.log('update')
	}

	var src, trg, dir, Q, Qs;

	for (var i=0; i<node_links.length; i++) {

		src = node_links[i].source.k;
		trg = node_links[i].target.k;

		Q = link_geometry[i].discharge;
		Qs = link_sed[i].Qs;

		if (Q  > 0) {
			if (Q*dt < pts[src].volume) {
				pts[src].volume = pts[src].volume - Q*dt;
				pts[trg].volume = pts[trg].volume + Q*dt;
				pts[src].Qs = pts[src].Qs - Qs*dt;
				pts[trg].Qs = pts[trg].Qs + Qs*dt;
				
			} else {
				pts[src].volume = 0;
				pts[trg].volume = pts[trg].volume + pts[src].volume;
				pts[src].Qs = 0;
				pts[trg].Qs = pts[trg].Qs + pts[src].volume * link_sed[i].C;
			}
		}
		
		if (Q < 0) {
			if (Math.abs(Q*dt) < pts[trg].volume) {
				pts[src].volume = pts[src].volume + Math.abs(Q*dt);
				pts[trg].volume = pts[trg].volume - Math.abs(Q*dt);
				pts[src].Qs = pts[src].Qs + Math.abs(Qs*dt);
				pts[trg].Qs = pts[trg].Qs - Math.abs(Qs*dt);
			} else {
				pts[src].volume = pts[src].volume + pts[trg].volume;
				pts[trg].volume = 0;
				pts[src].Qs = pts[src].Qs + pts[trg].volume * link_sed[i].C;
				pts[trg].Qs = 0;
			}
		}

	}

	for (var i=0; i<pts.length; i++) {

		pts[i].depth = pts[i].volume / cell_area;

		if (pts[i].x < 50) {
			pts[i].depth = d3.max([pts[i].z, maxH]) - pts[i].z;
			if (pts[i].depth > 0) {
				pts[i].C = 0.1;
				pts[i].Qs = pts[i].C * pts[i].volume;
			}
		}
		
		pts[i].volume = pts[i].depth * cell_area;
		
		if (isNaN(pts[i].Qs) | isNaN(pts[i].C)){
			pts[i].C = 0;
			pts[i].Qs = 0;
		}
		
		if (pts[i].Qs <=0) {
		
			pts[i].C = 0;
			pts[i].Qs = 0;
		}
		
		if (pts[i].volume > 0 & pts[i].Qs > 0) {
		
			pts[i].C = pts[i].Qs / pts[i].volume;
// 			console.log(pts[i].Qs, pts[i].C)
		
		}
	}

	recolor();
	geometry();
	t = t + dt;

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
	sed.push(pts[i].C);
	}
	
	

}



var vegetate = function() {
	
	if (verbose) { console.log('vegetate'); }

	document.getElementById("plant").value = "Stop planting";
	document.getElementById("plant").onclick = function() {stopVeg();};
	document.getElementById("noplant").disabled = false;

	var nearby = [];

	svg.selectAll("path")
	.on("mouseover", function(d, i) {
  
		nearby = []
		svg.selectAll(".detectable").each(function () {
			if (neighboring(i, this.id) | neighboring(this.id,i)){
				nearby.push(this.id);
			}
		})
				
		for (var j = 0; j<nearby.length; j++){
			svg.select('path#path-'+nearby[j])
			.style('fill', function(d,i) {return greens(pts[nearby[j]].veg+1)});
		}})  

		 
	.on("mousedown", function(d,i) {

		for (var j = 0; j<nearby.length; j++){
			pts[nearby[j]].veg++;
			colors[nearby[j]] = greens(pts[nearby[j]].veg)
			
			console.log(pts[nearby[j]])
		}
		console.log('------------')
		path.style("fill", function(d, i) { return colors[i] });
	})


	.on("mouseout", function(d, i) {
	  path.style("fill", function(d, i) { return colors[i] }); 
	});


	var linkedByIndex = {};
	
	for (i = 0; i < pts.length; i++) { linkedByIndex[i + "," + i] = 1; }
	
	d3_geom_voronoi.links(pts).forEach(function (d) {
		linkedByIndex[d.source.k + "," + d.target.k] = 1;
	});


	function neighboring(a, b) { return linkedByIndex[a + "," + b]; }
        
}



var stopVeg = function() {
	
	if (verbose) { console.log('stopVeg'); }
	
	document.getElementById("plant").value = "Click to plant more vegetation";
	document.getElementById("plant").onclick = function() {vegetate();};

	svg.selectAll("path")
	.on("click", function(d, i) {if (pts[i].veg>3) { pts[i].veg = 3;}})

}


var resetVeg = function() {

	if (verbose) { console.log('resetVeg'); }

	for (var i=0; i<pts.length; i++){ pts[i].veg = 0; }

	document.getElementById("plant").value = "Click to plant vegetation";
	document.getElementById("plant").onclick = function() {vegetate();};
	document.getElementById("noplant").disabled = true;

	svg.selectAll("path").on("click", function(d, i) {})

	draw_initial();

}



var run_sim = function() {

	if (verbose) { console.log('run_sim'); }

	shots.push(colors);
	topo.push(sed);
	// this is a shallow clone and won't work! need to either loop through the interior arrays or to create 1 level arrays (like colors) that can be copied every time
	
	while (t < max_t) {
		update();
		shots.push(colors);
		topo.push(sed);
	}
	
	console.log('Run finished')
	
	document.getElementById("playvideo").disabled = false;
	
}




function Decrement() {

	console.log('time = ', (sl*dt).toFixed(2))
	
	// upper
	path.transition()
	   .duration(100)
	   .style("fill", function(d, j) { return shots.slice(sl,sl+1)[0][j] });
	   
	path_l.transition()
	   .duration(100)
	   .style("fill", function(d, j) { return sedColors(topo.slice(sl,sl+1)[0][j]) });

	sl++;
	if (sl==shots.length){sl = 0;}
 
    tv= setTimeout('Decrement()',vid_dt);
    
}

function play() {

    tv = setTimeout('Decrement()',vid_dt);
    document.getElementById("playvideo").disabled = true;
    document.getElementById("stopvideo").disabled = false;
    document.getElementById("slower").disabled = false;
    document.getElementById("faster").disabled = false;
    
}

function pause() { 

    clearTimeout(tv);
    tv=0;
    document.getElementById("playvideo").disabled = false;
    document.getElementById("stopvideo").disabled = true;
    document.getElementById("slower").disabled = true;
    document.getElementById("faster").disabled = true;
    
}


function slower() { vid_dt = vid_dt + 200; }
function faster() { vid_dt = vid_dt - 200; }



