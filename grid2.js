var browns = d3.scale.linear().domain([0,0.5])
.range(["#fee391","#fec44f","#fe9929","#ec7014","#cc4c02","#993404","#662506"]);
var greens = d3.scale.quantize().domain([1,3]).range(["#addd8e","#41ab5d","#006837"])
var alpha = [0, 0.04, 0.4, 1];

var rows = Math.ceil(h / sz);
var cols = Math.ceil(w / sz);

var initial_z = [];

var k=0;
var pts = d3.range(0, rows * cols).map(function (d,i) {
  var col = d % cols;
  var row = (d - col) / cols;
  
  var x_ = col * sz + r;
  var y_ = row * sz + r;
  var z_ = (w - x_) * S + (y_ - rows/2 * sz)*(y_ - rows/2 * sz) / 25000 - w*S;
  
  initial_z.push(z_);
  
  return {
    r: row,
    c: col,
    x: x_,
    y: y_,
    z: z_,
    k: i,
    veg: 0,
    depth: 0.001,
	hu: 0,
	hv: 0,
	dh: 0,
	duh: 0,
	dvh: 0,
	Ch: 0,
	dChx: 0,
	dChy: 0
  };
});

var colors = pts.map( function (d) { return browns(d.z) });
var colors_sed = pts.map( function (d) { return 0 });

var midpt = pts.length/2 + cols/2;

var svg = d3.select("body").append("svg")
    .attr("width", w)
    .attr("height", h);
var svg2 = d3.select("body").append("svg")
    .attr("width", w)
    .attr("height", h);

var rectx = function(d) { return d.x - r; };
var recty = function(d) { return d.y - r; };

var tailx = function(d) { return d.dx > 0 ? d.sx - r : rectx(d) - d.dx * sz; };
var taily = function(d) { return d.dy > 0 ? d.sy - r : recty(d) - d.dy * sz; };
var tailw = function(d) { return d.dx == 0 ? sz : d.sz = (d.x - d.sx) * d.dx; };
var tailh = function(d) { return d.dy == 0 ? sz : d.sz = (d.y - d.sy) * d.dy; };

var topCell = function(c) { return pts[Math.max(0, c.r - 1) * cols + c.c]; };
var leftCell = function(c) { return pts[c.r * cols + Math.max(0, c.c - 1)]; };
var bottomCell = function(c) { return pts[Math.min(rows - 1, c.r + 1) * cols + c.c]; };
var rightCell = function(c) { return pts[c.r * cols + Math.min(cols - 1, c.c + 1)]; };

var topLeftCell = function(c) { return pts[Math.max(0, c.r - 1) * cols + Math.max(0, c.c - 1)]; };
var bottomLeftCell = function(c) { return pts[Math.min(rows - 1, c.r + 1) * cols + Math.max(0, c.c - 1)]; };
var bottomRightCell = function(c) { return pts[Math.min(rows - 1, c.r + 1) * cols + Math.min(cols - 1, c.c + 1)]; };
var topRightCell = function(c) { return pts[Math.max(0, c.r - 1) * cols + Math.min(cols - 1, c.c + 1)]; };

var cell = svg.selectAll(".cell")
  .data(pts)
  .enter().append("rect")
  .attr("class", function(d) { 
  return "cell " + ((d.isWall = d.c == 0 || d.c == cols - 1 || d.r == 0 || d.r == rows - 1) ? "wall" : "field");
  })
  .attr("x", rectx)
  .attr("y", recty)
  .attr("width", sz)
  .attr("height", sz)
  .attr("fill", function(d,i) { return colors[i]; })
  .attr("stroke", function(d,i) { return colors[i]; })
  .each(function(d) {
    d.elnt = d3.select(this);
  });
  
  
