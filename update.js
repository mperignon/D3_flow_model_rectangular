
var update_fvm = function() {

	geometry_fvm();

	if (verbose) {
		console.log('update_fvm')
	}


	for (var i=0; i<pts.length; i++) {
	
		if (pts[i].veg>0.1) {
		
			var u_ = pts[i].hu / pts[i].depth;
			var v_ = pts[i].hv / pts[i].depth;
		
			var u_veg = 0.5 * Cd * alpha[pts[i].veg] * u_*u_ * dt;
			pts[i].duh = pts[i].duh - u_veg*pts[i].depth;
			
			var v_veg = 0.5 * Cd * alpha[pts[i].veg] * v_*v_ * dt;
			pts[i].dvh = pts[i].dvh - v_veg*pts[i].depth;
		
		}
		
	
		pts[i].depth = pts[i].depth + pts[i].dh;
		pts[i].hu = d3.max([pts[i].hu + pts[i].duh,0]);
		pts[i].hv = d3.max([pts[i].hv + pts[i].dvh,0]);
		pts[i].hv
		
		if (pts[i].depth <= 0) {
			pts[i].depth = 0.0001;
			pts[i].hu = 0;
			pts[i].hv = 0;
		
		}
		

	}
	for (var i=0; i<edge_top.length; i++) {
		var i_ = edge_top[i];
		pts[i_].depth = pts[i_+MapColumns].depth*0.1;
		pts[i_].hv = pts[i_+MapColumns].depth*0.5;
		pts[i_].hu = 0;
	}
		for (var i=0; i<edge_bottom.length; i++) {
		var i_ = edge_bottom[i];
		pts[i_].depth = pts[i_-MapColumns].depth*0.1;
		pts[i_].hv = pts[i_-MapColumns].depth*0.5;
		pts[i_].hu = 0;
	}
		for (var i=0; i<edge_right.length; i++) {
		var i_ = edge_right[i];
		pts[i_].depth = pts[i_-1].depth*0.9;
		pts[i_].hu = pts[i_].depth*0.5;
		pts[i_].hv = pts[i_-1].hv;
	}
	for (var i=0; i<edge_left.length; i++) {
		var i_ = edge_left[i];
		var stage = d3.max([pts[i_].z+0.0001, maxH]);
		pts[i_].depth = stage - pts[i_].z;
		pts[i_].hu = pts[i_+1].hu;
		pts[i_].hv = pts[i_+1].hv;
	}
	
	recolor();
	t = t + dt;
}



var elev;

var update_sed = function () {

elev = [];
var Edot = [];
var Ddot = [];
var tau_s, edot, ddot;
var tau_b, diff;


	for (var i=0; i<edge_top.length; i++) {
		var i_ = edge_top[i];
		pts[i_].dChx = pts[i_+MapColumns].dChx;
		pts[i_].dChy = pts[i_+MapColumns].dChy;
	}
		for (var i=0; i<edge_bottom.length; i++) {
		var i_ = edge_bottom[i];
		pts[i_].dChx = pts[i_-MapColumns].dChx;
		pts[i_].dChy = pts[i_-MapColumns].dChy;
	}
		for (var i=0; i<edge_right.length; i++) {
		var i_ = edge_right[i];
		pts[i_].dChx = pts[i_-1].dChx;
		pts[i_].dChy = pts[i_-1].dChy;
		
	}
	for (var i=0; i<edge_left.length; i++) {
		var i_ = edge_left[i];
		pts[i_].dChx = Co*pts[i_].depth;
		pts[i_].dChy = Co*pts[i_].depth;
	}




for (var i=0; i<pts.length; i++) {

	// do dCh/dt here, set new C
	// then do dz/dt here

	// erosion and deposition
	var h = pts[i].depth;
	
	if (h>minh) {
	
	var C = pts[i].Ch / h;

	tau_b = rho * g * h * S;
	tau_s = tau_b / ((rho_s - rho) * g * D);
	
	edot = d3.max([Ke * (tau_s - tau_c),0]);
	ddot = C*vs;
	
	diff = ddot - edot;
	
	pts[i].Ch = d3.max([pts[i].Ch + pts[i].dChx + pts[i].dChy - diff*dt,0]);
	
	// dz/dt
	var dz = diff*dt/(1-porosity);
	
	pts[i].z = pts[i].z + dz;
	pts[i].depth = pts[i].depth + dz;
	
	if (pts[i].depth <= 0) {pts[i].Ch = 0;}
		
	}
	
	
	for (var i=0; i<edge_left.length; i++) {
		var i_ = edge_left[i];
		pts[i_].z = initial_z[i_];
		var stage = d3.max([pts[i_].z+0.0001, maxH]);
		pts[i_].depth = stage - pts[i_].z;
	}
	
	elev.push(browns(pts[i].z));

}
	
}



