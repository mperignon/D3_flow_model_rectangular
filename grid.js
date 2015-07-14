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
var edge_top = [];
var edge_right = [];
var edge_bottom = [];
var edge_left = [];
var interior = [];

var k_ = 0;
for (var i = 0; i < MapRows+1; i++) {
	for (var j = 0; j < MapColumns; j++) {	
	
		var flag = 0;
	
    	var x_ = j * dx// + dx/2*(i%2);
    	var y_ = i * dx;
    	var z_ = (w - x_) * S + (y_ - MapRows/2 * dx)*(y_ - MapRows/2 * dx) / 20000 - w*S;


    	// check edges
    	if (x_ < dx) { edge_left.push(k_);
    					flag = 1;}
    	if (x_ >= w - dx & flag == 0) { edge_right.push(k_);
    						flag = 1;}
    	if (y_ > h - dx & flag == 0) { edge_bottom.push(k_);
    						flag = 1;}
    	if (y_ < dx & flag == 0) { edge_top.push(k_);
    					flag = 1;}
    	if (flag == 0) {interior.push(k_);}
    	
    	pts.push({k: k_,
    			  x: x_,
    			  y: y_,
    			  z: z_,
    			  depth: 0,
    			  veg: 0,
    			  hu: 0,
    			  hv: 0,
    			  dh: 0,
    			  duh: 0,
    			  dvh: 0});
    	
    	
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
//     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
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

var set_initial = function() {

	if (verbose) { console.log('set_initial'); }

	for (var i=0; i<pts.length; i++) {
	
		stage = pts[i].z;
 	
		pts[i].depth = stage - pts[i].z + 0.0001;
		
	}
}
// 
// var geometry = function() {
// 
// 	if (verbose) {
// 		console.log('geometry')
// 	}
// 	
// 	var mannings = function(depth,slope) {
// 		if (depth>0) {
// 			velocity = (1/n) * Math.pow(depth, 2/3) * Math.pow(Math.abs(slope),1/2);
// 		} else { velocity = 0; }
// 		return velocity	
// 	}
// 	
// 	var stage_src, stage_trg;
// 	var dist, slp, wslp, w_, md, v_, Q;
// 	var v_veg, v_source, v_target;
// 	var taub, taub_s, qs_s, qs, Qs, C;
// 
// 	node_links = d3_geom_voronoi.links(pts);
// 	link_geometry = [];
// // 	link_sed = [];
// 
// 	for (var i=0; i<node_links.length; i++) {
// 	
// 		d = node_links[i];
// 	
// 		dist = Math.sqrt(Math.pow(d.source.x - d.target.x,2) + Math.pow(d.source.y - d.target.y,2));
// 		slp = (d.source.z - d.target.z) / dist;
// 	
// 		stage_src = d.source.z + d.source.depth;
// 		stage_trg = d.target.z + d.target.depth;
// 		wslp = (stage_src - stage_trg) / dist;
// 	
// 		if (d.source.y == d.target.y) { w_ = dx; } else { w_ = Math.sqrt(dx*dx / 2); }
// 	
// 	
// 		md = (d.source.depth + d.target.depth) / 2;
// 		if (md<0) { md = 0;};
// 		
// 		v_ = mannings(md, wslp);
// 	
// 		v_source = 0.5 * Cd * alpha[d.source.veg] * v_*v_ * 0.5*dt;
// 		v_target = 0.5 * Cd * alpha[d.target.veg] * v_*v_ * 0.5*dt;
// 		
// 		console.log(v_)
// 	
// 		v_veg = v_ - v_source - v_target;
// 	
// 		if (v_veg < 0) { v_veg = 0;}
// 		if (v_veg > v_) { console.log('alert!', v_veg, v_);}
// 	
// 		Q = md * w_ * v_veg * Math.sign(wslp);
// 
// 		link_geometry.push({distance: dist,
// 	// 						bed_slope: slp,
// 							water_slope: wslp,
// 							width: w_,
// 							mid_depth: md,
// 							velocity: v_veg,
// 							discharge: Q,
// 							time: dist/v_veg});
// 
// }};

var geometry_fvm = function() {

	if (verbose) {
		console.log('geometry_fvm')
	}

var i, j, k, ui, vi, hi, uj, vj, hj, uk, vk, hk, ghh;

var lffu1 = [];
var lffu2 = [];
var lffv1 = [];
var lffv3 = [];
var huv = [];

for (var i=0; i<pts.length; i++) {

	ui = pts[i].hu / pts[i].depth;
	vi = pts[i].hv / pts[i].depth;
	hi = pts[i].depth;
	
	huv.push(ui*vi*hi);
	ghh = 0.5 * hi*hi;
	
	lffu1.push(hi*ui);
	lffu2.push(hi*ui*ui + ghh);
	
	lffv1.push(hi*vi);
	lffv3.push(hi*vi*vi + ghh);
	
}

var lambdau, lambdav, fluxxh, fluxxu, fluxxv, fluxyh, fluxyu, fluxyv;

for (var i_=0; i_<interior.length; i_++) {

	i = interior[i_];
	
	//////////////////// TO THE RIGHT AND DOWN /////////////////////////////
	j = i+1;
	k = i+MapColumns;

	hi = pts[i].depth;	
	if (hi<=0) {
		hi = 0;
		ui = 0;
		vi = 0;	
	} else {
		ui = pts[i].hu / pts[i].depth;
		vi = pts[i].hv / pts[i].depth;
	}	
	
	hj = pts[j].depth;	
	if (hj<=0) {
		hj = 0;
		uj = 0;
		vj = 0;	
	} else {
		uj = pts[j].hu / pts[j].depth;
		vj = pts[j].hv / pts[j].depth;
	}	
	
	hk = pts[k].depth;	
	if (hk<=0) {
		hk = 0;
		uk = 0;
		vk = 0;	
	} else {
		uk = pts[k].hu / pts[k].depth;
		vk = pts[k].hv / pts[k].depth;
	}	
							
	lambdau = 0.5 * Math.abs(ui + uj) + Math.sqrt(0.5 * g * (hi + hj));
	lambdav = 0.5 * Math.abs(vi + vk) + Math.sqrt(0.5 * g * (hi + hk));
	
// 	console.log(lambdau, lambdav)
	
	// to the right
	fluxxh = 0.5 * (lffu1[i] + lffu1[j]) - 0.5 * lambdau * (hj - hi);
	fluxxu = 0.5 * (lffu2[i] + lffu2[j]) - 0.5 * lambdau * (uj*hj - ui*hi);
	fluxxv = 0.5 * (huv[i] + huv[j]) - 0.5 * lambdau * (vj*hj - vi*hi);
	
	// down
	fluxyh = 0.5 * (lffv1[i] + lffv1[k]) - 0.5 * lambdav * (hk - hi);
	fluxyu = 0.5 * (huv[i] + huv[k]) - 0.5 * lambdav * (uk*hk - ui*hi);
	fluxyv = 0.5 * (lffv3[i] + lffv3[k]) - 0.5 * lambdav * (vk*hk - vi*hi);
	
	var dh = - (dt/dx) * fluxxh - (dt/dy) * fluxyh;
	var duh = - (dt/dx) * fluxxu - (dt/dy) * fluxyu;
	var dvh = - (dt/dx) * fluxxv - (dt/dy) * fluxyv;
	
	//////////////////////// TO THE LEFT AND UP //////////////////////
	j = i-1;
	k = i-MapColumns;
	
	hj = pts[j].depth;	
	if (hj<=0) {
		hj = 0;
		uj = 0;
		vj = 0;	
	} else {
		uj = pts[j].hu / pts[j].depth;
		vj = pts[j].hv / pts[j].depth;
	}	
	
	hk = pts[k].depth;	
	if (hk<=0) {
		hk = 0;
		uk = 0;
		vk = 0;	
	} else {
		uk = pts[k].hu / pts[k].depth;
		vk = pts[k].hv / pts[k].depth;
	}		
							
	lambdau = 0.5 * Math.abs(ui + uj) + Math.sqrt(0.5 * g * (hi + hj));
	lambdav = 0.5 * Math.abs(vi + vk) + Math.sqrt(0.5 * g * (hi + hk));
	
// 	console.log(lambdau, lambdav, ui, uj, vi, vk, hi, hj, hk)
// 	console.log('----')
	
	// to the left
	fluxxh = 0.5 * (lffu1[i] + lffu1[j]) - 0.5 * lambdau * (hi - hj);
	fluxxu = 0.5 * (lffu2[i] + lffu2[j]) - 0.5 * lambdau * (ui*hi - uj*hj);
	fluxxv = 0.5 * (huv[i] + huv[j]) - 0.5 * lambdau * (vi*hi - vj*hj);
	
	// up
	fluxyh = 0.5 * (lffv1[i] + lffv1[k]) - 0.5 * lambdav * (hi - hk);
	fluxyu = 0.5 * (huv[i] + huv[k]) - 0.5 * lambdav * (ui*hi - uk*hk);
	fluxyv = 0.5 * (lffv3[i] + lffv3[k]) - 0.5 * lambdav * (vi*hi - vk*hk);
	
	pts[i].dh = dh + (dt/dx) * fluxxh + (dt/dy) * fluxyh;
	pts[i].duh = duh + (dt/dx) * fluxxu + (dt/dy) * fluxyu;
	pts[i].dvh = dvh + (dt/dx) * fluxxv + (dt/dy) * fluxyv;
	

	
}// 


};