var cell2 = svg2.selectAll(".cell")
  .data(pts)
  .enter().append("rect")
  .attr("class", function(d) { 
  return "cell " + ((d.isWall = d.c == 0 || d.c == cols - 1 || d.r == 0 || d.r == rows - 1) ? "wall" : "field");
  })
  .attr("x", rectx)
  .attr("y", recty)
  .attr("width", sz)
  .attr("height", sz)
  .attr("fill", function(d,i) { return sedColors(colors_sed[i]); })
  .attr("stroke", function(d,i) { return sedColors(colors_sed[i]); });





var geometry = function() {

	if (verbose) {
		console.log('geometry')
	}

var lffu1 = [];
var lffu2 = [];
var lffv1 = [];
var lffv3 = [];
var huv = [];

var i, j, k, ui, vi, hi, uj, vj, hj, uk, vk, hk, ghh, Ci, Cj, Ck;

svg.selectAll(".cell").each( function(d) {

	ui = d.hu / d.depth;
	vi = d.hv / d.depth;
	hi = d.depth;
	
	huv.push(ui*vi*hi);
	ghh = 0.5 * g * hi*hi;
	
	lffu1.push(hi*ui);
	lffu2.push(hi*ui*ui + ghh);
	
	lffv1.push(hi*vi);
	lffv3.push(hi*vi*vi + ghh);

});




var lambdau, lambdav, fluxxh, fluxxu, fluxxv, fluxyh, fluxyu, fluxyv, fluxxCx, fluxxCy, fluxyCx, fluxyCy;



svg.selectAll(".field").each( function(d) {


	
	//////////////////// TO THE RIGHT AND DOWN /////////////////////////////


	hi = d.depth;	
	if (hi<=0.001) {
		hi = 0.001;
		ui = 0;
		vi = 0;
		Ci = 0;	
	} else {
		ui = d.hu / d.depth;
		vi = d.hv / d.depth;
		Ci = d.Ch / d.depth;
	}
	
	var right = rightCell(d);
	
	hj = right.depth;	
	if (hj<=0.001) {
		hj = 0.001;
		uj = 0;
		vj = 0;
		Cj = 0;
	} else {
		uj = right.hu / right.depth;
		vj = right.hv / right.depth;
		Cj = right.Ch / right.depth;
	}	
	
	var down = bottomCell(d);
	
	hk = down.depth;	
	if (hk<=0.001) {
		hk = 0.001;
		uk = 0;
		vk = 0;	
		Ck = 0;
	} else {
		uk = down.hu / down.depth;
		vk = down.hv / down.depth;
		Ck = down.Ch / down.depth;
	}
	

	
	i = d.k;
	j = right.k;
	k = down.k;
							
	lambdau = 0.5 * Math.abs(ui + uj) + Math.sqrt(0.5 * g * (hi + hj));
	lambdav = 0.5 * Math.abs(vi + vk) + Math.sqrt(0.5 * g * (hi + hk));
	
	// to the right
	fluxxh = 0.5 * (lffu1[i] + lffu1[j]) - 0.5 * lambdau * (hj - hi);
	fluxxu = 0.5 * (lffu2[i] + lffu2[j]) - 0.5 * lambdau * (uj*hj - ui*hi);
	fluxxv = 0;//0.5 * (huv[i] + huv[j]) - 0.5 * lambdau * (vj*hj - vi*hi);
	
	fluxxCx = 0.5 * (hi + hj) * 0.5 * (ui + uj) * 0.5 * (Ci + Cj);
	fluxxCy = 0.5 * (hi + hj) * 0.5 * (vi + vj) * 0.5 * (Ci + Cj);
	
	// down
	fluxyh = 0.5 * (lffv1[i] + lffv1[k]) - 0.5 * lambdav * (hk - hi);
	fluxyu = 0;//0.5 * (huv[i] + huv[k]) - 0.5 * lambdav * (uk*hk - ui*hi);
	fluxyv = 0.5 * (lffv3[i] + lffv3[k]) - 0.5 * lambdav * (vk*hk - vi*hi);
	
	fluxyCx = 0.5 * (hi + hk) * 0.5 * (ui + uk) * 0.5 * (Ci + Ck);
	fluxyCy = 0.5 * (hi + hk) * 0.5 * (vi + vk) * 0.5 * (Ci + Ck);
	
	
	var dh = (dt/dx) * fluxxh + (dt/dy) * fluxyh;
	var duh =  (dt/dx) * fluxxu + (dt/dy) * fluxyu;
	var dvh =  (dt/dx) * fluxxv + (dt/dy) * fluxyv;
	var dChx = (dt/dx) * fluxxCx + (dt/dy) * fluxyCx;
	var dChy = (dt/dx) * fluxxCy + (dt/dy) * fluxyCy;
	
	//////////////////////// TO THE LEFT AND UP //////////////////////

	var left = leftCell(d);

	hj = left.depth;	
	if (hj<=0.001) {
		hj = 0.001;
		uj = 0;
		vj = 0;
		Cj = 0;
	} else {
		uj = left.hu / left.depth;
		vj = left.hv / left.depth;
		Cj = left.Ch / left.depth;
	}	
	
	var up = topCell(d);
	
	hk = up.depth;	
	if (hk<=0.001) {
		hk = 0.001;
		uk = 0;
		vk = 0;	
		Ck = 0;
	} else {
		uk = up.hu / up.depth;
		vk = up.hv / up.depth;
		Ck = up.Ch / up.depth;
	}			

	
	j = left.k;
	k = up.k;
							
	lambdau = 0.5 * Math.abs(ui + uj) + Math.sqrt(0.5 * g * (hi + hj));
	lambdav = 0.5 * Math.abs(vi + vk) + Math.sqrt(0.5 * g * (hi + hk));
	
// 	console.log(lambdau, lambdav, ui, uj, vi, vk, hi, hj, hk)
// 	console.log('----')
	
	// to the left
	fluxxh = 0.5 * (lffu1[i] + lffu1[j]) - 0.5 * lambdau * (hi - hj);
	fluxxu = 0.5 * (lffu2[i] + lffu2[j]) - 0.5 * lambdau * (ui*hi - uj*hj);
	fluxxv = 0;//0.5 * (huv[i] + huv[j]) - 0.5 * lambdau * (vi*hi - vj*hj);
	
	fluxxCx = 0.5 * (hi + hj) * 0.5 * (ui + uj) * 0.5 * (Ci + Cj);
	fluxxCy = 0.5 * (hi + hj) * 0.5 * (vi + vj) * 0.5 * (Ci + Cj);
	
	// up
	fluxyh = 0.5 * (lffv1[i] + lffv1[k]) - 0.5 * lambdav * (hi - hk);
	fluxyu = 0;//0.5 * (huv[i] + huv[k]) - 0.5 * lambdav * (ui*hi - uk*hk);
	fluxyv = 0.5 * (lffv3[i] + lffv3[k]) - 0.5 * lambdav * (vi*hi - vk*hk);
	
	fluxyCx = 0.5 * (hi + hk) * 0.5 * (ui + uk) * 0.5 * (Ci + Ck);
	fluxyCy = 0.5 * (hi + hk) * 0.5 * (vi + vk) * 0.5 * (Ci + Ck);
	
	
	
	////////////////////////////////////////
	
	var slpx = (((left.z+left.depth) - (d.z+d.depth))/dx+((d.z+d.depth) - (right.z+right.depth))/dx)/2;
	var slpy = (((up.z+up.depth) - (d.z+d.depth))/dy+((d.z+d.depth) - (down.z+down.depth))/dy)/2;
	
	d.dh = -dh + (dt/dx) * fluxxh + (dt/dy) * fluxyh;
	d.duh = -duh + (dt/dx) * fluxxu + (dt/dy) * fluxyu;// - g*slpx;
	d.dvh = -dvh + (dt/dx) * fluxxv + (dt/dy) * fluxyv;// - g*slpy;
	
	d.dChx = 0//dChx + (dt/dx) * fluxxCx + (dt/dy) * fluxyCx;
	d.dChy = 0//dChy + (dt/dx) * fluxxCy + (dt/dy) * fluxyCy;
	
	if (d.depth < minh) {

	d.dChx = 0;
	d.dChy = 0;
	
	}

})
}


