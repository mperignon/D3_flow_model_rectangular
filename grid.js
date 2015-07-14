var margin = {
    top: dx,
    right: dx,
    bottom: dx,
    left: dx
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
var initial_z = [];

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
    			  dvh: 0,
    			  Ch: 0,
    			  dChx: 0,
    			  dChy: 0});
    			  
    	initial_z.push(z_);
    	
    	
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
    .attr("width", w - 2*dx)
    .attr("height", h - 2*dx)
    .append("g")
     .attr("transform", "translate(" + dx + "," + dx + ")");
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


var geometry_fvm = function() {

	if (verbose) {
		console.log('geometry_fvm')
	}

var i, j, k, ui, vi, hi, uj, vj, hj, uk, vk, hk, ghh, Ci, Cj, Ck;

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

var lambdau, lambdav, fluxxh, fluxxu, fluxxv, fluxyh, fluxyu, fluxyv, fluxxCx, fluxxCy, fluxyCx, fluxyCy;

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
		Ci = 0;	
	} else {
		ui = pts[i].hu / pts[i].depth;
		vi = pts[i].hv / pts[i].depth;
		Ci = pts[i].Ch / pts[i].depth;
	}	
	
	hj = pts[j].depth;	
	if (hj<=0) {
		hj = 0;
		uj = 0;
		vj = 0;
		Cj = 0;
	} else {
		uj = pts[j].hu / pts[j].depth;
		vj = pts[j].hv / pts[j].depth;
		Cj = pts[j].Ch / pts[j].depth;
	}	
	
	hk = pts[k].depth;	
	if (hk<=0) {
		hk = 0;
		uk = 0;
		vk = 0;	
		Ck = 0;
	} else {
		uk = pts[k].hu / pts[k].depth;
		vk = pts[k].hv / pts[k].depth;
		Ck = pts[k].Ch / pts[k].depth;
	}	
							
	lambdau = 0.5 * Math.abs(ui + uj) + Math.sqrt(0.5 * g * (hi + hj));
	lambdav = 0.5 * Math.abs(vi + vk) + Math.sqrt(0.5 * g * (hi + hk));
	
// 	console.log(lambdau, lambdav)
	
	// to the right
	fluxxh = 0.5 * (lffu1[i] + lffu1[j]) - 0.5 * lambdau * (hj - hi);
	fluxxu = 0.5 * (lffu2[i] + lffu2[j]) - 0.5 * lambdau * (uj*hj - ui*hi);
	fluxxv = 0.5 * (huv[i] + huv[j]) - 0.5 * lambdau * (vj*hj - vi*hi);
	
	fluxxCx = fluxxu * 0.5 * (Ci + Cj);
	fluxxCy = fluxxv * 0.5 * (Ci + Cj);
	
	// down
	fluxyh = 0.5 * (lffv1[i] + lffv1[k]) - 0.5 * lambdav * (hk - hi);
	fluxyu = 0.5 * (huv[i] + huv[k]) - 0.5 * lambdav * (uk*hk - ui*hi);
	fluxyv = 0.5 * (lffv3[i] + lffv3[k]) - 0.5 * lambdav * (vk*hk - vi*hi);
	
	fluxyCx = fluxyu * 0.5 * (Ci + Ck);
	fluxyCy = fluxyv * 0.5 * (Ci + Ck);
	
	
	var dh = - (dt/dx) * fluxxh - (dt/dy) * fluxyh;
	var duh = - (dt/dx) * fluxxu - (dt/dy) * fluxyu;
	var dvh = - (dt/dx) * fluxxv - (dt/dy) * fluxyv;
	var dChx = - (dt/dx) * fluxxCx - (dt/dy) * fluxyCx;
	var dChy = - (dt/dx) * fluxxCy - (dt/dy) * fluxyCy;
	
	//////////////////////// TO THE LEFT AND UP //////////////////////
	j = i-1;
	k = i-MapColumns;
	
	hj = pts[j].depth;	
	if (hj<=0) {
		hj = 0;
		uj = 0;
		vj = 0;
		Cj = 0;
	} else {
		uj = pts[j].hu / pts[j].depth;
		vj = pts[j].hv / pts[j].depth;
		Cj = pts[j].Ch / pts[j].depth;
	}	
	
	hk = pts[k].depth;	
	if (hk<=0) {
		hk = 0;
		uk = 0;
		vk = 0;	
		Ck = 0;
	} else {
		uk = pts[k].hu / pts[k].depth;
		vk = pts[k].hv / pts[k].depth;
		Ck = pts[k].Ch / pts[k].depth;
	}			
							
	lambdau = 0.5 * Math.abs(ui + uj) + Math.sqrt(0.5 * g * (hi + hj));
	lambdav = 0.5 * Math.abs(vi + vk) + Math.sqrt(0.5 * g * (hi + hk));
	
// 	console.log(lambdau, lambdav, ui, uj, vi, vk, hi, hj, hk)
// 	console.log('----')
	
	// to the left
	fluxxh = 0.5 * (lffu1[i] + lffu1[j]) - 0.5 * lambdau * (hi - hj);
	fluxxu = 0.5 * (lffu2[i] + lffu2[j]) - 0.5 * lambdau * (ui*hi - uj*hj);
	fluxxv = 0.5 * (huv[i] + huv[j]) - 0.5 * lambdau * (vi*hi - vj*hj);
	
	fluxxCx = fluxxu * 0.5 * (Ci + Cj);
	fluxxCy = fluxxv * 0.5 * (Ci + Cj);
	
	// up
	fluxyh = 0.5 * (lffv1[i] + lffv1[k]) - 0.5 * lambdav * (hi - hk);
	fluxyu = 0.5 * (huv[i] + huv[k]) - 0.5 * lambdav * (ui*hi - uk*hk);
	fluxyv = 0.5 * (lffv3[i] + lffv3[k]) - 0.5 * lambdav * (vi*hi - vk*hk);
	
	fluxyCx = fluxyu * 0.5 * (Ci + Ck);
	fluxyCy = fluxyv * 0.5 * (Ci + Ck);
	
	
	pts[i].dh = dh + (dt/dx) * fluxxh + (dt/dy) * fluxyh;
	pts[i].duh = duh + (dt/dx) * fluxxu + (dt/dy) * fluxyu;
	pts[i].dvh = dvh + (dt/dx) * fluxxv + (dt/dy) * fluxyv;
	
	pts[i].dChx = dChx + (dt/dx) * fluxxCx + (dt/dy) * fluxyCx;
	pts[i].dChy = dChy + (dt/dx) * fluxxCy + (dt/dy) * fluxyCy;

	
}// 


};