///////////////////////////////////////////////////////////////////////////


Ke = 12 * D * Math.sqrt(R * g * D);
vs = (R * g * D*D) / (18*nu - Math.pow((0.75*0.4 * g * R * D*D*D),2));
var update = function() {

	geometry();

	if (verbose) {
		console.log('update')
	}
	
	
	svg.selectAll(".field").each( function(d) {
	
		if (d.veg>0.1 && d.depth>0.001) {
		
			var u_ = d.hu / d.depth;
			var v_ = d.hv / d.depth;
		
			var u_veg = 0.5 * Cd * alpha[d.veg] * u_*u_ * dt;
			d.duh = d.duh - u_veg*d.depth;
			
			var v_veg = 0.5 * Cd * alpha[d.veg] * v_*v_ * dt;
			d.dvh = d.dvh - v_veg*d.depth;
		
		}
		
	
		d.depth = d.depth + d.dh;
		d.hu = d.hu + d.duh;
		d.hv = d.hv + d.dvh;
		
		if (d.depth <= 0) {
		
			d.depth = 0.001;
			d.hu = 0;
			d.hv = 0;		
		}
		

	})
	
svg.selectAll(".wall").each( function(d) {

	d.depth = 0.001;
	d.hv = 0;
	d.hu = 0;
	
	if (d.c == 0) {
		var stage = d3.max([d.z, pts[midpt].z+maxH]);
		d.depth = stage - d.z+0.001;
		d.hu = 1/n * Math.pow(d.depth,1.66) * Math.pow(Math.abs(d.z - rightCell(d).z)/dx,0.5);
		d.hv = 0;
	}


})


	t = t + dt;
}


var update_sed = function () {

var tau_s, edot, ddot;
var tau_b, diff;


svg.selectAll(".wall").each( function(d) {

	d.dChx = 0;
	d.dChy = 0;
	d.Ch = 0;
	
	if (d.c == 0) {
		d.Ch = d.depth*Co;
		d.dChy = 0;
		d.dChx = 0;
	}

})

svg.selectAll(".field").each( function(d) {


	// erosion and deposition
	var h = d.depth;
	
	if (h>minh) {
	
	var C = d.Ch / h;
	
	var slopex = Math.abs(d.z - rightCell(d).z)/dx;
	var slopey = slopex;
	// if (d.z>bottomCell(d).z) {
// 		slopey = Math.abs(d.z - bottomCell(d).z)/dy;
// 	} else {
// 		slopey = Math.abs(d.z - topCell(d).z)/dy;
// 	}
	
	var slope = Math.sqrt(Math.pow(slopex,2) + Math.pow(slopey,2));

	var tau_b = rho * g * h * slope;
	var tau_s = tau_b / ((rho_s - rho) * g * D);
	
	var edot = d3.min([d3.max([Ke * (tau_s - tau_c),0]),0.0005*dt]);
	var ddot = d3.min([C*vs,0.0005*dt]);
	
	var diff = ddot - edot;
	
	d.Ch = d3.max([d.Ch + d.dChx + d.dChy - diff*dt,0]);
	
	// dz/dt
	var dz = diff*dt/(1-porosity);
	
	d.z = d.z + dz;
	//d.depth = d.depth - dz;
// 	console.log(diff, dz)
	//console.log(edot, ddot, diff, dz)
	

	} else {
	
        d.Ch = 0;
        d.dChy = 0;
        d.dChx = 0;
    }
	

})


}

